import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('aiBridge', {
  onClipboardText: (cb) => ipcRenderer.on('clipboard:text', (_e, t) => cb(t)),
  ask: (prompt, model) => ipcRenderer.invoke('ollama:ask', { prompt, model })
}); 