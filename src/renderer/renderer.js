const chatHistoryEl = document.getElementById('chat-history');
const promptEl = document.getElementById('prompt');
const answerEl = document.getElementById('answer');
const modelEl  = document.getElementById('model');
const card = document.getElementById('card');

let chatHistory = [];

function renderChat() {
  chatHistoryEl.innerHTML = chatHistory.map(item => `
    <div class="mb-1">
      <div class="font-semibold text-blue-200 mb-1">You:</div>
      <div class="mb-2">${item.prompt}</div>
      <div class="font-semibold text-green-200 mb-1">AI:</div>
      <div class="mb-2">${item.response}</div>
    </div>
  `).join('');
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

// 🔗   Receive text from global shortcut
window.aiBridge.onClipboardText((txt) => {
  promptEl.value = txt;
  promptEl.focus();
});

document.getElementById('ask').onclick = ask;

document.getElementById('close').onclick = () => {
  document.getElementById('card').classList.toggle('hidden');
};

async function ask() {
  const q = promptEl.value.trim();
  if (!q) return;
  // Show thinking in chat
  chatHistory.push({ prompt: q, response: 'Thinking…' });
  renderChat();
  promptEl.value = '';
  const model = modelEl.value;
  // Build message history for Ollama
  const messages = chatHistory.slice(0, -1).flatMap(item => [
    { role: 'user', content: item.prompt },
    { role: 'assistant', content: item.response }
  ]);
  messages.push({ role: 'user', content: q });
  try {
    const res = await window.aiBridge.ask(q, model, messages);
    chatHistory[chatHistory.length - 1].response = res;
  } catch (e) {
    chatHistory[chatHistory.length - 1].response = 'Error: ' + e.message;
  }
  renderChat();
}

setTimeout(() => {
  card.classList.remove('translate-y-8', 'opacity-0');
}, 100); // animate on mount

// Copy code block logic
const copyBtn = document.getElementById('copy-code');
if (copyBtn) {
  copyBtn.onclick = () => {
    const code = document.getElementById('code-block').innerText;
    navigator.clipboard.writeText(code);
  };
}

// Move window with Cmd+Arrow keys
window.addEventListener('keydown', (e) => {
  if (e.metaKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    window.aiBridge?.moveWindow?.(e.key);
  }
});

// Responsive textarea height (optional, for extra polish)
window.addEventListener('resize', () => {
  promptEl.style.width = '100%';
  chatHistoryEl.style.maxHeight = Math.max(120, window.innerHeight * 0.46) + 'px';
});

// Clear button logic
const clearBtn = document.getElementById('clear-prompt');
if (clearBtn) {
  clearBtn.onclick = () => {
    promptEl.value = '';
    chatHistory = [];
    renderChat();
    promptEl.focus();
  };
} 