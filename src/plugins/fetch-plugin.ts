import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const filecache = localForage.createInstance({
    name: "filecache",
  });
  
export const fetchPlugin = (inputCode: string) => {
    return {
      name: "fetch-plugin",
      setup(build: esbuild.PluginBuild) {
        build.onLoad(
        { filter: /.*/ },
        async (args: any): Promise<esbuild.OnLoadResult> => {
          console.log("onLoad", args);

          if (args.path === "index.js") {
            return {
              loader: "jsx",
              contents: inputCode,
            };
          } else {
            // IF file is already in cache then return from cache

            // const cacheData = await filecache.getItem<esbuild.OnLoadResult>(
            //   args.path
            // );
            // console.log(cacheData);
            // if (cacheData) {
            //   console.log("returning fromm cahce data");
            //   return cacheData;
            // }

            // IF not then get it
            const { data, request } = await axios.get(args.path);

            const escaped = data.replace(/\n/g,'')
                                .replace(/"/g,'\\"')
                                .replace(/'/g, "\\'")
            const fileType = args.path.match(/.css$/)? 'css' : 'jsx'
            const contents = fileType === 'css' ?
              `
                const elm = document.createElement('style');
                elm.innerText = '${escaped}'
                document.head.appendChild(elm);
              ` : data;

            const result: esbuild.OnLoadResult = {
              loader: 'jsx',
              contents,
              resolveDir: new URL("./", request.responseURL).pathname,
            };

            // Then cach it and return it
            await filecache.setItem(args.path, result);

            return result;
          }
        }
      );
      }
    };
  };