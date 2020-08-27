// META: script=/common/get-host-info.sub.js
// META: script=resources/create-wasm-module.js

const { HTTPS_NOTSAMESITE_ORIGIN } = get_host_info();
const iframe = document.createElement('iframe');
iframe.src = `${HTTPS_NOTSAMESITE_ORIGIN}/streams/transferable/resources/deserialize-error-frame.html`;
document.body.appendChild(iframe);

// Remove the iframe once the tests are finished, to avoid cluttering up the
// results page.
let finishedTestsBitmask = 0;
window.addEventListener('message', evt => {
  const data = evt.data;
  if (data === 1 || data === 2) {
    finishedTestsBitmask |= data;
    if (finishedTestsBitmask === 3) {
      iframe.remove();
    }
  }
});

iframe.onload = async () => {
  const ws = new WritableStream();
  iframe.contentWindow.postMessage(ws, '*', [ws]);

  const module = await createWasmModule();
  const rs = new ReadableStream({
    start(controller) {
      controller.enqueue(module);
    }
  });
  iframe.contentWindow.postMessage(rs, '*', [rs]);
};

fetch_tests_from_window(iframe.contentWindow);
