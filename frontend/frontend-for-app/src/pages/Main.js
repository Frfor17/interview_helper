import React, { useState } from 'react';
import HeaderBlock from "../components/HeaderBlock";
import ChatPage from "./ChatPage";
import "./Main.css";

const Main = () => {
    const [stage, setStage] = useState("intro");

    return (
        <div className="background">
            <HeaderBlock />
            
            {stage === "intro" && (
                <div className="fullscreen">
                    <h1>Добро пожаловать!</h1>
                    <p>Это симулятор собеседования в чате.</p>
                    <button 
                        className="main-button" 
                        onClick={() => setStage("interview")}
                    >
                        Начать собеседование
                    </button>
                </div>
            )}

            {stage === "interview" && (
                <ChatPage onBack={() => setStage("intro")} />
            )}
        </div>
    );
};

export default Main;