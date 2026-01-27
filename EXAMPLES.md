# Example Queries for Hila

Try these natural language queries to see Hila in action!

## Basic Visualizations

### Line Charts (Trends)
- "Show me revenue trends over time"
- "Display Q3 revenue vs costs"
- "Create a line chart of margins by quarter"
- "Plot revenue and costs together"

### Bar Charts (Comparisons)
- "Compare revenue across regions"
- "Show me a bar chart of Q3 costs by region"
- "Compare Q1 vs Q2 revenue"
- "Display costs for North America vs Europe"

### Area Charts (Cumulative)
- "Show cumulative revenue over time"
- "Create an area chart of revenue trends"
- "Display stacked revenue and costs"

### Pie Charts (Proportions)
- "Show revenue distribution by region"
- "Create a pie chart of Q3 revenue by region"
- "Display cost breakdown"

## Advanced Queries

### Multiple Series
- "Compare revenue, costs, and margin together"
- "Show all metrics for Q3"
- "Plot revenue vs costs with margin overlay"

### Filtering
- "Show only North America data"
- "Display Q3 and Q4 only"
- "Filter for 2024 data"

### Aggregations
- "Show total revenue by region"
- "Calculate average margin per quarter"
- "Sum costs across all quarters"

## Conversational Refinement

After generating a chart, try these follow-up queries:

### Chart Type Changes
- "Change this to a bar chart"
- "Make it an area chart instead"
- "Show this as a pie chart"

### Data Modifications
- "Add margin to the chart"
- "Remove costs from the visualization"
- "Include region breakdown"

### Visual Enhancements
- "Add a trendline"
- "Make the colors more vibrant"
- "Show data labels"
- "Add a title"

### Comparisons
- "Compare this to last year"
- "Show year-over-year growth"
- "Add 2023 data for comparison"

## Dataset-Specific Queries

### Quarterly Financials Dataset
Available columns: `quarter`, `revenue`, `costs`, `margin`, `region`

- "Show Q3 2024 performance"
- "Compare North America vs Europe margins"
- "Display revenue growth from Q1 to Q3"
- "Show cost trends for Europe"

### Monthly Metrics Dataset
Available columns: `month`, `active_users`, `churn_rate`, `arpu`

- "Show active users growth"
- "Plot churn rate over time"
- "Display ARPU trends"
- "Compare active users vs churn rate"

## Tips for Best Results

1. **Be Specific**: Instead of "show data", say "show revenue by quarter"
2. **Use Column Names**: Reference actual column names from the schema
3. **Specify Chart Type**: If you have a preference, mention it (line, bar, pie, etc.)
4. **Iterate**: Start simple, then refine with follow-up questions
5. **Compare**: Ask for multiple metrics to see relationships

## Example Conversation Flow

```
You: "Show me Q3 revenue vs costs"
Hila: [Generates line chart]

You: "Change this to a bar chart"
Hila: [Updates to bar chart]

You: "Add margin to the chart"
Hila: [Adds margin series]

You: "Compare North America vs Europe"
Hila: [Adds region breakdown]
```

## Financial Analysis Examples

### Profitability Analysis
- "Show margin trends over time"
- "Compare revenue vs costs to identify profitability"
- "Display margin percentage by quarter"

### Regional Performance
- "Compare regional revenue performance"
- "Show cost efficiency by region"
- "Display margin differences between regions"

### Growth Analysis
- "Show quarter-over-quarter revenue growth"
- "Compare 2023 vs 2024 performance"
- "Display revenue acceleration"

### User Metrics (Monthly Dataset)
- "Show user growth trajectory"
- "Analyze churn rate trends"
- "Display ARPU evolution"
- "Compare user growth vs churn"

---

**Pro Tip**: Hila learns from context! The more you chat, the better it understands what you're looking for.
