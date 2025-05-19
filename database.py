from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Создаем асинхронный движок
engine = create_async_engine(DATABASE_URL, echo=True)

# Создаем асинхронный фабрикатор сессий
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Базовый класс для моделей
class Base(DeclarativeBase):
    pass

# Функция получения сессии(грубо говоря, открыть коробку с инструментами, поработать с инструментами(сессиями), автоматически закрыть коробку)
async def get_session() -> AsyncSession:
    async with async_session() as session: # Открывает async session и гарантирует его закрытие в конце работы
        yield session      # функция с yield называется генератор, возвращает значения по одному