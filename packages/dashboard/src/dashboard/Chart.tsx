import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
import Title from './Title';
import useSWR from 'swr'
import dayjs from 'dayjs';


interface IData {
  [x: string]: {
    result: string
    table: number
    hash: string
    count: number
    message: string;
    second: string;
  }[]
}

const colors = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"
];

export default function Chart() {
  const theme = useTheme();
  const { data } = useSWR<{ data: IData, version: string }>('/api/vitualError?endTime=2024-01-04T18:04:00.207Z&startTime=2024-01-04T01:04:00.207Z');

  if (!data) {
    return null;
  }

  const rechartsData = Object.values(data.data).flat().map(({ second, hash, count, message }) => {
    let formattedSecond = dayjs(second).unix();
    return { second: formattedSecond, hash, count, message };
  }).sort((a, b) => {
    return a.second - b.second;
  });
  const hashes = [...new Set(rechartsData.map(item => item.hash))];
  console.log('data', rechartsData, data.version)



  return (
    <>
      <Title>Errors</Title>
      <ResponsiveContainer>
        <LineChart
          data={rechartsData}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="second"
            style={theme.typography.body2} stroke={theme.palette.text.secondary} scale='time' type='number' domain={['auto', 'auto']}
            tickFormatter={(unixTime) => {
              return dayjs.unix(unixTime).format('YYYY-MM-DD HH:mm:ss')
            }}
          />
          <YAxis style={theme.typography.body2} stroke={theme.palette.text.secondary} />
          <Tooltip offset={100} labelFormatter={(label => {
            return dayjs.unix(label).format('YYYY-MM-DD HH:mm:ss')
          })} />
          <Legend />
          {hashes.map((hash, index) => {
            const message = rechartsData.find(item => item.hash === hash)!.message;
            const color = colors[index % colors.length];
            const lineData = rechartsData.filter(item => item.hash === hash).sort((a, b) => {
              if (dayjs(a.second).isBefore(dayjs(b.second))) {
                return -1;
              } else {
                return 1;
              }
            });
            return (
              <Line stroke={color} type="monotone" dataKey="count" activeDot={{ r: 8 }} dot={false} data={lineData} name={message} key={hash} />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
