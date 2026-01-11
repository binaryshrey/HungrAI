from fastapi import FastAPI

app = FastAPI(title="HungrAI Backend API", version="1.0.0")

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok"
    }
