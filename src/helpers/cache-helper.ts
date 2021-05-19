import localForage from "localforage";
import * as esbuild from "esbuild-wasm";
import axios from "axios";

const filecache = localForage.createInstance({
  name: "filecache",
});

export default async function checkCache(path: string) {
  const cacheData = await filecache.getItem<esbuild.OnLoadResult>(path);

  if (cacheData) {
    return {
      data: cacheData,
      url: null,
    };
  }

  // IF not then get it
  const { data, request } = await axios.get(path);

  return {
    data: data,
    url: request.responseURL,
  };
}
