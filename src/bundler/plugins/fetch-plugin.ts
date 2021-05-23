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
      //For root file
      build.onLoad({ filter: /^index\.js$/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });

      //For other js/css cached files and imports
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        //Cached data
        const cacheData = await filecache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cacheData) {
          return cacheData;
        }
      });

      //build css files
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        // IF not then get it
        const { data, request } = await axios.get(args.path);

        //Process the data
        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");

        //Append css to a style  div in document head   
        const contents = `
              const elm = document.createElement('style');
              elm.innerText = '${escaped}'
              document.head.appendChild(elm);
            `;

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        // Then cach it and return it
        await filecache.setItem(args.path, result);

        return result;
      });

      //build onLoad js files
      build.onLoad({ filter: /.*$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        // Then cach it and return it
        await filecache.setItem(args.path, result);

        return result;
      });
    },
  };
};
