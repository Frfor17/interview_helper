const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chat = document.getElementById('chat');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';

  // Эмуляция ответа
  setTimeout(() => {
    addMessage('bot', generateBotReply(message));
  }, 500);
});

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function generateBotReply(userMsg) {
  const replies = [
    "Расскажи про SOLID-принципы.",
    "Чем отличается goroutine от потока?",
    "Опиши структуру данных стек.",
    "Почему стоит использовать PostgreSQL, а не MongoDB?",
    "Какие есть типы индексов в базе данных?",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
