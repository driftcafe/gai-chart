#!/usr/bin/env python3
"""
Test the "Compare that to Q4" query to see what config Claude generates.
"""

import os
import sys
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
load_dotenv('backend/.env')

from llm_service import llm_service
from data_service import data_service

print("Testing conversational query...\n")

# Get schema
schema = data_service.get_schema("quarterly_financials")

# Simulate first query
print("Query 1: 'How did we perform in Q3?'\n")
result1 = llm_service.generate_chart_config(
    user_query="How did we perform in Q3?",
    schema=schema,
    conversation_history=None
)

if result1["success"]:
    print("✅ Query 1 succeeded")
    print(f"Chart type: {result1['config'].get('chartType')}")
    print(f"Title: {result1['config'].get('title')}")
    print("\nECharts config series structure:")
    print(json.dumps(result1['config']['echartOption'].get('series', []), indent=2))
    
    # Now try the second query
    print("\n" + "="*60)
    print("Query 2: 'Compare that to Q4'\n")
    
    result2 = llm_service.generate_chart_config(
        user_query="Compare that to Q4",
        schema=schema,
        conversation_history=result1["conversation_history"]
    )
    
    if result2["success"]:
        print("✅ Query 2 succeeded")
        print(f"Chart type: {result2['config'].get('chartType')}")
        print(f"Title: {result2['config'].get('title')}")
        print("\nECharts config series structure:")
        print(json.dumps(result2['config']['echartOption'].get('series', []), indent=2))
        
        print("\n" + "="*60)
        print("ANALYSIS:")
        print("="*60)
        
        # Check if series have dataField
        series = result2['config']['echartOption'].get('series', [])
        for i, s in enumerate(series):
            print(f"\nSeries {i} ({s.get('name', 'unnamed')}):")
            print(f"  Type: {s.get('type')}")
            print(f"  Data structure: {type(s.get('data'))}")
            if isinstance(s.get('data'), dict):
                print(f"  Data keys: {s.get('data').keys()}")
            elif isinstance(s.get('data'), list) and len(s.get('data')) > 0:
                print(f"  First data item: {s.get('data')[0]}")
        
        print("\nData mapping:")
        print(json.dumps(result2['config'].get('dataMapping', {}), indent=2))
        
    else:
        print(f"❌ Query 2 failed: {result2.get('error')}")
else:
    print(f"❌ Query 1 failed: {result1.get('error')}")
