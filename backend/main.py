import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

try:
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from real_main import app as real_app
    app = real_app
except Exception as e:
    err_str = traceback.format_exc()
    print("FATAL IMPORT ERROR:", err_str)
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": "Vercel Initialization failed", "traceback": err_str})
