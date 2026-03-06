"""
Data Service - Provides mock financial data and schema extraction.
This module is structured so real SQL data can be swapped in later.
"""

from typing import Dict, List, Any
import json


class DataService:
    """Handles data retrieval and schema extraction for financial datasets."""
    
    def __init__(self):
        """Initialize with mock financial data."""
        self.datasets = {
            "quarterly_financials": self._generate_quarterly_data(),
            "monthly_metrics": self._generate_monthly_data(),
            "default_data": self._load_default_csv(),
        }
    
    def _load_default_csv(self) -> List[Dict[str, Any]]:
        """Load default_data from static python file."""
        try:
            from default_data import DEFAULT_DATA
            return DEFAULT_DATA
        except Exception as e:
            print(f"Warning: Could not load default_data.py: {e}")
            return []
    
    def _generate_quarterly_data(self) -> List[Dict[str, Any]]:
        """Generate mock quarterly financial data."""
        return [
            {"quarter": "Q1 2023", "revenue": 2450000, "costs": 1680000, "margin": 31.4, "region": "North America"},
            {"quarter": "Q2 2023", "revenue": 2780000, "costs": 1820000, "margin": 34.5, "region": "North America"},
            {"quarter": "Q3 2023", "revenue": 3120000, "costs": 1950000, "margin": 37.5, "region": "North America"},
            {"quarter": "Q4 2023", "revenue": 3450000, "costs": 2100000, "margin": 39.1, "region": "North America"},
            {"quarter": "Q1 2024", "revenue": 3680000, "costs": 2250000, "margin": 38.9, "region": "North America"},
            {"quarter": "Q2 2024", "revenue": 4020000, "costs": 2380000, "margin": 40.8, "region": "North America"},
            {"quarter": "Q3 2024", "revenue": 4350000, "costs": 2520000, "margin": 42.1, "region": "North America"},
            
            {"quarter": "Q1 2023", "revenue": 1850000, "costs": 1420000, "margin": 23.2, "region": "Europe"},
            {"quarter": "Q2 2023", "revenue": 2100000, "costs": 1580000, "margin": 24.8, "region": "Europe"},
            {"quarter": "Q3 2023", "revenue": 2380000, "costs": 1720000, "margin": 27.7, "region": "Europe"},
            {"quarter": "Q4 2023", "revenue": 2650000, "costs": 1890000, "margin": 28.7, "region": "Europe"},
            {"quarter": "Q1 2024", "revenue": 2820000, "costs": 1980000, "margin": 29.8, "region": "Europe"},
            {"quarter": "Q2 2024", "revenue": 3150000, "costs": 2120000, "margin": 32.7, "region": "Europe"},
            {"quarter": "Q3 2024", "revenue": 3420000, "costs": 2280000, "margin": 33.3, "region": "Europe"},
        ]
    
    def _generate_monthly_data(self) -> List[Dict[str, Any]]:
        """Generate mock monthly metrics data."""
        return [
            {"month": "Jan 2024", "active_users": 45200, "churn_rate": 2.3, "arpu": 127.50},
            {"month": "Feb 2024", "active_users": 47800, "churn_rate": 2.1, "arpu": 129.80},
            {"month": "Mar 2024", "active_users": 51200, "churn_rate": 1.9, "arpu": 132.40},
            {"month": "Apr 2024", "active_users": 54600, "churn_rate": 2.0, "arpu": 135.20},
            {"month": "May 2024", "active_users": 58100, "churn_rate": 1.8, "arpu": 138.60},
            {"month": "Jun 2024", "active_users": 62300, "churn_rate": 1.7, "arpu": 141.90},
            {"month": "Jul 2024", "active_users": 66800, "churn_rate": 1.6, "arpu": 145.30},
            {"month": "Aug 2024", "active_users": 71200, "churn_rate": 1.5, "arpu": 148.70},
            {"month": "Sep 2024", "active_users": 75900, "churn_rate": 1.4, "arpu": 152.10},
        ]
    
    def get_dataset(self, dataset_name: str = "quarterly_financials") -> List[Dict[str, Any]]:
        """
        Retrieve a dataset by name.
        
        Args:
            dataset_name: Name of the dataset to retrieve
            
        Returns:
            List of data records
        """
        return self.datasets.get(dataset_name, self.datasets["quarterly_financials"])
    
    def get_schema(self, dataset_name: str = "quarterly_financials") -> Dict[str, Any]:
        """
        Extract schema from dataset WITHOUT exposing actual data values.
        This is the ONLY information sent to the LLM.
        
        Args:
            dataset_name: Name of the dataset to extract schema from
            
        Returns:
            Schema dictionary with column names and inferred types
        """
        data = self.get_dataset(dataset_name)
        
        if not data:
            return {"columns": [], "row_count": 0}
        
        # Extract column names and infer types from first row
        sample_row = data[0]
        columns = []
        
        for key, value in sample_row.items():
            col_info = {
                "name": key,
                "type": self._infer_type(value),
            }
            
            # Add metadata for categorical columns (list unique values for small sets)
            if isinstance(value, str):
                unique_values = list(set(row[key] for row in data))
                # Increase limit to 50, and always include for "Product Group Name"
                if len(unique_values) <= 50 or key == "Product Group Name":
                    col_info["categories"] = sorted(unique_values)  # Sort for consistency
            
            columns.append(col_info)
        
        return {
            "columns": columns,
            "row_count": len(data),
            "dataset_name": dataset_name
        }
    
    def _infer_type(self, value: Any) -> str:
        """Infer the data type of a value."""
        if isinstance(value, bool):
            return "boolean"
        elif isinstance(value, int):
            return "integer"
        elif isinstance(value, float):
            return "number"
        elif isinstance(value, str):
            # Check if it looks like a date/quarter
            if any(q in value for q in ["Q1", "Q2", "Q3", "Q4"]) or any(m in value for m in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]):
                return "temporal"
            return "string"
        else:
            return "unknown"
    
    def list_available_datasets(self) -> List[str]:
        """List all available dataset names."""
        return list(self.datasets.keys())


# Singleton instance
data_service = DataService()
