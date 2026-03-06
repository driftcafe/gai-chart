import sys
import os
import traceback

def create_error_app(error_msg):
    # Fallback to minimal WSGI/ASGI depending on what Vercel wants, but Vercel expects an ASGI FastAPI app.
    # We must import FastAPI INSIDE this try block, because if FastAPI itself isn't installed, the import crashes.
    try:
        from fastapi import FastAPI
        from fastapi.responses import JSONResponse
        app = FastAPI()
        
        @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
        def catch_all(path: str):
            return JSONResponse(status_code=500, content={"error": "Vercel Initialization failed", "traceback": error_msg})
        return app
    except Exception as e:
        # If even FastAPI is missing, we must construct a raw ASGI app
        async def fallback_asgi(scope, receive, send):
            if scope['type'] == 'http':
                # Convert error_msg to bytes safely
                body = b'{"error": "FATAL: FastAPI missing", "traceback": "' + error_msg.replace('"', '\\"').replace('\\n', '\\\\n').encode() + b'"}'
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [
                        [b'content-type', b'application/json'],
                    ]
                })
                await send({
                    'type': 'http.response.body',
                    'body': body
                })
        return fallback_asgi

try:
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from real_main import app
except Exception as e:
    err_str = traceback.format_exc()
    print("FATAL IMPORT ERROR:", err_str)
    app = create_error_app(err_str)
