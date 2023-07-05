import ppomInit, { PPOM } from "@blockaid/ppom-mock";
import wasm from "@blockaid/ppom-mock/dist/ppom_bg.wasm";
import invoke from "react-native-webview-invoke/browser";
import asyncInvoke from "./invoke-lib.js";
(async () => {
  asyncInvoke(invoke);
  console.log = invoke.bind("console.log");
  console.error = invoke.bind("console.error");
  console.warn = invoke.bind("console.warn");

  console.log("hello world!");

  function base64ToUint8Array(base64String) {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
  }

  function convertBase64ToFiles(base64Array) {
    return base64Array.map(([key, base64]) => {
      return [key, base64ToUint8Array(base64)];
    });
  }

  const _wasm = base64ToUint8Array(wasm);
  let ppom = undefined;

  invoke.defineAsync("ppomInit", async () => ppomInit(_wasm));

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

  invoke.bind("finishedLoading")();
})();
