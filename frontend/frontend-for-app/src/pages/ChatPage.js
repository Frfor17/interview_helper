import React, { useState } from "react";
import HeaderBlock from "../components/HeaderBlock";
import "./ChatPage.css";


export const questions = {
    frontend: {
        junior: [
            {
                question: "Что такое HTML?",
                options: ["Язык разметки", "Фреймворк"],
            },
            {
                question: "Что такое CSS?",
                options: ["Стили", "База данных"],
            }
        ],
        middle: [
            {
                question: "Что такое Virtual DOM?",
                options: ["Копия DOM", "Объект браузера"],
            }
        ],
        senior: [
            {
                question: "Как работает reconciliation в React?",
                options: ["Diffing", "Shadow DOM"],
            }
        ]
    },

    backend: {
        junior: [
            { question: "Что такое API?", options: ["Интерфейс", "Протокол"] }
        ],
        middle: [
            { question: "Что такое Docker?", options: ["Контейнеризация", "Сервис"] }
        ],
        senior: [
            { question: "Что такое CQRS?", options: ["Паттерн", "Язык"] }
        ]
    },

    qa: {
        junior: [
            { question: "Что такое тест-кейс?", options: ["Сценарий", "Сервис"] }
        ],
        middle: [
            { question: "Что такое регрессия?", options: ["Повторное тестирование", "Сбор данных"] }
        ],
        senior: [
            { question: "Что такое нагрузочное тестирование?", options: ["Тест скорости", "Тест UI"] }
        ]
    }
};

const ChatPage = ({ onBack }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const sendMessage = () => {
        if (!inputValue.trim()) return;

        // Добавляем сообщение пользователя
        const newMessage = {
            id: Date.now(),
            text: inputValue,
            isUser: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");

        // Симуляция ответа AI
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                text: "Это пример ответа AI. Здесь будет логика собеседования",
                isUser: false
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
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
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!inputValue.trim()}
                            className="send-button"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;