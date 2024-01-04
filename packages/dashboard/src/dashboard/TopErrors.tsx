import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import useSWR from 'swr'
import { useMemo } from 'react';
import { Link } from '@mui/material';

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

export default function TopErrors() {

  const { data } = useSWR<{ data: IData }>('/api/vitualError?endTime=2024-01-04T18:04:00.207Z&startTime=2024-01-04T01:04:00.207Z');

  const result = useMemo(() => {
    const _result: {
      hash: string;
      count: number;
      message: string;
    }[] = []
    const d = data?.data || {};
    const hashs = Object.keys(d);
    for (const hash of hashs) {
      const arr = d[hash];
      const r = {
        hash,
        message: arr[0].message,
        count: arr.reduce((pre, cur) => pre + cur.count, 0)
      }
      _result.push(r)
    }
    _result.sort((a, b) => b.count - a.count)
    return _result;
  }, [data])

  if (!data) {
    return null;
  }



  return (
    <>
      <Title>Top Errors</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.map((row) => (
            <TableRow key={row.hash}>
              <TableCell>
                <Link href={`/error-parse?hash=${row.hash}`}>{row.message}</Link>
              </TableCell>
              <TableCell align="right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
