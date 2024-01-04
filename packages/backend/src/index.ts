import express from 'express';
import dotenv from "@jsdotenv/core";
import path from 'path';
import moment from 'moment'
import fs from 'fs'
import fileload from 'express-fileupload'
import { IPosition, getOriginalPosition } from './utils/stack-parser';
import crypto from 'crypto';
import { InfluxDB, Point } from '@influxdata/influxdb-client'

const envPath = path.resolve(__dirname + "/../.env");
dotenv.load([envPath]);

const port = process.env.PORT;

const app = express();
app.use(fileload());
app.use(express.json());

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086'

const client = new InfluxDB({ url, token });
const org = `web-errors`
const bucket = `errors`

const writeClient = client.getWriteApi(org, bucket, 'ns');
const queryClient = client.getQueryApi(org);

interface IStack {
  mode: string;
  name: string;
  message: string;
  stack: {
    url: string;
    func: string;
    args: string;
    line: number;
    column: number;
  }[]
}
app.get('/reportError', (req, res) => {
  const message: string = req.query.message as string || '';
  const error = JSON.parse(atob(message)) as IStack;

  const stackString = error.stack.map(stackFrame => `${stackFrame.url}:${stackFrame.func}:${stackFrame.line}:${stackFrame.column}`).join('|');
  const errorString = `${error.mode}:${error.name}:${error.message}:${stackString}`;
  const hash = crypto.createHash('SHA-256').update(errorString).digest('hex');
  console.log('error', error.message)

  const point = new Point('errors')
    .tag('mode', error.mode)
    .tag('name', error.name)
    .tag('message', error.message)
    .stringField('hash', hash)
    .stringField('errorData', JSON.stringify(error));
  writeClient.writePoint(point);
  writeClient.flush()

  res.status(200).send('Error received');
});

// 根据时间段查询所有错误 错误数量以 second 和 hash 为纬度聚合
app.get('/vitualError', (req, res) => {
  const { startTime, endTime } = req.query;

  const fluxQuery = `
  import "date"

  from(bucket: "errors")
  |> range(start: time(v: ${startTime}), stop: time(v: ${endTime}))
  |> filter(fn: (r) => r["_measurement"] == "errors")
  |> filter(fn: (r) => r["_field"] == "hash")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> map(fn: (r) => ({ r with second: date.truncate(t: r._time, unit: 1s) }))
  |> group(columns: ["second", "hash"])
  |> reduce(identity: {count: 0,message: "",second: time(v: "1970-01-01T00:00:00Z")}, 
      fn: (r, accumulator) => ({ count: accumulator.count + 1,second: r.second, message: if exists r.message then r.message else "unknow error"  }))
  `;

  const hashMap = {};
  queryClient.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      const { hash } = o;
      if (hashMap[hash]) {
        hashMap[hash].push(o)
      } else {
        hashMap[hash] = [o]
      }
    },
    error(error) {
      console.error(error);
      res.status(500).send(error);
    },
    complete() {
      res.json({
        data: hashMap
      });
    },
  });
})

// 定时任务 一段时间内错误数量超过阈值发送邮件告警

// 设置时间数量阈值

app.post('/sourcemap', (req, res) => {
  const date = moment().format('YYYY-MM-DD-HH-mm-ss');
  const dir = path.join(__dirname, 'uploads/sourcemap', date);
  fs.mkdirSync(dir, { recursive: true });
  if (req.files) {
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files]
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      fs.writeFileSync(filePath, file.data);
    }
  }
  res.status(200).send('success');
})

// 解析错误
app.post('/parseError', async (req, res) => {
  const { startTime, endTime, hash } = req.body;
  const fluxQuery = `
    from(bucket: "errors")
    |> range(start: time(v: ${startTime}), stop: time(v: ${endTime}))
    |> filter(fn: (r) => r["_measurement"] == "errors")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> filter(fn: (r) => r["hash"] == "66a613414d08bc0bd6e02accab4e45e88cc6440450df86581b2e03fbe259872a")
    |> limit(n:1)
  `
  let collect;
  queryClient.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row)
      collect = JSON.parse(o?.errorData || '{}');
    },
    error(error) {
      console.error(error)
      res.status(500).send('ERROR');
    },
    async complete() {
      const { stack } = collect;
      const result: IPosition[] = [];
      for (const s of stack) {
        const { line, column } = s;
        const filename = path.basename(s.url);
        const sourceMapPath = path.resolve(__dirname, `./uploads/sourcemap/2024-01-04-15-08-13/${filename}.map`)
        const position = await getOriginalPosition({
          sourceMapPath,
          line,
          column
        })
        result.push(position)
        console.log(position.lines, position.originalPosition);
      }
      res.json({
        data: result
      });
    },
  })


})


app.listen(port, () => console.log(`Listening on port ${port}`));
