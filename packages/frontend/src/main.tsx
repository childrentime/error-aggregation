import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import TraceKit, { StackTrace } from 'tracekit';

// 虽然我们不需要用 window.onerror了 但是这个可以当成一小节，下一小节再用标准化的库
// 数据库的选取 es 还是 influxdb 也可以算一小节
TraceKit.report.subscribe((errorReport) => {
  console.log('normal error', errorReport);
  sendError(errorReport);
})

// 错误的类型： error unhandledrejection 用于window端 unhandledrejection rejectionhandled用于nodejs
// sourcemap还原： 在sources面板中加载sourcemap文件 1. edge中的devtool就可以做到这件事情 
// https://github.com/MicrosoftDocs/edge-developer/blob/main/microsoft-edge/devtools-guide-chromium/javascript/consume-source-maps-from-azure.md
// 2.浏览器拓展来自动加载内网生产sourcemap？ ignorelist来忽略一些stack？
// window.addEventListener('error', (error) => {
//   // console.info('error', error, JSON.stringify(error));
//   TraceKit.report(error as any);
// })

// window.addEventListener('unhandledrejection', (error) => {
//   // console.info('promise error', error, JSON.stringify(error))
//   TraceKit.report(error);
// })

function sendError(params: StackTrace) {
  try {
    params.stack = params.stack.map(item => {
      // @ts-expect-error delete
      delete item.context;
      return item;
    })
    const body = JSON.stringify(params);
    console.log('body',body)
    const img = new Image();
    img.src = 'http://localhost:1010/reportError?' + 'message=' + btoa(body);
  } catch (error) {
    console.log('fail to report error')
  }

}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
