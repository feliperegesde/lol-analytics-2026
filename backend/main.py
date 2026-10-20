from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml_engine import train_models
from api_routes import router

app = FastAPI(title="LoL Analytics & AI Engine", version="4.0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Treinando modelos de Inteligência Artificial...")
    train_models()
    print("Modelos prontos!")

app.include_router(router)