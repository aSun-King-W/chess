/* global Pikafish */

let engineInstance = null;
let engineScriptError = null;
const pendingCommands = [];

try {
  importScripts('/engines/pikafish/single/pikafish.js');
} catch (error) {
  engineScriptError = error;
}

function postLine(line) {
  if (line == null) return;
  const text = String(line).trim();
  if (text.length > 0) self.postMessage(text);
}

function postStatus(message) {
  self.postMessage({ message: String(message) });
}

function sendToEngine(command) {
  if (!engineInstance) {
    pendingCommands.push(command);
    return;
  }

  if (typeof engineInstance.sendCommand === 'function') {
    engineInstance.sendCommand(command);
    return;
  }

  if (typeof engineInstance.send_command === 'function') {
    engineInstance.send_command(command);
  }
}

function flushPendingCommands() {
  while (engineInstance && pendingCommands.length > 0) {
    sendToEngine(pendingCommands.shift());
  }
}

function initializeEngine() {
  if (engineScriptError) {
    postStatus(`Pikafish import failed: ${engineScriptError instanceof Error ? engineScriptError.message : String(engineScriptError)}`);
    return;
  }

  self.Pikafish({
    onReceiveStdout: postLine,
    onReceiveStderr: postStatus,
    setStatus: postStatus,
    onExit: (code) => postStatus(`Pikafish exited with code ${code}`),
    locateFile: (url) => {
      if (url === 'pikafish.data') return '/engines/pikafish/data/pikafish.data';
      return `/engines/pikafish/single/${url}`;
    },
  })
    .then((instance) => {
      engineInstance = instance;
      postStatus('Pikafish ready');
      flushPendingCommands();
    })
    .catch((error) => {
      postStatus(`Pikafish load failed: ${error instanceof Error ? error.message : String(error)}`);
    });
}

initializeEngine();

self.onmessage = (event) => {
  const command = typeof event.data === 'string' ? event.data : event.data?.command;
  if (typeof command !== 'string' || command.trim().length === 0) return;
  sendToEngine(command.trim());
};
