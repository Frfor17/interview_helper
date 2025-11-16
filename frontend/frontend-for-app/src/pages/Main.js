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

    const [isInterviewFinished, setIsInterviewFinished] = useState(false);

    // --- Этап 1 ---
    const startInterview = () => {
        setStage("direction");
        setIsInterviewFinished(false); // Сбрасываем флаг завершения
    };

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
                setIsInterviewFinished(true);
            }, 500);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("interviewState");
        if (!saved) return;

        const data = JSON.parse(saved);

        // Если интервью было завершено, показываем завершенный чат
        if (data.isInterviewFinished) {
            setStage("interview");
            setDirection(data.direction);
            setLevel(data.level);
            setMessages(data.messages);
            setQuestionIndex(data.questionIndex);
            setIsInterviewFinished(true);
        } else if (data.stage === "finished") {
            // Для обратной совместимости со старыми данными
            setStage("intro");
        } else {
            // Обычная загрузка состояния
            setStage(data.stage ?? "intro");
            setDirection(data.direction ?? null);
            setLevel(data.level ?? null);
            setQuestionIndex(data.questionIndex ?? 0);
            setMessages(data.messages ?? []);
            setIsInterviewFinished(data.isInterviewFinished ?? false);
        }
    }, []);

    useEffect(() => {
        const save = {
            stage: isInterviewFinished ? "interview" : stage, // Сохраняем stage как interview если завершено
            direction,
            level,
            questionIndex,
            messages,
            isInterviewFinished // Сохраняем флаг завершения
        };

        localStorage.setItem("interviewState", JSON.stringify(save));
    }, [stage, direction, level, questionIndex, messages, isInterviewFinished]);

    const restartInterview = () => {
        setStage("intro");
        setDirection(null);
        setLevel(null);
        setMessages([]);
        setQuestionIndex(0);
        setIsInterviewFinished(false);
        localStorage.removeItem("interviewState");
    };

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
            backend junior
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
            {(stage === "interview") && (
                <div className="chat-container">
                    <div className="chat-header">
                        <h1 className="chat-title">
                            Собеседование ({direction}, {level})
                            {isInterviewFinished && " - Завершено"}
                        </h1>
                    </div>

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

                    {/* Ответы показываем только если интервью не завершено */}
                    {!isInterviewFinished && questions[direction]?.[level]?.[questionIndex] && (
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

                    {/* Сообщение о завершении */}
                    {isInterviewFinished && (
                        <div className="completion-message">
                            <p>Собеседование завершено. Вы можете просмотреть историю диалога или начать заново.</p>
                            {isInterviewFinished && (
                            <button className="restart-button" onClick={restartInterview}>
                                Начать заново
                            </button>
                        )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Main;
