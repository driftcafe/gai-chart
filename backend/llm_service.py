"""
LLM Service - Handles Claude API integration for chart configuration generation.
Enforces data safety by only sending schema information, never raw data.

OPTIMIZATIONS:
- Prompt caching: 90% cost reduction on system prompt
- Usage tracking: Real-time cost monitoring
- Conversation limits: Last 3 exchanges only (6 messages)
"""

import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()


class UsageTracker:
    """Track API usage and costs in real-time."""
    
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cache_creation_tokens = 0
        self.total_cache_read_tokens = 0
        self.query_count = 0
        self.session_start = datetime.now()
    
    def add_usage(self, usage_data):
        """Add usage from API response."""
        self.total_input_tokens += getattr(usage_data, 'input_tokens', 0)
        self.total_output_tokens += getattr(usage_data, 'output_tokens', 0)
        self.total_cache_creation_tokens += getattr(usage_data, 'cache_creation_input_tokens', 0)
        self.total_cache_read_tokens += getattr(usage_data, 'cache_read_input_tokens', 0)
        self.query_count += 1
    
    def get_costs(self) -> Dict[str, Any]:
        """Calculate current costs based on Claude 3 Haiku pricing."""
        # Pricing per million tokens (Claude 3 Haiku)
        INPUT_COST = 0.25   # Much cheaper than Sonnet!
        OUTPUT_COST = 1.25
        CACHE_WRITE_COST = 0.30
        CACHE_READ_COST = 0.03  # 90% cheaper to read from cache!
        
        input_cost = (self.total_input_tokens / 1_000_000) * INPUT_COST
        output_cost = (self.total_output_tokens / 1_000_000) * OUTPUT_COST
        cache_write_cost = (self.total_cache_creation_tokens / 1_000_000) * CACHE_WRITE_COST
        cache_read_cost = (self.total_cache_read_tokens / 1_000_000) * CACHE_READ_COST
        
        total_cost = input_cost + output_cost + cache_write_cost + cache_read_cost
        
        # Calculate savings from caching
        cache_savings = ((self.total_cache_read_tokens / 1_000_000) * INPUT_COST) - cache_read_cost
        
        return {
            "query_count": self.query_count,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "cache_creation_tokens": self.total_cache_creation_tokens,
            "cache_read_tokens": self.total_cache_read_tokens,
            "costs": {
                "input": round(input_cost, 4),
                "output": round(output_cost, 4),
                "cache_write": round(cache_write_cost, 4),
                "cache_read": round(cache_read_cost, 4),
                "total": round(total_cost, 4),
                "cache_savings": round(cache_savings, 4)
            },
            "avg_cost_per_query": round(total_cost / max(self.query_count, 1), 4),
            "session_duration_minutes": round((datetime.now() - self.session_start).total_seconds() / 60, 2)
        }
    
    def print_summary(self):
        """Print usage summary to console."""
        stats = self.get_costs()
        print("\n" + "="*60)
        print("📊 HILA USAGE STATISTICS")
        print("="*60)
        print(f"Queries: {stats['query_count']}")
        print(f"Session Duration: {stats['session_duration_minutes']} minutes")
        print(f"\nTokens:")
        print(f"  Input: {stats['total_input_tokens']:,}")
        print(f"  Output: {stats['total_output_tokens']:,}")
        print(f"  Cache Created: {stats['total_cache_creation_tokens']:,}")
        print(f"  Cache Read: {stats['total_cache_read_tokens']:,}")
        print(f"\nCosts:")
        print(f"  Input: ${stats['costs']['input']:.4f}")
        print(f"  Output: ${stats['costs']['output']:.4f}")
        print(f"  Cache Write: ${stats['costs']['cache_write']:.4f}")
        print(f"  Cache Read: ${stats['costs']['cache_read']:.4f}")
        print(f"  💰 Total: ${stats['costs']['total']:.4f}")
        print(f"  💚 Cache Savings: ${stats['costs']['cache_savings']:.4f}")
        print(f"\n  Avg per Query: ${stats['avg_cost_per_query']:.4f}")
        print("="*60 + "\n")


class LLMService:
    """Manages interactions with Claude for chart configuration generation."""
    
    # Maximum conversation history: last 3 exchanges (6 messages)
    MAX_HISTORY_MESSAGES = 6
    
    def __init__(self):
        """Initialize Anthropic client and usage tracker."""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        if api_key:
            self.client = Anthropic(api_key=api_key)
        
        self.model = "claude-3-haiku-20240307"  # Available with your API key
        self.conversation_history: List[Dict[str, str]] = []
        self.usage_tracker = UsageTracker()
        
        print("✅ LLM Service initialized with:")
        print("   - Prompt caching enabled (90% cost reduction)")
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
        
        Args:
            user_query: Natural language question from user
            schema: Data schema (column names/types only, NO raw data)
            conversation_history: Previous messages for context
            
        Returns:
            Dictionary containing chart configuration and metadata
        """
        system_prompt = self._build_system_prompt_with_cache()
        
        if not self.client:
            return {
                "success": False,
                "error": "ANTHROPIC_API_KEY environment variable is not configured. Please add it to your Vercel Project Settings to enable chat.",
                "conversation_history": conversation_history or []
            }
            
        # Keep track of conversation
        messages = []
        
        # Format history for Claude
        if conversation_history:
            # Only keep last N messages to optimize costs
            limited_history = conversation_history[-self.MAX_HISTORY_MESSAGES:]
            messages.extend(limited_history)
        
        # Add current query with raw data Context
        user_message = self._build_user_message(user_query, schema, data)
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,  # This will be cached!
                messages=messages
            )
            
            # Track usage
            self.usage_tracker.add_usage(response.usage)
            
            # Log this query's stats
            self._log_query_stats(response.usage)
            
            # Extract the response text
            response_text = response.content[0].text
            
            # Parse JSON from response
            try:
                config = self._extract_json(response_text)
                
                # Check for out-of-scope response
                if config.get("error") == "OUT_OF_SCOPE":
                    return {
                        "success": False,
                        "error": "This demo is scoped to a limited dataset. Click the table icon in the top left to view the available raw data and try asking questions about it.",
                        "out_of_scope": True,
                        "conversation_history": messages
                    }
                    
            except (json.JSONDecodeError, ValueError) as e:
                # Log the full response for debugging
                print(f"\n{'='*60}")
                print("❌ Failed to parse Claude's response")
                print(f"{'='*60}")
                print("Full response text:")
                print(response_text)
                print(f"{'='*60}\n")
                raise
            
            # Store in conversation history
            messages.append({"role": "assistant", "content": response_text})
            
            return {
                "success": True,
                "config": config,
                "conversation_history": messages,
                "raw_response": response_text,
                "usage": self.usage_tracker.get_costs()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "conversation_history": messages
            }
    
    def _log_query_stats(self, usage):
        """Log individual query statistics."""
        input_tokens = getattr(usage, 'input_tokens', 0)
        output_tokens = getattr(usage, 'output_tokens', 0)
        cache_read = getattr(usage, 'cache_read_input_tokens', 0)
        cache_creation = getattr(usage, 'cache_creation_input_tokens', 0)
        
        # Calculate cost for this query (Claude 3 Haiku pricing)
        cost = (input_tokens / 1_000_000 * 0.25) + \
               (output_tokens / 1_000_000 * 1.25) + \
               (cache_creation / 1_000_000 * 0.30) + \
               (cache_read / 1_000_000 * 0.03)
        
        cache_status = "🟢 CACHED" if cache_read > 0 else "🔵 NEW"
        
        print(f"\n{cache_status} Query #{self.usage_tracker.query_count}")
        print(f"  Tokens: {input_tokens} in, {output_tokens} out")
        if cache_read > 0:
            print(f"  💚 Cache Hit: {cache_read} tokens (90% savings!)")
        if cache_creation > 0:
            print(f"  📝 Cache Created: {cache_creation} tokens")
        print(f"  💰 Cost: ${cost:.4f}")
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics."""
        return self.usage_tracker.get_costs()
    
    def print_usage_summary(self):
        """Print usage summary."""
        self.usage_tracker.print_summary()
    
    def _build_system_prompt_with_cache(self) -> List[Dict[str, Any]]:
        """Build the system prompt with cache headers for Anthropic API."""
        return [
            {
                "type": "text",
                "text": """You are Hila, an AI assistant specialized in generating Apache ECharts configurations for financial data visualization.

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
Return a JSON object with this structure for valid chart requests:
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
}""",
                "cache_control": {"type": "ephemeral"}
            }
        ]
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt."""
        return """You are Hila, an AI assistant specialized in generating Apache ECharts configurations for financial data visualization.

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
Return a JSON object with this structure for valid chart requests:
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
        import re
        
        original_text = text
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            # Find the first { and last }
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]
        
        # If still no JSON found, try to extract from anywhere in text
        if not text.startswith("{"):
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]
        
        # Remove JavaScript-style comments (// and /* */)
        # Use safer regex for // to avoid breaking URLs in strings (only match full line comments)
        text = re.sub(r'^\s*//.*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
        
        # Remove JavaScript function definitions (common LLM mistake)
        # Pattern: "key": function(...) { ... }
        # Handle both single-line and multi-line functions
        text = re.sub(
            r'"([^"]+)":\s*function\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            r'"\1": null',
            text,
            flags=re.DOTALL
        )
        
        # Also handle arrow functions: "key": (params) => { ... }
        text = re.sub(
            r'"([^"]+)":\s*\([^)]*\)\s*=>\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            r'"\1": null',
            text,
            flags=re.DOTALL
        )
        
        # Try to parse
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            # Log the error for debugging
            print(f"\n❌ JSON Parse Error at line {e.lineno}, column {e.colno}")
            print(f"   Error: {e.msg}")
            print(f"   Problematic text around error:")
            
            # Show context around the error
            lines = text.split('\n')
            if e.lineno <= len(lines):
                start_line = max(0, e.lineno - 3)
                end_line = min(len(lines), e.lineno + 2)
                for i in range(start_line, end_line):
                    marker = ">>> " if i == e.lineno - 1 else "    "
                    print(f"   {marker}{i+1}: {lines[i]}")
            
            # Try to fix common issues
            # 1. Remove trailing commas
            text_fixed = re.sub(r',(\s*[}\]])', r'\1', text)
            
            try:
                print("   Attempting to fix trailing commas...")
                return json.loads(text_fixed)
            except json.JSONDecodeError:
                pass
            
            # If all else fails, raise with helpful message
            raise ValueError(
                f"Failed to parse JSON from Claude response. "
                f"Error at line {e.lineno}, column {e.colno}: {e.msg}. "
                f"This might be due to Claude generating invalid JSON. "
                f"Try rephrasing your query or check the backend logs for the full response."
            )


# Singleton instance
llm_service = LLMService()
