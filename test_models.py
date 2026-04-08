#!/usr/bin/env python3
"""
Test script to check which Claude models are available with your API key.
"""

import os
import sys
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
load_dotenv('api/.env')

# Check if Anthropic API key is set
if not os.getenv("ANTHROPIC_API_KEY"):
    print("❌ ANTHROPIC_API_KEY not found in api/.env")
    sys.exit(1)

client = Anthropic(api_key=api_key)

# List of possible model names to try
models_to_try = [
    "claude-3-5-sonnet-latest",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-sonnet-20240229",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2.0",
]

print("🔍 Testing which Claude models are available with your API key...\n")

working_models = []

for model in models_to_try:
    try:
        print(f"Testing: {model}...", end=" ")
        response = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        print("✅ WORKS!")
        working_models.append(model)
    except Exception as e:
        error_str = str(e)
        if "not_found_error" in error_str:
            print("❌ Not found")
        elif "permission" in error_str.lower():
            print("⚠️  No permission")
        else:
            print(f"❌ Error: {error_str[:50]}")

print("\n" + "="*60)
if working_models:
    print("✅ Working models:")
    for model in working_models:
        print(f"   - {model}")
    print("\n💡 Recommendation: Use the first one listed above")
    print(f"   Update llm_service.py line 113 to:")
    print(f'   self.model = "{working_models[0]}"')
else:
    print("❌ No working models found!")
    print("\n🔍 Possible issues:")
    print("   1. API key might not have access to Claude models")
    print("   2. API key might be for a different service")
    print("   3. Account might need to be activated")
    print("\n💡 Check your Anthropic console:")
    print("   https://console.anthropic.com/")
print("="*60)
