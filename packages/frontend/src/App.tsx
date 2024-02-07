import { lazy, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const LazySplit = lazy(() => import('./Split'));

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // setTimeout(() => {
    //   throw new Error('custom error')
    // }, 10);
    // setTimeout(() => {
    //   Promise.reject(new Error("Promise Failed!"))
    // }, 100)
    // setTimeout(() => {
    //   Promise.reject(new Error("Promise Failed! 1"))
    // }, 1000)
    // setTimeout(() => {
    //   throw new Error('custom error 1')
    // }, 5000)
    // setTimeout(() => {
    //   throw new Error('custom error 2')
    // }, 10000)
    // console.log('error', new Error('rqwrqwe'));

    function foo()
    {
    return Promise.reject('Hello, Fundebug!');
    }
      
    const r = foo();
      
    setTimeout(() =>
    {
        r.catch(e =>{});
    }, 1000);




    // // Promise.reject(new Error("Promise Failed! 1"));
    // // Promise.reject(new Error("Promise Failed! 1")).catch(error => {})
    // setTimeout(() => {
    //   a.b.c;
    // }, 0)
    // // a.b.c;
    // fetch('/api/dads');
    const image = document.createElement('script');
    image.src = "http://dassdas/dassd.js";
    document.body.appendChild(image)
    a.b.c;
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 onClick={() => {
        /**@ts-expect-error test */
        window.a.b
      }}>Click Error</h1>
      <LazySplit />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
