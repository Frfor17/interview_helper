from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from typing import Optional, Dict, Any
from fastapi.responses import RedirectResponse
import random
from pathlib import Path

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
    user_id: str = "user123"    

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

# Хранилище текущих вопросов для пользователей
user_sessions: Dict[str, Dict[str, Any]] = {}

# Получаем путь к папке с вопросами
questions_dir = Path(__file__).parent / "questions"

def get_random_question():
    try:
        # Получаем список всех подпапок (Backend, Frontend, ML_and_DS, Mobile)
        category_folders = [f for f in questions_dir.iterdir() if f.is_dir()]
        print(f"📁 Найдено категорий: {[f.name for f in category_folders]}")
        
        if not category_folders:
            print("❌ В папке questions нет подпапок с категориями")
            return None
        
        # Выбираем случайную категорию
        random_category = random.choice(category_folders)
        print(f"📂 Выбрана категория: {random_category.name}")
        
        # Получаем все JSON файлы в этой категории
        json_files = list(random_category.glob("*.json"))
        print(f"📄 Найдено JSON файлов в категории: {[f.name for f in json_files]}")
        
        if not json_files:
            print(f"❌ В папке {random_category.name} нет JSON файлов")
            return None
        
        # Выбираем случайный файл
        random_file = random.choice(json_files)
        print(f"📄 Выбран файл: {random_file.name}")
        
        # Читаем файл
        with open(random_file, 'r', encoding='utf-8') as f:
            file_data = json.load(f)
        
        print(f"📊 Данные из файла: {type(file_data)}, длина: {len(file_data) if isinstance(file_data, list) else 'не список'}")
        
        # Выбираем случайный вопрос из файла
        all_questions = []
        for option_group in file_data:
            print(f"🔍 Обрабатываем option_group: {option_group.keys()}")
            if "questions" in option_group:
                all_questions.extend(option_group["questions"])
        
        print(f"❓ Найдено вопросов: {len(all_questions)}")
        
        if not all_questions:
            print("❌ В файле нет вопросов")
            return None
            
        question_data = random.choice(all_questions)
        print(f"✅ Выбран вопрос: {question_data['question'][:50]}...")
        
        # Проверяем, есть ли в вопросе correct_answer_id
        if "correct_answer_id" not in question_data:
            print(f"⚠️ Вопрос не имеет correct_answer_id, пропускаем его")
            # Попробуем выбрать другой вопрос
            return get_random_question()
        
        # Определяем уровень сложности из имени файла
        level = "unknown"
        if "junior" in random_file.name.lower():
            level = "Junior"
        elif "middle" in random_file.name.lower():
            level = "Middle"
        elif "senior" in random_file.name.lower():
            level = "Senior"
            
        return question_data, random_category.name, level
        
    except Exception as e:
        print(f"❌ Ошибка при чтении вопроса: {e}")
        import traceback
        traceback.print_exc()
        return None
    

def check_answer(user_id: str, user_answer: str) -> Dict[str, Any]:
    """Проверяет ответ пользователя"""
    if user_id not in user_sessions:
        return {"correct": False, "message": "❌ Сначала задайте вопрос!"}
    
    session = user_sessions[user_id]
    current_question = session["current_question"]
    
    # Проверяем, есть ли правильный ответ в вопросе
    if "correct_answer_id" not in current_question:
        return {
            "correct": False,
            "message": "❌ В этом вопросе нет правильного ответа для проверки",
            "correct_answer": "Неизвестно",
            "explanation": "Этот вопрос не содержит информации о правильном ответе"
        }
    
    correct_answer_id = current_question["correct_answer_id"]
    
    # Ищем правильный ответ среди вариантов
    correct_answer_text = None
    for answer in current_question["answers"]:
        if answer["answer_id"] == correct_answer_id:
            correct_answer_text = answer["answer_text"]
            break
    
    # Если не нашли правильный ответ по ID, используем первый ответ как правильный
    if correct_answer_text is None and current_question["answers"]:
        correct_answer_text = current_question["answers"][0]["answer_text"]
        correct_answer_id = current_question["answers"][0]["answer_id"]
    
    # Пытаемся преобразовать ответ пользователя в число
    try:
        user_answer_id = int(user_answer.strip())
        is_correct = user_answer_id == correct_answer_id
        
        # Обновляем счетчик правильных ответов
        if is_correct:
            session["correct_answers"] += 1
            
        if is_correct:
            return {
                "correct": True,
                "message": "✅ Правильно! Отличная работа!",
                "correct_answer": correct_answer_text,
                "explanation": f"💡 {current_question.get('hint', '')}"
            }
        else:
            return {
                "correct": False,
                "message": "❌ Неправильно!",
                "correct_answer": correct_answer_text,
                "explanation": f"💡 {current_question.get('hint', '')}"
            }
    except ValueError:
        # Если ответ не число, проверяем текстовое совпадение
        user_answer_lower = user_answer.strip().lower()
        correct_answer_lower = correct_answer_text.lower() if correct_answer_text else ""
        
        if user_answer_lower == correct_answer_lower:
            session["correct_answers"] += 1
            return {
                "correct": True,
                "message": "✅ Правильно! Отличная работа!",
                "correct_answer": correct_answer_text,
                "explanation": f"💡 {current_question.get('hint', '')}"
            }
        else:
            return {
                "correct": False,
                "message": "❌ Неправильно!",
                "correct_answer": correct_answer_text,
                "explanation": f"💡 {current_question.get('hint', '')}"
            }
        
def get_final_results(user_id: str) -> str:
    """Формирует финальные результаты интервью"""
    if user_id not in user_sessions:
        return "❌ Результаты не найдены"
    
    session = user_sessions[user_id]
    total_questions = session["question_count"]
    correct_answers = session["correct_answers"]
    score = (correct_answers / total_questions) * 100
    
    # Определяем оценку
    if score >= 90:
        grade = "Отлично! 🎉"
    elif score >= 70:
        grade = "Хорошо! 👍"
    elif score >= 50:
        grade = "Удовлетворительно 👌"
    else:
        grade = "Нужно подтянуть знания 📚"
    
    return (
        f"🎊 Интервью завершено!\n\n"
        f"📊 Ваши результаты:\n"
        f"• Всего вопросов: {total_questions}\n"
        f"• Правильных ответов: {correct_answers}\n"
        f"• Процент правильных: {score:.1f}%\n"
        f"• Оценка: {grade}\n\n"
        f"Спасибо за участие! Чтобы начать заново, отправьте любое сообщение."
    )


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
    try:
        print(f"📨 Получено сообщение: {request.message}")
        user_id = request.user_id
        
        # Если у пользователя нет сессии, создаем ее
        if user_id not in user_sessions:
            user_sessions[user_id] = {
                "question_count": 0,
                "correct_answers": 0,
                "current_question": None
            }
            print(f"🆕 Создана новая сессия для пользователя {user_id}")
        
        session = user_sessions[user_id]
        
        # Проверяем, не является ли сообщение ответом на предыдущий вопрос
        if session["current_question"] is not None:
            # Проверяем ответ
            check_result = check_answer(user_id, request.message)
            
            # Увеличиваем счетчик вопросов
            session["question_count"] += 1
            
            # Формируем ответ с результатом проверки
            response = (
                f"{check_result['message']}\n\n"
                f"📋 Правильный ответ: {check_result['correct_answer']}\n"
                f"{check_result['explanation']}\n\n"
                f"📚 Тема: {session['current_question'].get('theme', 'Не указана')}\n\n"
                f"📈 Прогресс: {session['question_count']}/3 вопросов"
            )
            
            # Очищаем текущий вопрос
            session["current_question"] = None
            
            # Проверяем, завершено ли интервью
            if session["question_count"] >= 3:
                final_results = get_final_results(user_id)
                # Очищаем сессию пользователя
                user_sessions.pop(user_id, None)
                return {"answer": response + "\n\n" + final_results}
            
            return {"answer": response}
        
        # Если это не ответ, то генерируем новый вопрос
        result = get_random_question()
        if not result:
            return {"answer": "❌ Не удалось загрузить вопросы. Проверьте структуру папок и файлов."}
        
        question_data, category, level = result
        
        # Сохраняем текущий вопрос для пользователя
        session["current_question"] = question_data
        
        # Формируем ответ
        answers_text = "\n".join([f"{answer['answer_id']}. {answer['answer_text']}" 
                                for answer in question_data['answers']])
        
        answer = (
            f"🎯 Вопрос {session['question_count'] + 1}/3 из категории {category} ({level}):\n\n"
            f"{question_data['question']}\n\n"
            f"Варианты ответов:\n{answers_text}\n\n"
            f"💡 Подсказка: {question_data.get('hint', '')}\n"
            f"📚 Тема: {question_data.get('theme', 'Не указана')}\n\n"
            f"✏️ Чтобы ответить, отправьте номер ответа (1, 2, 3...) или текст ответа"
        )
        
        return {"answer": answer}
        
    except Exception as e:
        print(f"❌ Ошибка в send_message: {e}")
        import traceback
        traceback.print_exc()
        return {"answer": "❌ Произошла ошибка при выборе вопроса"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

