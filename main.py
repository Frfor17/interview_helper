from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from typing import Optional
from fastapi.responses import RedirectResponse
import random

# Импортируем конфигурацию из отдельного файла
try:
    from config import OPENROUTER_API_URL, OPENROUTER_API_KEY
except ImportError:
    raise ImportError(
        "Config file not found. Please create config.py with OPENROUTER_API_URL and OPENROUTER_API_KEY"
    )

app = FastAPI(
    title="OpenRouter Chat API",
    description="Бэкенд для общения с AI моделями через OpenRouter",
    version="1.0.0"
)

questions = {
    "frontend": {
        "junior": [
            {
                "question": "Что такое HTML?",
                "options": ["Язык разметки", "Фреймворк"]
            },
            {
                "question": "Что такое CSS?",
                "options": ["Стили", "База данных"]
            }
        ],
        "middle": [
            {
                "question": "Что такое Virtual DOM?",
                "options": ["Копия DOM", "Объект браузера"]
            }
        ],
        "senior": [
            {
                "question": "Как работает reconciliation в React?",
                "options": ["Diffing", "Shadow DOM"]
            }
        ]
    },
    "backend": {
        "junior": [
            {
                "question": "Что такое API?",
                "options": ["Интерфейс", "Протокол"]
            }
        ],
        "middle": [
            {
                "question": "Что такое Docker?",
                "options": ["Контейнеризация", "Сервис"]
            }
        ],
        "senior": [
            {
                "question": "Что такое CQRS?",
                "options": ["Паттерн", "Язык"]
            }
        ]
    },
    "qa": {
        "junior": [
            {
                "question": "Что такое тест-кейс?",
                "options": ["Сценарий", "Сервис"]
            }
        ],
        "middle": [
            {
                "question": "Что такое регрессия?",
                "options": ["Повторное тестирование", "Сбор данных"]
            }
        ],
        "senior": [
            {
                "question": "Что такое нагрузочное тестирование?",
                "options": ["Тест скорости", "Тест UI"]
            }
        ]
    }
}

# Добавьте CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "deepseek/deepseek-chat"

class ChatResponse(BaseModel):
    response: str
    model_used: str

# Популярные модели на OpenRouter
AVAILABLE_MODELS = {
    "deepseek": "deepseek/deepseek-chat",
    "llama": "meta-llama/llama-3.1-70b-instruct", 
    "claude": "anthropic/claude-3.5-sonnet",
    "gemini": "google/gemini-pro-1.5"
}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Отправляет сообщение в выбранную AI модель через OpenRouter
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",  # URL вашего приложения
        "X-Title": "FastAPI Chat Backend"         # Название приложения
    }
    
    # Если указано короткое имя модели, преобразуем в полное
    model_name = AVAILABLE_MODELS.get(request.model, request.model)
    
    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": request.message
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.7
    }

    try:
        response = requests.post(
            OPENROUTER_API_URL, 
            json=payload, 
            headers=headers, 
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            return ChatResponse(
                response=data["choices"][0]["message"]["content"],
                model_used=model_name
            )
        else:
            error_detail = f"OpenRouter API error: {response.status_code} - {response.text}"
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Request timeout")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except (KeyError, IndexError) as e:
        raise HTTPException(status_code=500, detail="Invalid response format from API")

@app.get("/models")
async def get_available_models():
    """
    Возвращает список доступных моделей
    """
    return {
        "available_models": AVAILABLE_MODELS,
        "default_model": "deepseek/deepseek-chat"
    }

@app.get("/health")
async def health_check():
    """
    Проверка статуса API
    """
    return {"status": "healthy", "service": "OpenRouter Chat API"}

@app.get("/start")
async def start_interview():
    # А вот это уже редирект на другую страницу
    return RedirectResponse(url="/chat")

@app.post("/sendmessage")
async def send_message(request: MessageRequest):
    # Выбираем случайное направление
    direction = "backend"
    
    # Выбираем случайный уровень для этого направления
    level = "middle"
    
    # Выбираем случайный вопрос для этого направления и уровня
    question_data = random.choice(questions[direction][level])
    
    # Формируем ответ
    answer = f"🎯 Вопрос из {direction} ({level}):\n\n{question_data['question']}\n\nВарианты: {', '.join(question_data['options'])}"
    
    return {"answer": answer}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

