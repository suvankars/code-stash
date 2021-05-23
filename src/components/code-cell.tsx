import React, { useState } from "react";
import CodeEditor from "./code-editor";
import Preview from "./preview";
import bundle from "../bundler";
import Button from '@atlaskit/button';
import Resizable from "./resizable";

const CodeCell = () => {
    const [input, setInput] = useState("");
    const [code, setCode]= useState("");
    
    const onClick = async () => {
      const bundledCode = await bundle(input);
      setCode(bundledCode);
    };

  return (
    <Resizable direction='vertical'>
        <div style={{height: '100%', display: 'flex', flexDirection: 'row' }}>
            <CodeEditor
                initialValue={"console.log(123)"}
                onChange={(value) => setInput(value)}
            />
            <Preview code={code} />
        </div>
    </Resizable>
  );
};
export default CodeCell;
