const promptEl = document.getElementById('prompt');
const answerEl = document.getElementById('answer');
const modelEl  = document.getElementById('model');

// 🔗   Receive text from global shortcut
window.aiBridge.onClipboardText((txt) => {
  promptEl.value = txt;
  ask();
});

document.getElementById('ask').onclick = ask;

document.getElementById('close').onclick = () => {
  document.getElementById('card').classList.toggle('hidden');
};

async function ask() {
  const q = promptEl.value.trim();
  if (!q) return;
  answerEl.textContent = 'Thinking…';
  const model = modelEl.value;
  try {
    const res = await window.aiBridge.ask(q, model);
    answerEl.textContent = res;
  } catch (e) {
    answerEl.textContent = 'Error: ' + e.message;
  }
} 