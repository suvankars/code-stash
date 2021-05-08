import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const filecache = localForage.createInstance({
  name: "filecache",
});

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve", args);
        if (args.path === "index.js") {
          return { path: args.path, namespace: "a" };
        }
        if (args.path.includes("./") || args.path.includes("../")) {
          return {
            namespace: "a",
            path: new URL(
              args.path,
              "https://unpkg.com" + args.resolveDir + "/"
            ).href,
          };
        } else
          return {
            path: `https://unpkg.com/${args.path}`,
            namespace: "a",
          };
      });

      build.onLoad({ filter: /.*/ }, async (args: any): Promise<esbuild.OnLoadResult> => {
        console.log("onLoad", args);

        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: `
              import React from 'react'
              import ReactDOM from 'react-dom'
              console.log(message);
            `,
          };
        } else {
          // IF file is already in cache then return from cache

          const cacheData = await filecache.getItem<esbuild.OnLoadResult>(
            args.path
          );
          console.log(cacheData);
          if (cacheData) {
            console.log("returning fromm cahce data");
            return cacheData;
          }

          // IF not then get it
          const { data, request } = await axios.get(args.path);

          console.log(request);
          const result: esbuild.OnLoadResult = {
            loader: "jsx",
            contents: data,
            resolveDir: new URL("./", request.responseURL).pathname,
          };

          // Then cach it and return it
          await filecache.setItem(args.path, result);

          return result;
        }
      });
    },
  };
};
