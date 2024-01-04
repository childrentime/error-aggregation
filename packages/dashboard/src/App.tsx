import Dashboard from './dashboard/Dashboard';
import { SWRConfig } from 'swr'

export default function App() {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
      }}
    >
      <Dashboard />
    </SWRConfig>
  );
}
