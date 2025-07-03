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
    resizable: true,
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

  /* 🔗   Cmd+O  →  Toggle window visibility */
  globalShortcut.register('Cmd+O', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
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

  /* 🧠  Cmd+Shift+A: Read clipboard text and send to renderer */
  globalShortcut.register('Cmd+Shift+A', () => {
    const text = clipboard.readText();
    if (text) win.webContents.send('clipboard:text', text);
  });
});

/* 🧠  Handle inference requests from renderer */
ipcMain.handle('ollama:ask', async (_e, { prompt, model, messages }) => {
  const r = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages && messages.length ? messages : [{ role: "user", content: prompt }],
      stream: false
    })
  });
  const json = await r.json();
  return json.message?.content || 'No response from Ollama.';
});

ipcMain.on('move-window', (_e, direction) => {
  if (!win) return;
  const [x, y] = win.getPosition();
  const offset = 40;
  switch (direction) {
    case 'ArrowUp': win.setPosition(x, y - offset); break;
    case 'ArrowDown': win.setPosition(x, y + offset); break;
    case 'ArrowLeft': win.setPosition(x - offset, y); break;
    case 'ArrowRight': win.setPosition(x + offset, y); break;
  }
});

app.on('window-all-closed', () => app.quit()); 