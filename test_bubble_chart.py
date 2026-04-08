#!/usr/bin/env python3
"""
Quick test to reproduce the bubble chart error and see Claude's response.
"""

import os
import sys
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from dotenv import load_dotenv
load_dotenv('api/.env')

from llm_service import llm_service
from data_service import data_service

print("Testing bubble chart query...\n")

# Get schema
schema = data_service.get_schema("quarterly_financials")

# Simulate the conversation history (first two queries worked)
conversation_history = [
    {"role": "user", "content": "show me q3 revenue vs costs"},
    {"role": "assistant", "content": '{"chartType": "line", "title": "Revenue vs Costs"}'},
    {"role": "user", "content": "change this to a bar chart"},
    {"role": "assistant", "content": '{"chartType": "bar", "title": "Revenue vs Costs"}'},
]

# Try the bubble chart query
print("Sending query: 'change this to a bubble chart'\n")

try:
    result = llm_service.generate_chart_config(
        user_query="change this to a bubble chart",
        schema=schema,
        conversation_history=conversation_history
    )
    
    if result["success"]:
        print("✅ Success!")
        print(f"Chart type: {result['config'].get('chartType')}")
    else:
        print(f"❌ Failed: {result.get('error')}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
    print("\nCheck the output above for Claude's full response")
