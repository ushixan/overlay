# ollama-overlay

A minimal Electron overlay to query **Ollama** (local LLM) with highlighted text or screenshots.

## Setup
1. Install Node ≥18.
2. `brew install --cask ollama` (macOS) & run `ollama serve`.
3. `git clone` or copy these files.
4. `npm install`.
5. `npm run build-css` (compile Tailwind once).
6. `npm run dev`.

## Usage
* **Cmd + Shift + A** – copy text then press to query LLM.
* **Cmd + Shift + X** – interactive screenshot → OCR → query.
* Use the dropdown to swap Ollama models (`ollama run <model>` beforehand).

Enjoy your glassy AI side‑kick ✨ 