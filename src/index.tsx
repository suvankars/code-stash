import * as esbuild from "esbuild-wasm";
import React from "react-dom";
import ReactDOM from "react-dom";
import { useState, useEffect, useRef } from "react";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import CodeEditor from "../src/components/code-editor"

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState("");
  const iframeRef = useRef <any>();
  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    //Reassign Skeleton before each Executions;
    iframeRef.current.srcdoc=html;

    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    //setCode(result.outputFiles[0].text);
    iframeRef.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
  };
  
  const html = `
  <html>
    <head></head>
    <body>
    <div id="root"></div>
    <script>
      window.addEventListener('message', (event)=>{
        try {
          eval(event.data)
        } catch (err){
          const root=document.querySelector('#root');
          root.innerHTML='<div style="color : red">' + err + '</div>';
          throw err;
        }

      }, false);
    </script>
    </body>
  </html>
  `;

  useEffect(() => {
    startService();
  }, []);
  
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };

  return (
    <div>
      <CodeEditor 
      initialValue={"a=10"}
      onChange={(value)=> setInput(value)}
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <iframe ref={iframeRef} title="me" sandbox="allow-scripts" srcDoc={html}></iframe>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
