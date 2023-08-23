import ppomInit, { PPOM } from "@blockaid/ppom";
import wasm from "@blockaid/ppom/ppom_bg.wasm";
import invoke from "react-native-webview-invoke/browser";
import asyncInvoke from "./invoke-lib.js";
import { Buffer } from "buffer";
(async () => {
  asyncInvoke(invoke);
  console.log = invoke.bind("console.log");
  console.error = invoke.bind("console.error");
  console.warn = invoke.bind("console.warn");

  console.log("hello world!");

  function base64ToUint8Array(b64) {
    return Buffer.from(b64, "base64");
  }

  function convertBase64ToFiles(base64Array) {
    return base64Array.map(([key, base64]) => {
      return [key, base64ToUint8Array(base64)];
    });
  }

  let ppom = undefined;

  invoke.defineAsync("ppomInit", async () => {
    await ppomInit(base64ToUint8Array(wasm));
  });

  invoke.define("PPOM.new", async (files) => {
    const jsonRpc = invoke.bindAsync("PPOM.jsonRpc");
    files = convertBase64ToFiles(files);
    ppom = new PPOM(jsonRpc, files);
  });

  invoke.define("PPOM.free", (...args) => {
    ppom.free(...args);
    ppom = undefined;
  });

  invoke.defineAsync("PPOM.test", async (...args) => {
    return await ppom.test(...args);
  });

  invoke.defineAsync("PPOM.validateJsonRpc", async (...args) => {
    return await ppom.validateJsonRpc(...args);
  });

  await invoke.bind("finishedLoading")();
})();
