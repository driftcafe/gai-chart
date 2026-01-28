# Hila Demo Script - Generative Charts for Financial Data

## Overview
This demo showcases Hila's ability to generate and refine various chart types from natural language queries. Starting from a default view, we'll conversationally explore the data using line charts, bar charts, bubble charts, heatmaps, and treemaps.

**Dataset**: 18 product groups with quarterly revenue data (FY26-Q1 to FY27-Q4)

---

## Demo Flow (6-8 minutes)

### 1. **Cold Start - Default Line Chart** (45 seconds)
**Action**: Open http://localhost:3000

**What to say**:
> "Welcome to Hila - a generative charting application powered by AI. When you load the app, it automatically displays your data. Here we see revenue trends for the top 5 product groups across 8 fiscal quarters from FY26 to FY27. This is our starting point."

**What you'll see**: 
- Line chart with 5 colored lines (top 5 product groups)
- X-axis: FY26-Q1 through FY27-Q4
- Y-axis: Revenue in USD
- Smooth trend lines showing quarterly performance
- Legend identifying each product group
- Assistant message: "I've loaded your default dataset with 18 product groups..."

**Key points**:
- **Instant data visualization** - no waiting for initial load
- **Smart defaults** - automatically shows top performers
- **Clean, modern UI** - ready for interaction

---

### 2. **Refinement - Focus on Specific Products** (1 minute)

**Query**: 
```
Show me just Household Products, Beverages, and Dairy Alternatives
```

**What to say**:
> "Let's refine this view. I'll ask Hila to focus on just three specific product categories. Notice I'm using natural language - no SQL, no configuration files."

**What you'll see**:
- Loading overlay: "Generating chart..." with spinner
- Line chart updates to show only 3 lines
- Same time range (all 8 quarters)
- Legend updates to show only the 3 requested products
- Smooth transition from previous chart

**Key points**:
- **Conversational refinement** - building on the existing view
- **Loading feedback** - users see progress during generation
- **Natural language filtering** - just name the products you want

---

### 3. **Pivot - Change to Bar Chart** (1 minute)

**Query**:
```
Change this to a bar chart showing just FY27-Q4 revenue for all product groups
```

**What to say**:
> "Now let's pivot our analysis. Instead of trends over time, let's compare all 18 product groups for a single quarter. I'll ask for a bar chart of the most recent quarter."

**What you'll see**:
- Loading overlay appears
- Chart type changes from line to bar
- X-axis: Product group names (all 18)
- Y-axis: FY27-Q4 revenue
- Bars sorted by value (tallest to shortest)
- Easy visual comparison of top vs bottom performers

**Key points**:
- **Chart type switching** - from line to bar in one query
- **Time slice** - from 8 quarters to 1 quarter
- **Category expansion** - from 3 products to all 18
- **Automatic sorting** - bars ordered by value for easy comparison

---

### 4. **New Analysis - Bubble Chart** (1.5 minutes)

**Query**:
```
Create a bubble chart with FY26-Q1 on x-axis, FY27-Q1 on y-axis, and FY27-Q2 as bubble size
```

**What to say**:
> "Here's where it gets powerful. Bubble charts let us see three dimensions at once. We're comparing early FY26 performance against early FY27 performance, while bubble size shows mid-FY27 revenue. This helps us spot growth patterns and outliers."

**What you'll see**:
- Loading overlay (may take a few seconds)
- Scatter plot with bubbles of varying sizes
- X-axis: FY26-Q1 revenue
- Y-axis: FY27-Q1 revenue  
- Bubble size: FY27-Q2 revenue (automatically scaled)
- 18 bubbles (one per product group)
- Diagonal pattern showing correlation
- Larger bubbles indicate higher Q2 revenue

**Key points**:
- **Multi-dimensional analysis** - 3 variables in one view
- **Automatic scaling** - bubble sizes normalized (10-60px)
- **Correlation discovery** - visual pattern shows Q1 FY26 vs Q1 FY27 relationship
- **Interactive tooltips** - hover shows all three values

**Pro tip**: Hover over the largest bubble to show tooltip with exact values

---

### 5. **Pattern Discovery - Heatmap** (1 minute)

**Query**:
```
Show me a heatmap of revenue across all quarters for the top 10 product groups
```

**What to say**:
> "Heatmaps are excellent for spotting patterns. This grid shows us which combinations of product groups and quarters had the highest revenue. Color intensity makes it easy to see hot spots at a glance."

**What you'll see**:
- Grid layout: 10 rows (product groups) × 8 columns (quarters)
- Color gradient: light (low revenue) to dark blue (high revenue)
- Top 10 product groups on Y-axis
- All 8 quarters on X-axis
- Immediate visual patterns (seasonal trends, consistent performers)
- Hover shows exact revenue values

**Key points**:
- **Pattern recognition** - spot trends across two dimensions
- **Automatic filtering** - "top 10" keeps it readable
- **Color encoding** - intensity = value magnitude
- **Dense information** - 80 data points in one compact view

---

### 6. **Proportional View - Treemap** (1 minute)

**Query**:
```
Show me a treemap of FY27-Q4 revenue by product group
```

**What to say**:
> "Treemaps are perfect for understanding proportions. Each rectangle's size represents that product group's share of total Q4 revenue. You can immediately see which categories dominate the market."

**What you'll see**:
- Nested rectangles filling the chart area
- Larger rectangles = higher revenue products
- Each labeled with product group name
- Color-coded for visual distinction
- Proportional sizing (e.g., if Household Products is 20% of total, it takes 20% of space)
- Hover shows exact revenue and percentage

**Key points**:
- **Part-to-whole relationships** - see market share visually
- **Space-efficient** - all 18 groups in one view
- **Immediate insights** - largest rectangles = biggest contributors
- **No need for percentages** - visual sizing tells the story

---

### 7. **Advanced Filtering** (1 minute)

**Query**:
```
Show me a line chart of only quarters where Household Products revenue exceeded 5 million
```

**What to say**:
> "Hila also understands conditional filtering. I can ask it to show only data points that meet certain criteria. The AI interprets the condition and the frontend applies it."

**What you'll see**:
- Line chart for Household Products
- Only quarters with revenue > $5M are plotted
- Gaps in the timeline where data doesn't meet criteria
- Clear focus on high-performance periods
- Y-axis starts near 5M (auto-scaled)

**Key points**:
- **Natural language conditions** - "exceeded 5 million"
- **Smart filtering** - LLM understands the logic
- **Focused analysis** - removes noise, highlights what matters

---

## Demo Tips & Best Practices

### Before You Start:
1. ✅ Ensure both backend and frontend are running (`./start.sh`)
2. ✅ Open http://localhost:3000 in a **fresh browser window**
3. ✅ Verify ANTHROPIC_API_KEY is set in `backend/.env`
4. ✅ Test with one simple query to confirm API is working

### During the Demo:
- **Pace yourself**: Wait for loading overlay to disappear before next query
- **Show the loading treatment**: Point out "Generating chart..." feedback
- **Interact with charts**: Hover over data points to trigger tooltips
- **Toggle table view**: Click "Table" to show raw data (proves data integrity)
- **Handle errors gracefully**: If 529 error occurs, say "API is busy, let me retry" and resubmit

### Key Talking Points:
1. **Zero configuration** - No chart libraries to learn, no config files
2. **Conversational** - Refine, pivot, and explore naturally
3. **Context-aware** - Each query builds on conversation history
4. **Data-safe** - Schema goes to LLM, actual data stays secure
5. **Real-time** - Charts generated in 2-5 seconds

---

## Backup Queries (If Time Permits or Questions Arise)

### Combination Chart:
```
Show me bars for FY26-Q1 and a line for FY27-Q1 across all product groups
```
*Demonstrates multi-series with different chart types*

### Area Chart:
```
Create a stacked area chart showing revenue contribution by product group over time
```
*Shows cumulative/proportional trends*

### Scatter Plot (2D):
```
Show me a scatter plot comparing FY26-Q1 vs FY27-Q1 revenue
```
*Simpler than bubble chart, good for correlation*

### Multiple Filters:
```
Show bar chart of FY27-Q4 revenue for product groups with "Products" in the name
```
*Demonstrates text matching filters*

### Specific Product Deep Dive:
```
Show me all quarters for Beverages as a line chart with data labels
```
*Single product focus with enhanced labeling*

---

## Troubleshooting

### If a chart doesn't render:
1. Open browser console (F12) and check for errors
2. Verify backend is running (check terminal for "🚀 Running with REAL Claude API")
3. Refresh the page to reset conversation state
4. Try a simpler query first

### If you get a 529 error:
- **What it means**: Anthropic API is temporarily overloaded
- **What to do**: Wait 5-10 seconds and click "Generate" again
- **What to say**: "The AI service is busy right now, let me retry that"
- **Not a bug**: This is normal API rate limiting

### If data looks wrong:
- Click "Table" view to verify the underlying data
- Check that product group names match exactly (case-sensitive)
- Ensure quarter names are correct (e.g., "FY26-Q1" not "Q1-FY26")

### If conversation gets confused:
- Refresh the page to clear conversation history
- Start with a clear, specific query
- Avoid ambiguous references like "that" or "those"

---

## Dataset Quick Reference

**Product Groups** (18 total):
- Baby Care, Bakery Products, Baking Ingredients, Beverages
- Breakfast Foods, Canned Goods, Condiments, Dairy Alternatives
- Frozen Foods, Grains, Health Foods, Household Products
- Nuts & Spreads, Personal Care, Pet Care, Snacks
- Sweeteners

**Note**: There are 2 entries for "Baking Ingredients" in the dataset (18 rows total)

**Fiscal Quarters** (8 total):
- FY26: Q1, Q2, Q3, Q4
- FY27: Q1, Q2, Q3, Q4

**Revenue Range**: ~$100K to ~$10M per product/quarter

**Default Chart**: Top 5 product groups, all 8 quarters, line chart

---

## Closing Statement

> "What you've seen is Hila's ability to transform natural language into actionable visualizations. We started with a default line chart and conversationally explored the data through refinements, pivots, and entirely new chart types. Whether you need trend analysis, comparisons, correlations, or proportional views, Hila understands your intent and generates the right visualization. This is the future of data exploration - conversational, intuitive, and powerful."

**Optional add**: 
> "And remember - your actual data never leaves your infrastructure. Only the schema is sent to the AI, keeping your sensitive information secure."

---

**Demo Duration**: 6-8 minutes  
**Recommended Audience**: Product managers, data analysts, executives, technical stakeholders  
**Prerequisites**: Basic understanding of business charts  
**Difficulty**: Beginner-friendly
