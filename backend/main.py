from fastapi import FastAPI

app = FastAPI(title="My FastAPI App")

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok"
    }
