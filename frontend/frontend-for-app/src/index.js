import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: inputValue
      });

      // Добавляем новое сообщение в начало массива (чтобы показывалось сверху)
      setMessages(prev => [{
        question: inputValue,
        answer: response.data.response,
        id: Date.now()
      }, ...prev]);

      setInputValue("");
    } catch (error) {
      console.error("Ошибка:", error);
      // Показываем ошибку тоже как сообщение
      setMessages(prev => [{
        question: inputValue,
        answer: "❌ Ошибка соединения с сервером",
        id: Date.now()
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Мой чат с AI</h1>
      
      {/* Поле ввода */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '600px',
        display: 'flex',
        gap: '10px'
      }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..." 
          disabled={loading}
          style={{
            padding: '12px',
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '25px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !inputValue.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? "..." : "➤"}
        </button>
      </div>

      {/* Сообщения (появляются сверху) */}
      <div style={{ marginBottom: '80px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '15px' }}>
            {/* Вопрос пользователя */}
            <div style={{
              background: '#007bff',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '15px',
              marginBottom: '5px',
              marginLeft: 'auto',
              maxWidth: '70%',
              wordBreak: 'break-word'
            }}>
              {msg.question}
            </div>
            
            {/* Ответ AI */}
            <div style={{
              background: '#e9ecef',
              color: '#333',
              padding: '10px 15px',
              borderRadius: '15px',
              marginBottom: '10px',
              maxWidth: '70%',
              wordBreak: 'break-word',
              border: '1px solid #dee2e6'
            }}>
              {msg.answer}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#666',
          marginTop: '50px'
        }}>
          <p>Задайте вопрос AI-ассистенту</p>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);