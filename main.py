from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from dotenv import load_dotenv
import openai 


app = FastAPI()

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


