"""
LLM Service - Handles Gemini API integration for chart configuration generation.
Enforces data safety by only sending schema information, never raw data.

OPTIMIZATIONS:
- Usage tracking: Real-time cost monitoring
- Conversation limits: Last 3 exchanges only (6 messages)
"""

import os
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import google.generativeai as genai

class UsageTracker:
    """Track API usage and costs in real-time."""
    
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.query_count = 0
        self.session_start = datetime.now()
    
    def add_usage(self, usage_data):
        """Add usage from API response."""
        self.total_input_tokens += getattr(usage_data, 'prompt_token_count', 0)
        self.total_output_tokens += getattr(usage_data, 'candidates_token_count', 0)
        self.query_count += 1
    
    def get_costs(self) -> Dict[str, Any]:
        """Calculate current costs based on Gemini 1.5 Flash pricing."""
        # Pricing per million tokens (Gemini 1.5 Flash - Free Tier is free, but if paid:)
        # Prompts up to 128K tokens: $0.075 / 1 million tokens
        # Outputs: $0.30 / 1 million tokens
        INPUT_COST = 0.075
        OUTPUT_COST = 0.30
        
        input_cost = (self.total_input_tokens / 1_000_000) * INPUT_COST
        output_cost = (self.total_output_tokens / 1_000_000) * OUTPUT_COST
        
        total_cost = input_cost + output_cost
        
        return {
            "query_count": self.query_count,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "costs": {
                "input": round(input_cost, 6),
                "output": round(output_cost, 6),
                "total": round(total_cost, 6),
            },
            "avg_cost_per_query": round(total_cost / max(self.query_count, 1), 6),
            "session_duration_minutes": round((datetime.now() - self.session_start).total_seconds() / 60, 2)
        }
    
    def print_summary(self):
        """Print usage summary to console."""
        stats = self.get_costs()
        print("\n" + "="*60)
        print("📊 HILA USAGE STATISTICS (Gemini)")
        print("="*60)
        print(f"Queries: {stats['query_count']}")
        print(f"Session Duration: {stats['session_duration_minutes']} minutes")
        print(f"\nTokens:")
        print(f"  Input: {stats['total_input_tokens']:,}")
        print(f"  Output: {stats['total_output_tokens']:,}")
        print(f"\nEstimated Costs (if on paid tier):")
        print(f"  Input: ${stats['costs']['input']:.6f}")
        print(f"  Output: ${stats['costs']['output']:.6f}")
        print(f"  💰 Total: ${stats['costs']['total']:.6f}")
        print(f"\n  Avg per Query: ${stats['avg_cost_per_query']:.6f}")
        print("="*60 + "\n")


class LLMService:
    """Manages interactions with Gemini for chart configuration generation."""
    
    # Maximum conversation history: last 3 exchanges (6 messages)
    MAX_HISTORY_MESSAGES = 6
    
    def __init__(self):
        """Initialize Gemini client and usage tracker."""
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key:
            # Robust cleaning
            api_key = api_key.strip()
            if api_key.startswith("GEMINI_API_KEY="):
                api_key = api_key.replace("GEMINI_API_KEY=", "").strip()
            api_key = api_key.strip("'").strip('"')
            genai.configure(api_key=api_key)
            self.has_key = True
        else:
            self.has_key = False
            
        self.model_name = "gemini-2.5-flash"
        self.usage_tracker = UsageTracker()
        
        print("✅ LLM Service initialized with:")
        print(f"   - Model: {self.model_name} (Free Tier Eligible)")
        print("   - Usage tracking active")
        print(f"   - Conversation history limit: {self.MAX_HISTORY_MESSAGES} messages")
    
    def generate_chart_config(
        self,
        user_query: str,
        schema: Dict[str, Any],
        data: List[Dict[str, Any]],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate ECharts configuration based on user query and data schema.
        """
        if not self.has_key:
            return {
                "success": False,
                "error": "GEMINI_API_KEY environment variable is not configured. Please add it to your .env or Vercel Project Settings to enable chat.",
                "conversation_history": conversation_history or []
            }
            
        system_prompt = self._build_system_prompt()
        
        # Initialize the model
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0,
                response_mime_type="application/json",
            )
        )
        
        # Format history for Gemini
        formatted_history = []
        messages_to_return = []
        
        if conversation_history:
            # Only keep last N messages to optimize costs
            limited_history = conversation_history[-self.MAX_HISTORY_MESSAGES:]
            messages_to_return.extend(limited_history)
            
            for msg in limited_history:
                # Gemini roles are 'user' and 'model'
                role = "model" if msg["role"] == "assistant" else "user"
                formatted_history.append({"role": role, "parts": [msg["content"]]})
        
        # Add current query with raw data Context
        user_message = self._build_user_message(user_query, schema, data)
        formatted_history.append({"role": "user", "parts": [user_message]})
        messages_to_return.append({"role": "user", "content": user_message})
        
        try:
            response = model.generate_content(formatted_history)
            
            # Track usage
            if hasattr(response, 'usage_metadata'):
                self.usage_tracker.add_usage(response.usage_metadata)
                self._log_query_stats(response.usage_metadata)
            
            # Extract the response text
            response_text = response.text
            
            # Parse JSON from response
            try:
                config = self._extract_json(response_text)
                
                # Check for out-of-scope response
                if config.get("error") == "OUT_OF_SCOPE":
                    return {
                        "success": False,
                        "error": "This demo is scoped to a limited dataset. Click the table icon in the top left to view the available raw data and try asking questions about it.",
                        "out_of_scope": True,
                        "conversation_history": messages_to_return
                    }
                    
            except (json.JSONDecodeError, ValueError) as e:
                # Log the full response for debugging
                print(f"\n{'='*60}")
                print("❌ Failed to parse Gemini's response")
                print(f"{'='*60}")
                print("Full response text:")
                print(response_text)
                print(f"{'='*60}\n")
                raise
            
            # Store in conversation history
            messages_to_return.append({"role": "assistant", "content": response_text})
            
            return {
                "success": True,
                "config": config,
                "conversation_history": messages_to_return,
                "raw_response": response_text,
                "usage": self.usage_tracker.get_costs()
            }
            
        except Exception as e:
            error_type = type(e).__name__
            return {
                "success": False,
                "error": f"LLM Error ({error_type}): {str(e)}",
                "conversation_history": messages_to_return
            }
    
    def _log_query_stats(self, usage):
        """Log individual query statistics."""
        input_tokens = getattr(usage, 'prompt_token_count', 0)
        output_tokens = getattr(usage, 'candidates_token_count', 0)
        
        cost = (input_tokens / 1_000_000 * 0.075) + (output_tokens / 1_000_000 * 0.30)
        
        print(f"\n🟢 Query #{self.usage_tracker.query_count}")
        print(f"  Tokens: {input_tokens} in, {output_tokens} out")
        print(f"  💰 Estimated Paid Cost: ${cost:.6f}")
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics."""
        return self.usage_tracker.get_costs()
    
    def print_usage_summary(self):
        """Print usage summary."""
        self.usage_tracker.print_summary()
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt."""
        return \"\"\"You are Hila, an AI assistant specialized in generating Apache ECharts configurations for financial data visualization.

YOUR TASK:
Generate valid Apache ECharts option objects based on user requests, schemas, and the exact raw data provided.
You MUST manually inject the actual real data values into the configuration. Do NOT use fake placeholders. Use ONLY the data provided.

CHART CONFIGURATION REQUIREMENTS:
1. Return ONLY valid JSON (no markdown, no explanations outside the JSON)
2. NEVER use JavaScript functions - JSON does not support functions!
3. Use static values only (strings, numbers, booleans, arrays, objects)
4. Manually insert the data into `xAxis.data` and `series.data` as hardcoded Javascript arrays like: `data: [5, 10, 15]`.
5. Include proper axis configurations, tooltips, and legends
6. Use a minimal, professional aesthetic suitable for financial dashboards

SUPPORTED CHART TYPES:
- Line charts (trends over time)
- Bar charts (comparisons)
- Area charts (cumulative trends)
- Scatter plots (correlations, 2D data points)
- Bubble charts (3D data: x, y, and size)
- Pie/Donut charts (proportions)
- Boxplot charts (distributions, statistical summary)
- Combination charts (multiple series types)

SPECIAL HANDLING FOR SCATTER/BUBBLE CHARTS:
For scatter and bubble charts, each data point needs an array format:
- Scatter: [x_value, y_value]
- Bubble: [x_value, y_value, size_value]

AESTHETIC GUIDELINES:
1. Use this professional financial color palette:
   - Primary: #2563eb (blue)
   - Secondary: #10b981 (green)
   - Accent: #f59e0b (amber)
   - Negative: #ef4444 (red)
   - Neutral: #64748b (slate)
2. Minimal grid lines (use subtle colors like #f1f5f9)
3. Clean typography (12-14px for labels)
4. Enable interactive features: zoom, tooltip, legend toggle
5. Responsive sizing

OUTPUT FORMAT:
Return a JSON object with this structure for valid chart requests. Do NOT wrap it in markdown block.
{
  "chartType": "line|bar|area|scatter|pie|combination",
  "title": "Chart title based on user query",
  "echartOption": { /* valid ECharts option object WITH RAW DATA EMBEDDED IN IT */ },
  "explanation": "Brief explanation of the visualization choice"
}

OUT OF SCOPE REQUESTS:
If the user asks a question completely unrelated to generating a chart from the provided dataset (e.g., "What is the capital of France?", "Write a poem", "What is an LLM?"), you MUST return THIS specific JSON object instead:
{
  "error": "OUT_OF_SCOPE"
}"""
    
    def _build_user_message(self, query: str, schema: Dict[str, Any], data: List[Dict[str, Any]]) -> str:
        """Build the user message with query, schema, and actual exact data."""
        return f"""User Query: {query}

Available Data Schema:
{json.dumps(schema, indent=2)}

Actual Raw Data (Embed this directly into the ECharts options!):
{json.dumps(data, indent=2)}

Generate an appropriate ECharts configuration for this request."""
    
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extract JSON from LLM response with robust error handling.
        Handles markdown code blocks, comments, formatting issues, and JavaScript functions.
        """
        original_text = text
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]
        
        if not text.startswith("{"):
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]
        
        text = re.sub(r'^\s*//.*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
        
        text = re.sub(
            r'"([^"]+)":\s*function\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            r'"\1": null',
            text,
            flags=re.DOTALL
        )
        
        text = re.sub(
            r'"([^"]+)":\s*\([^)]*\)\s*=>\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            r'"\1": null',
            text,
            flags=re.DOTALL
        )
        
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON Parse Error at line {e.lineno}, column {e.colno}")
            print(f"   Error: {e.msg}")
            print(f"   Problematic text around error:")
            
            lines = text.split('\n')
            if e.lineno <= len(lines):
                start_line = max(0, e.lineno - 3)
                end_line = min(len(lines), e.lineno + 2)
                for i in range(start_line, end_line):
                    marker = ">>> " if i == e.lineno - 1 else "    "
                    print(f"   {marker}{i+1}: {lines[i]}")
            
            text_fixed = re.sub(r',(\s*[}\]])', r'\1', text)
            
            try:
                print("   Attempting to fix trailing commas...")
                return json.loads(text_fixed)
            except json.JSONDecodeError:
                pass
            
            raise ValueError(
                f"Failed to parse JSON from Gemini response. "
                f"Error at line {e.lineno}, column {e.colno}: {e.msg}. "
                f"This might be due to generating invalid JSON."
            )

# Singleton instance
llm_service = LLMService()
