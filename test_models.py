#!/usr/bin/env python3
"""
Test script to check if Gemini is available with your API key and list models.
"""

import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
load_dotenv('backend/.env')

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found in backend/.env")
    sys.exit(1)

genai.configure(api_key=api_key)

print("🔍 Checking available Gemini models for your API key...\n")

try:
    models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    print("✅ Available models:")
    for m in models:
        print(f"   - {m}")
        
    print("\n💡 Recommendation: If `gemini-1.5-flash` throws a 404 error, copy one of the exact names above (like `models/gemini-1.5-flash-latest`) and update `self.model_name` in `backend/llm_service.py` and `api/llm_service.py`.")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n" + "="*60)
