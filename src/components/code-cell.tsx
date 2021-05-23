import React, { useState } from "react";
import CodeEditor from "./code-editor";
import Preview from "./preview";
import bundle from "../bundler";

const CodeCell = () => {
    const [input, setInput] = useState("");
    const [code, setCode]= useState("");
    
    const onClick = async () => {
      const bundledCode = await bundle(input);
      setCode(bundledCode);
    };

  return (
    <div>
      <CodeEditor
        initialValue={"console.log(123)"}
        onChange={(value) => setInput(value)}
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <Preview code={code} />
    </div>
  );
};
export default CodeCell;
