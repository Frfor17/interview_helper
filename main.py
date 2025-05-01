from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

app = FastAPI()

# CORS (если нужен доступ извне)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статические файлы (включая index.html)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

# Бот-логика
async def mock_interview_response(message: str) -> str:
    if "расскажи о себе" in message.lower():
        return "Начни с опыта, навыков и почему ты хочешь эту позицию."
    elif "слабые стороны" in message.lower():
        return "Хорошо говорить о слабостях, если показываешь, как с ними справляешься."
    return f"Интересный вопрос: '{message}'. Подумай, как бы ты ответил на собеседовании."

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.send_text("👋 Привет! Я помогу тебе подготовиться к собеседованию.")
        while True:
            data = await websocket.receive_text()
            response = await mock_interview_response(data)
            await websocket.send_text(response)
    except WebSocketDisconnect:
        print("Клиент отключился")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
