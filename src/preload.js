const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aiBridge', {
  onClipboardText: (cb) => ipcRenderer.on('clipboard:text', (_e, t) => cb(t)),
  ask: (prompt, model, messages) => ipcRenderer.invoke('ollama:ask', { prompt, model, messages }),
  moveWindow: (direction) => ipcRenderer.send('move-window', direction)
}); 