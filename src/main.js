import { app, BrowserWindow, globalShortcut, clipboard, ipcMain, dialog } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fetch from 'node-fetch';
import { readFileSync, unlinkSync } from 'node:fs';
import tesseract from 'tesseract.js';
const { recognize } = tesseract;

const __dirname = fileURLToPath(new URL('.', import.meta.url));
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    vibrancy: 'fullscreen-ui', // macOS blur
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  /* 🔗   Cmd+Shift+A  →  Read clipboard text & send to renderer */
  globalShortcut.register('Cmd+Shift+A', () => {
    const text = clipboard.readText();
    if (text) win.webContents.send('clipboard:text', text);
  });

  /* 📸   Cmd+Shift+X  →  Interactive screenshot */
  globalShortcut.register('Cmd+Shift+X', async () => {
    const tmp = join(app.getPath('temp'), `ai-shot-${Date.now()}.png`);
    await new Promise((res) => {
      spawn('screencapture', ['-i', '-x', tmp]).on('close', res);
    });
    const imgBuf = readFileSync(tmp);
    try {
      const { data: { text } } = await recognize(imgBuf, 'eng');
      win.webContents.send('clipboard:text', text.trim());
    } catch (e) {
      console.error(e);
      dialog.showErrorBox('OCR error', e.message);
    } finally {
      unlinkSync(tmp);
    }
  });
});

/* 🧠  Handle inference requests from renderer */
ipcMain.handle('ollama:ask', async (_e, { prompt, model }) => {
  const r = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });
  const json = await r.json();
  return json.response;
});

app.on('window-all-closed', () => app.quit()); 