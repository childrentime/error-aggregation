import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import TraceKit, { StackTrace } from 'tracekit';

// 虽然我们不需要用 window.onerror了 但是这个可以当成一小节，下一小节再用标准化的库
// 数据库的选取 es 还是 influxdb 也可以算一小节
// TraceKit.report.subscribe((errorReport) => {
//   console.log('normal error', errorReport);
//   sendError(errorReport);
// })

// const originalConsoleLog = console.log;

// // 使用自定义的函数替换 console.error
// console.log = function (...messages) {
//   // 在这里，你可以添加你自己的错误处理代码
//   // 例如，你可以将错误发送到你的日志服务器
//   setTimeout(() => {
//     for (const message of messages) {
//       if (message instanceof Error) {
//         throw message;
//       }
//     }
//   }, 0)

//   // 调用原始的 console.error 方法，以便在控制台中显示错误信息
//   originalConsoleLog.apply(console, messages);
// };

// 错误的类型： error unhandledrejection 用于window端 unhandledrejection rejectionhandled用于nodejs
// sourcemap还原： 在sources面板中加载sourcemap文件 1. edge中的devtool就可以做到这件事情 
// https://github.com/MicrosoftDocs/edge-developer/blob/main/microsoft-edge/devtools-guide-chromium/javascript/consume-source-maps-from-azure.md
// 2.浏览器拓展来自动加载内网生产sourcemap？ ignorelist来忽略一些stack？

// window.onerror = (...args) => {
//   console.log('args',args)
// }
// window.addEventListener('error', (error) => {
//   console.log('error',error)
//   // console.info('error', error, JSON.stringify(error));
//   // TraceKit.report(error as any);
// }, {
//   capture: true
// })
window.addEventListener('error', (error) => {
  console.log('error 4123341', error)
})

window.addEventListener('unhandledrejection', (error) => {
  console.info('promise error', JSON.stringify(error))
  // TraceKit.report(error);
})

const rejectedPromise = Promise.reject('Error at ' +
  new Date().toLocaleTimeString());


// We need to handle the rejection "after the fact" in order to trigger a
// unhandledrejection followed by rejectionhandled. Here we simulate that
// via a setTimeout(), but in a real-world system this might take place due
// to, e.g., fetch()ing resources at startup and then handling any rejected
// requests at some point later on.
setTimeout(() => {
  // We need to provide an actual function to .catch() or else the promise
  // won't be considered handled.
  rejectedPromise.catch(() => { });
}, 2000);




function sendError(params: StackTrace) {
  try {
    params.stack = params.stack.map(item => {
      // @ts-expect-error delete
      delete item.context;
      return item;
    })
    // @ts-expect-error 添加属性
    params.version = window.versionId;
    const body = JSON.stringify(params);
    console.log('body', body)
    const img = new Image();
    img.src = 'http://localhost:1010/reportError?' + 'message=' + btoa(body);
  } catch (error) {
    console.log('fail to report error')
  }

}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
