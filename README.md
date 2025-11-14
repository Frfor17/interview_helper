# interview_helper



Как запустить всё это? Короче всё просто

Снаачал всё это открывам в vs code, потом заходим в терминал и тут три команды стреляем:
`python3 -m venv env` а потом
`Set-ExecutionPolicy Unrestricted -Scope Process` а потом
`env\Scripts\Activate`

Всё, тепеь есть вирт окружение. Теперь устанавливаме библиотеки которые нам нужны и даже те, что не нужны, лишним не будет!!!

`pip install fastapi uvicorn sqlalchemy alembic asyncpg psycopg2  pydantic `

Теперь короче всё готов, чтобы запустить сервак, пишем в консоль

`uvicorn main:app --reload`


После того как уже поработали, выключили, прошёл день, и вы пришли снова работать, то надо заного активировать виртуальное окружение:

Сначала даём права:


`Set-ExecutionPolicy Unrestricted -Scope Process`


Потом активируем окружение:

`env\Scripts\Activate`

Всё, теперь можно продолжать работу:

`uvicorn main:app --reload`




НО ВАЖНЫЙ МОМЕНТ:

СОЗДАЙ config.py

и добавь туда крч инфу об ключах(просто скопируй и вставь ключи):

```
# config.py
# Конфигурационные переменные - в GIT не класть!

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = "удали этот текст и вставь в эти ковычки, между этими ковычками, апи ключ с опен роутера или откуда там у тебя есть"
```
