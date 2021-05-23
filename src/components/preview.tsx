import React, {useEffect, useRef} from 'react';

interface PreviewProps {
    code: string;
}

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

const Preview: React.FC<PreviewProps> = ({code})=>{
    const iframeRef = useRef <any>();

    useEffect(()=>{
        //Re-assign Skeleton before each Executions;
        iframeRef.current.srcdoc=html;
        iframeRef.current.contentWindow.postMessage(code, '*')
    },[code]);

    return (
        <iframe ref={iframeRef} sandbox="allow-scripts" srcDoc={html} title='code-editor'/>
    );
}

export default Preview;