"""
Hila Backend - FastAPI server for generative UI chart configurations.
Implements data-safe architecture: schema to LLM, data injection on frontend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from data_service import data_service

# Toggle between real LLM and mock for testing
USE_MOCK_LLM = False  # Set to True for testing without API credits

if USE_MOCK_LLM:
    from mock_llm_service import mock_llm_service as llm_service
    print("⚠️  Running in MOCK MODE - using pattern-based chart generation")
    print("   Set USE_MOCK_LLM = False in main.py to use real Claude API")
else:
    from llm_service import llm_service
    print("🚀 Running with REAL Claude API")
    print("   Optimizations enabled: Caching, Usage Tracking, History Limits")

app = FastAPI(title="Hila - Generative UI for Financial Data")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChartRequest(BaseModel):
    query: str
    dataset: str = "quarterly_financials"
    conversation_history: Optional[List[Dict[str, str]]] = None


class ChartResponse(BaseModel):
    success: bool
    config: Optional[Dict[str, Any]] = None
    data: Optional[List[Dict[str, Any]]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    error: Optional[str] = None


class DatasetInfo(BaseModel):
    name: str
    schema: Dict[str, Any]
    sample_count: int


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "Hila - Generative UI for Financial Data",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/api/datasets", response_model=List[str])
async def list_datasets():
    """List all available datasets."""
    return data_service.list_available_datasets()


@app.get("/api/datasets/{dataset_name}", response_model=DatasetInfo)
async def get_dataset_info(dataset_name: str):
    """Get schema and metadata for a specific dataset."""
    try:
        schema = data_service.get_schema(dataset_name)
        data = data_service.get_dataset(dataset_name)
        
        return DatasetInfo(
            name=dataset_name,
            schema=schema,
            sample_count=len(data)
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Dataset not found: {str(e)}")


@app.post("/api/generate-chart", response_model=ChartResponse)
async def generate_chart(request: ChartRequest):
    """
    Generate chart configuration from natural language query.
    
    This endpoint:
    1. Extracts schema from requested dataset (NO raw data to LLM)
    2. Sends query + schema to Claude
    3. Returns chart config + actual data separately
    4. Frontend injects data into config
    """
    try:
        # Get schema (safe to send to LLM)
        schema = data_service.get_schema(request.dataset)
        
        # Get actual data (will be sent to frontend, NOT to LLM)
        data = data_service.get_dataset(request.dataset)
        
        # Generate chart configuration using LLM
        llm_response = llm_service.generate_chart_config(
            user_query=request.query,
            schema=schema,
            conversation_history=request.conversation_history
        )
        
        if not llm_response["success"]:
            return ChartResponse(
                success=False,
                error=llm_response.get("error", "Failed to generate chart configuration")
            )
        
        # Return config and data separately
        return ChartResponse(
            success=True,
            config=llm_response["config"],
            data=data,
            conversation_history=llm_response["conversation_history"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chart: {str(e)}")


@app.post("/api/refine-chart", response_model=ChartResponse)
async def refine_chart(request: ChartRequest):
    """
    Refine existing chart based on conversational context.
    Uses conversation history to maintain context.
    """
    # Same logic as generate_chart, but conversation_history provides context
    return await generate_chart(request)


@app.get("/api/usage")
async def get_usage_stats():
    """
    Get current API usage statistics and costs.
    Only available when using real Claude API (not mock mode).
    """
    if USE_MOCK_LLM:
        return {
            "mode": "mock",
            "message": "Usage tracking not available in mock mode"
        }
    
    try:
        stats = llm_service.get_usage_stats()
        return {
            "mode": "real",
            "statistics": stats
        }
    except Exception as e:
        return {
            "mode": "real",
            "error": str(e)
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
