import { useState, useEffect } from "react";
import HeaderBlock from "../components/HeaderBlock";
// import { questions } from "../data/questions";
import "./Main.css";

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


const Main = () => {
    const [stage, setStage] = useState("intro");
    const [direction, setDirection] = useState(null);
    const [level, setLevel] = useState(null);

    const [messages, setMessages] = useState([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    // --- Этап 1 ---
    const startInterview = () => setStage("direction");

    // --- Этап 2 ---
    const chooseDirection = (dir) => {
        setDirection(dir);
        setStage("level");
    };

    // --- Этап 3 ---
    const chooseLevel = (lvl) => {
        setLevel(lvl);
        setStage("interview");

        setMessages([]);
        setQuestionIndex(0);

        // первый вопрос
        setMessages([
            { id: Date.now(), type: "ai", text: questions[direction][lvl][0].question }
        ]);
    };

    const handleAnswer = (answer) => {
        const current = questions[direction][level][questionIndex];

        // Добавляем ответ пользователя
        setMessages((prev) => [
            ...prev,
            { id: Date.now() + "_u", type: "user", text: answer }
        ]);

        const nextIndex = questionIndex + 1;

        if (nextIndex < questions[direction][level].length) {
            setQuestionIndex(nextIndex);

            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + "_ai",
                        type: "ai",
                        text: questions[direction][level][nextIndex].question,
                    },
                ]);
            }, 500);
        } else {
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), type: "ai", text: "🎉 Собеседование завершено!" },
                ]);

                // <<< добавляем
                setStage("finished");
            }, 500);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("interviewState");
        if (!saved) return;

        const data = JSON.parse(saved);

        if (data.stage === "finished") {
            setStage("intro");
            setDirection(null);
            setLevel(null);
            setMessages([]);
            setQuestionIndex(0);
            return;
        }

        setStage(data.stage ?? "intro");
        setDirection(data.direction ?? null);
        setLevel(data.level ?? null);
        setQuestionIndex(data.questionIndex ?? 0);
        setMessages(data.messages ?? []);
    }, []);

    useEffect(() => {
        const save = {
            stage,
            direction,
            level,
            questionIndex,
            messages,
        };

        localStorage.setItem("interviewState", JSON.stringify(save));
    }, [stage, direction, level, questionIndex, messages]);

    return (
        <div className="background">
            <HeaderBlock />

            {/* --- ЭКРАН 1: Приветствие --- */}
            {stage === "intro" && (
                <div className="fullscreen">
                    <h1>Добро пожаловать!</h1>
                    <p>Это симулятор собеседования в чате.</p>
                    <button className="main-button" onClick={startInterview}>
                        Начать собеседование
                    </button>
                </div>
            )}

            {/* --- ЭКРАН 2: Направление --- */}
            {stage === "direction" && (
                <div className="fullscreen">
                    <h2>Выберите направление:</h2>

                    <div className="directions">
                        <div className="dir-card" onClick={() => chooseDirection("frontend")}>
                            Frontend
                        </div>
                        <div className="dir-card" onClick={() => chooseDirection("backend")}>
                            Backend
                        </div>
                        <div className="dir-card" onClick={() => chooseDirection("qa")}>
                            QA
                        </div>
                    </div>
                </div>
            )}

            {/* --- ЭКРАН 3: Уровень --- */}
            {stage === "level" && (
                <div className="fullscreen">
                    <h2>Выберите уровень:</h2>

                    <div className="directions">
                        <div className="dir-card" onClick={() => chooseLevel("junior")}>
                            Junior
                        </div>
                        <div className="dir-card" onClick={() => chooseLevel("middle")}>
                            Middle
                        </div>
                        <div className="dir-card" onClick={() => chooseLevel("senior")}>
                            Senior
                        </div>
                    </div>
                </div>
            )}

            {/* --- ЭКРАН 4: Чат --- */}
            {stage === "interview" && (
                <div className="chat-container">
                    <h1 className="chat-title">
                        Собеседование ({direction}, {level})
                    </h1>

                    <div className="messages-wrapper">
                        {messages.map((m) => (
                            <div key={m.id} className="message-wrapper">
                                {m.type === "user" ? (
                                    <div className="user-message">{m.text}</div>
                                ) : (
                                    <div className="ai-message">{m.text}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Ответы */}
                    {questions[direction][level][questionIndex] && (
                        <div className="answers">
                            {questions[direction][level][questionIndex].options.map((opt) => (
                                <button
                                    key={opt}
                                    className="answer-button"
                                    onClick={() => handleAnswer(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- ЭКРАН 5: Завершено --- */}
            {/* {stage === "finished" && (
                <div className="fullscreen">
                    <h2>Собеседование завершено!</h2>
                    <p>Перезагрузите страницу, чтобы начать заново.</p>
                </div>
            )} */}
        </div>
    );
};

export default Main;
