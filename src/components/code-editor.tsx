import './code-editor.css';
import {useRef} from 'react';
import MonacoEditor from "@monaco-editor/react";
import type {EditorDidMount} from "@monaco-editor/react";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
  const editorRef = useRef<any>();

  const onclickFormat = () => {
    //get value from editor
    const unformatted = editorRef.current.getValue();
    //format
    const formatted = prettier.format(unformatted, {
      parser: 'babel',
      plugins: [parser],
      useTabs: false,
      semi: true,
      singleQuote: true

    }).replace(/\n$/, '');
    //set value back in the editor 
    editorRef.current.setValue(formatted);

  }

  const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
    editorRef.current = monacoEditor;
    monacoEditor.onDidChangeModelContent(()=>{
      onChange(getValue())  
    })
  monacoEditor.getModel()?.updateOptions({tabSize: 2});
  };

  return (
    <div className="editor-wrapper">
      <button className="button button-format is-primary is-small" onClick={onclickFormat} >Format</button>
    <MonacoEditor
      value={initialValue}
      editorDidMount={onEditorDidMount}
      theme="dark"
      language="javascript"
      height="500px"
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        showUnused: false,
        folding: false,
        fontSize: 16,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
    </div>
  );
};

export default CodeEditor;
