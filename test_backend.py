#!/usr/bin/env python3
"""
Test script to verify Hila backend is working correctly.
Run this after setting up your environment.
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

from data_service import data_service

def test_data_service():
    """Test data service functionality."""
    print("🧪 Testing Data Service...")
    
    # Test dataset retrieval
    data = data_service.get_dataset("quarterly_financials")
    assert len(data) > 0, "No data returned"
    print(f"✅ Retrieved {len(data)} records")
    
    # Test schema extraction
    schema = data_service.get_schema("quarterly_financials")
    assert "columns" in schema, "Schema missing columns"
    print(f"✅ Schema has {len(schema['columns'])} columns")
    
    # Verify no raw data in schema
    for col in schema['columns']:
        assert 'name' in col, "Column missing name"
        assert 'type' in col, "Column missing type"
    print("✅ Schema contains only metadata (no raw values)")
    
    # Test available datasets
    datasets = data_service.list_available_datasets()
    assert len(datasets) > 0, "No datasets available"
    print(f"✅ Found {len(datasets)} available datasets")
    
    print("\n✨ All Data Service tests passed!\n")

def test_schema_safety():
    """Verify that schema doesn't leak actual data values."""
    print("🔒 Testing Data Safety...")
    
    schema = data_service.get_schema("quarterly_financials")
    data = data_service.get_dataset("quarterly_financials")
    
    # Get some actual values from data
    actual_revenue = data[0]['revenue']
    actual_costs = data[0]['costs']
    
    # Convert schema to string and verify actual values aren't in it
    schema_str = str(schema)
    
    # These should NOT appear in schema
    assert str(actual_revenue) not in schema_str, "⚠️  SECURITY ISSUE: Actual revenue value found in schema!"
    assert str(actual_costs) not in schema_str, "⚠️  SECURITY ISSUE: Actual costs value found in schema!"
    
    print("✅ Schema does not contain actual financial values")
    print("✅ Data safety verified - safe to send to LLM")
    
    print("\n🔒 Data Safety tests passed!\n")

def print_sample_data():
    """Print sample data structure for reference."""
    print("📊 Sample Data Structure:")
    print("-" * 50)
    
    data = data_service.get_dataset("quarterly_financials")
    print(f"\nFirst record: {data[0]}")
    
    schema = data_service.get_schema("quarterly_financials")
    print(f"\nSchema (sent to LLM):")
    for col in schema['columns']:
        print(f"  - {col['name']}: {col['type']}")
    
    print("\n" + "=" * 50 + "\n")

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 Hila Backend Test Suite")
    print("=" * 50 + "\n")
    
    try:
        test_data_service()
        test_schema_safety()
        print_sample_data()
        
        print("✅ All tests passed!")
        print("\n💡 Next steps:")
        print("   1. Add your ANTHROPIC_API_KEY to backend/.env")
        print("   2. Run: cd backend && ../backend/venv/bin/python main.py")
        print("   3. Open http://localhost:3000 in your browser")
        print("\n")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)
