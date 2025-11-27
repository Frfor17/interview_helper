import React, { useState } from "react";
import HeaderBlock from "../components/HeaderBlock";
import "./ChatPage.css";

const ChatPage = ({ onBack }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        // Добавляем сообщение пользователя
        const newMessage = {
            id: Date.now(),
            text: inputValue,
            isUser: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setLoading(true);

        try {
            // Отправляем сообщение на бэкенд
            const response = await fetch("http://localhost:8000/sendmessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: inputValue,
                    user_id: "user123"  // можно добавить идентификатор пользователя
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Добавляем ответ от бэкенда
            const aiResponse = {
                id: Date.now() + 1,
                text: data.answer,
                isUser: false
            };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Ошибка:", error);
            const aiResponse = {
                id: Date.now() + 1,
                text: "❌ Ошибка соединения с сервером",
                isUser: false
            };
            setMessages(prev => [...prev, aiResponse]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !loading) {
            sendMessage();
        }
    };

    return (
        <div className="chat-page">
            <HeaderBlock />
            
            {/* Кнопка назад */}
            <button 
                onClick={onBack}
                className="back-button"
            >
                ← Назад
            </button>
            
            <div className="chat-container">
                {/* История сообщений */}
                <div className="messages-area">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <h2>Собеседование началось</h2>
                            <p>Задайте ваш вопрос</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}>
                                {msg.text}
                            </div>
                        ))
                    )}
                    {/* Индикатор загрузки */}
                    {loading && (
                        <div className="message ai-message loading">
                            ⌛ Бэкенд думает...
                        </div>
                    )}
                </div>

                {/* Поле ввода */}
                <div className="input-area">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Напишите ваш вопрос..."
                            className="chat-input"
                            disabled={loading}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || loading}
                            className="send-button"
                        >
                            {loading ? "⏳" : "➤"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;