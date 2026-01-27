"""
Mock LLM Service - For testing without Anthropic API credits.
Generates chart configurations based on simple pattern matching.
"""

import json
from typing import Dict, List, Any, Optional


class MockLLMService:
    """Mock LLM service that generates chart configs without calling Claude."""
    
    def __init__(self):
        """Initialize mock service."""
        self.conversation_history: List[Dict[str, str]] = []
    
    def generate_chart_config(
        self,
        user_query: str,
        schema: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate chart configuration based on simple pattern matching.
        This is a mock implementation for testing without API credits.
        """
        query_lower = user_query.lower()
        columns = [col['name'] for col in schema['columns']]
        
        # Detect chart type from query
        if 'pie' in query_lower:
            chart_type = 'pie'
        elif 'bar' in query_lower:
            chart_type = 'bar'
        elif 'area' in query_lower:
            chart_type = 'area'
        elif 'scatter' in query_lower:
            chart_type = 'scatter'
        else:
            chart_type = 'line'  # default
        
        # Build config based on common patterns
        if 'revenue' in query_lower and 'cost' in query_lower:
            config = self._generate_revenue_vs_costs_config(schema, chart_type)
        elif 'margin' in query_lower:
            config = self._generate_margin_config(schema, chart_type)
        elif 'region' in query_lower:
            config = self._generate_regional_config(schema, chart_type)
        else:
            config = self._generate_default_config(schema, chart_type)
        
        # Build conversation history
        messages = conversation_history or []
        messages.append({"role": "user", "content": user_query})
        messages.append({"role": "assistant", "content": json.dumps(config)})
        
        return {
            "success": True,
            "config": config,
            "conversation_history": messages,
            "raw_response": json.dumps(config)
        }
    
    def _generate_revenue_vs_costs_config(self, schema: Dict[str, Any], chart_type: str) -> Dict[str, Any]:
        """Generate config for revenue vs costs comparison."""
        return {
            "chartType": chart_type,
            "title": "Revenue vs Costs",
            "echartOption": {
                "tooltip": {
                    "trigger": "axis",
                    "axisPointer": {
                        "type": "shadow"
                    }
                },
                "legend": {
                    "data": ["Revenue", "Costs"],
                    "bottom": 10
                },
                "grid": {
                    "left": "3%",
                    "right": "4%",
                    "bottom": "15%",
                    "containLabel": True
                },
                "xAxis": {
                    "type": "category",
                    "data": {"dataField": "quarter"},
                    "axisLine": {
                        "lineStyle": {"color": "#e2e8f0"}
                    },
                    "axisLabel": {
                        "color": "#64748b"
                    }
                },
                "yAxis": {
                    "type": "value",
                    "name": "Amount ($)",
                    "nameTextStyle": {
                        "color": "#64748b"
                    },
                    "axisLine": {
                        "lineStyle": {"color": "#e2e8f0"}
                    },
                    "axisLabel": {
                        "color": "#64748b",
                        "formatter": "${value}"
                    },
                    "splitLine": {
                        "lineStyle": {"color": "#f1f5f9"}
                    }
                },
                "series": [
                    {
                        "name": "Revenue",
                        "type": chart_type,
                        "data": {"dataField": "revenue"},
                        "itemStyle": {"color": "#10b981"},
                        "smooth": True if chart_type == "line" else False
                    },
                    {
                        "name": "Costs",
                        "type": chart_type,
                        "data": {"dataField": "costs"},
                        "itemStyle": {"color": "#ef4444"},
                        "smooth": True if chart_type == "line" else False
                    }
                ]
            },
            "dataMapping": {
                "xAxis": "quarter",
                "series": ["revenue", "costs"]
            },
            "explanation": f"Generated a {chart_type} chart comparing revenue and costs over time"
        }
    
    def _generate_margin_config(self, schema: Dict[str, Any], chart_type: str) -> Dict[str, Any]:
        """Generate config for margin analysis."""
        return {
            "chartType": chart_type,
            "title": "Profit Margin Trends",
            "echartOption": {
                "tooltip": {
                    "trigger": "axis"
                },
                "legend": {
                    "data": ["Margin %"],
                    "bottom": 10
                },
                "grid": {
                    "left": "3%",
                    "right": "4%",
                    "bottom": "15%",
                    "containLabel": True
                },
                "xAxis": {
                    "type": "category",
                    "data": {"dataField": "quarter"},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {"color": "#64748b"}
                },
                "yAxis": {
                    "type": "value",
                    "name": "Margin (%)",
                    "nameTextStyle": {"color": "#64748b"},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {
                        "color": "#64748b",
                        "formatter": "{value}%"
                    },
                    "splitLine": {"lineStyle": {"color": "#f1f5f9"}}
                },
                "series": [
                    {
                        "name": "Margin %",
                        "type": chart_type,
                        "data": {"dataField": "margin"},
                        "itemStyle": {"color": "#2563eb"},
                        "smooth": True,
                        "areaStyle": {} if chart_type == "area" else None
                    }
                ]
            },
            "dataMapping": {
                "xAxis": "quarter",
                "series": ["margin"]
            },
            "explanation": f"Generated a {chart_type} chart showing profit margin trends"
        }
    
    def _generate_regional_config(self, schema: Dict[str, Any], chart_type: str) -> Dict[str, Any]:
        """Generate config for regional comparison."""
        return {
            "chartType": "bar",
            "title": "Regional Performance Comparison",
            "echartOption": {
                "tooltip": {
                    "trigger": "axis",
                    "axisPointer": {"type": "shadow"}
                },
                "legend": {
                    "data": ["Revenue"],
                    "bottom": 10
                },
                "grid": {
                    "left": "3%",
                    "right": "4%",
                    "bottom": "15%",
                    "containLabel": True
                },
                "xAxis": {
                    "type": "category",
                    "data": {"dataField": "region"},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {"color": "#64748b"}
                },
                "yAxis": {
                    "type": "value",
                    "name": "Revenue ($)",
                    "nameTextStyle": {"color": "#64748b"},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {
                        "color": "#64748b",
                        "formatter": "${value}"
                    },
                    "splitLine": {"lineStyle": {"color": "#f1f5f9"}}
                },
                "series": [
                    {
                        "name": "Revenue",
                        "type": "bar",
                        "data": {"dataField": "revenue"},
                        "itemStyle": {"color": "#2563eb"}
                    }
                ]
            },
            "dataMapping": {
                "xAxis": "region",
                "series": ["revenue"]
            },
            "explanation": "Generated a bar chart comparing revenue across regions"
        }
    
    def _generate_default_config(self, schema: Dict[str, Any], chart_type: str) -> Dict[str, Any]:
        """Generate a default config when pattern doesn't match."""
        columns = [col for col in schema['columns'] if col['type'] in ['integer', 'number']]
        temporal_col = next((col for col in schema['columns'] if col['type'] == 'temporal'), None)
        
        x_field = temporal_col['name'] if temporal_col else schema['columns'][0]['name']
        y_field = columns[0]['name'] if columns else schema['columns'][1]['name']
        
        return {
            "chartType": chart_type,
            "title": f"{y_field.title()} Over Time",
            "echartOption": {
                "tooltip": {"trigger": "axis"},
                "legend": {"data": [y_field.title()], "bottom": 10},
                "grid": {
                    "left": "3%",
                    "right": "4%",
                    "bottom": "15%",
                    "containLabel": True
                },
                "xAxis": {
                    "type": "category",
                    "data": {"dataField": x_field},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {"color": "#64748b"}
                },
                "yAxis": {
                    "type": "value",
                    "nameTextStyle": {"color": "#64748b"},
                    "axisLine": {"lineStyle": {"color": "#e2e8f0"}},
                    "axisLabel": {"color": "#64748b"},
                    "splitLine": {"lineStyle": {"color": "#f1f5f9"}}
                },
                "series": [
                    {
                        "name": y_field.title(),
                        "type": chart_type,
                        "data": {"dataField": y_field},
                        "itemStyle": {"color": "#2563eb"},
                        "smooth": True if chart_type == "line" else False
                    }
                ]
            },
            "dataMapping": {
                "xAxis": x_field,
                "series": [y_field]
            },
            "explanation": f"Generated a {chart_type} chart showing {y_field} trends"
        }


# Singleton instance
mock_llm_service = MockLLMService()
