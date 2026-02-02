# Hila Demo Script - Generative Charts for Financial Data

## Overview
This demo showcases Hila's ability to generate and refine various chart types from natural language queries. Starting from a default view, we'll conversationally explore the data using line charts, bar charts, bubble charts, heatmaps, and treemaps.

**Dataset**: 18 product groups with quarterly revenue data (FY26-Q1 to FY27-Q4)

---

## Demo Flow (6-8 minutes)

### 1. **Cold Start - Default Line Chart** (45 seconds)
**Action**: Open http://localhost:3000

**What to say**:
> "Welcome to Hila. When you load the app, it instantly visualizes your data. Here we see revenue trends for the top 5 product groups across 8 fiscal quarters. This is our starting point."

**What to do**:
- Point out the **Assistant's initial message**. Note the **Line Chart Icon** next to the text.
- Explain that this initial chart is saved in history and can be revisited.

**Key points**:
- **Instant Visualization**: No waiting, smart defaults.
- **Chart Icons**: The AI Assistant clearly indicates the chart type in the chat bubble.

---

### 2. **Interactive Drill-Down (Click-to-Context)** (1 minute)

**Action**: 
1. **Click** on the data point for **"Baking Ingredients"** (or any specific line) on the chart.
2. Notice the "Selected: Baking Ingredients" chip appears above the chat input.
3. Type: `Why is this one trending down?`

**What to say**:
> "Notice I don't have to type 'Baking Ingredients'. I can just click the data point to set the context. The system knows what I'm looking at. I ask a natural follow-up question, and Hila understands the context."

**What you'll see**:
- The chat query automatically appends the context.
- Hila generates a focused chart (likely a isolated line or bar chart) for just that product.

**Key points**:
- **Click-to-Context**: Seamless bridge between visual interaction and chat.
- **Contextual Awareness**: The AI "sees" what you selected.

---

### 3. **Pivot to Bubble Chart** (1.5 minutes)

**Query**:
```
Compare revenue vs volume vs profitability for all product groups as a bubble chart
```
*(Note: If volume/profitability aren't in your dataset, use: `Create a bubble chart with FY26-Q1 on x-axis, FY27-Q1 on y-axis, and FY27-Q4 as bubble size`)*

**What to say**:
> "Let's look at three dimensions at once. Bubble charts are great for this. We'll map early performance to X and Y, and recent performance to the bubble size."

**What you'll see**:
- **Bubble Chart** renders.
- **New Icon**: The Assistant message now shows a **Bubble Chart icon**.
- **Tooltip**: Hover over bubbles to see the multi-dimensional data.

**Key points**:
- **Complex Visuals**: Hila handles multi-dimensional mappings easily.
- **Automatic scaling**: Bubble sizes are normalized for readability.

---

### 4. **Proportional View - Treemap** (1 minute)

**Query**:
```
Show me a treemap of FY27-Q4 revenue by product group
```

**What to say**:
> "Now for market share. A treemap lets us see the relative size of every category in one dense view."

**What you'll see**:
- **Treemap** fills the screen.
- Large rectangles for top earners (e.g., Nuts & Spreads).
- **Treemap Icon** in the chat.

**Key points**:
- **High Density**: Visualize 18+ categories at once without clutter.
- **Layout Algorithms**: Automatic tiling and coloring.

---

### 5. **Statistical Distribution - Box Plot** (1 minute)

**Query**:
```
Show me the distribution of revenue by quarter as a box plot
```

**What to say**:
> "Let's get statistical. I want to see how revenue is distributed across all products for each quarter. A box plot is perfect for identifying the median and outliers."

**What you'll see**:
- **Box Plot** renders with 8 whiskers (one per quarter).
- **Statistical Calculation**: The frontend automatically computes Min, Q1, Median, Q3, and Max from the raw data.
- **Boxplot Icon** in the chat.

**Key points**:
- **On-the-fly Analytics**: The app computes statistical aggregates that aren't in the raw text.
- **Advanced Charting**: Support for specialized financial visualization types.

---

### 6. **History Rollback (Time Travel)** (45 seconds)

**Action**: 
- Scroll up in the chat to the **very first message** (the one with the Line Chart icon).
- **Click** on the **Assistant's message bubble** (not the text, the bubble itself).

**What to say**:
> "We've explored a lot. But what if I want to go back to the beginning? Hila keeps a visual history. I can simply scroll up and click on any previous AI response to instantly restore that chart state."

**What you'll see**:
- The main chart **instantly reverts** to the initial Line Chart.
- The clicked message bubble highlights with a **blue border** and **blue icon** to show it's active.
- The Drill-down chip clears (if any).

**Key points**:
- **Visual State Management**: The chat *is* the history.
- **Instant Restore**: No reloading, just state restoration.
- **Active State Indicators**: Clear visual cues (blue border) show which message is currently displayed.

---

### 7. **Advanced Filtering (Optional)** (1 minute)

**Query**:
```
Show me a line chart of only quarters where Household Products revenue exceeded 5 million
```

**What to say**:
> "Finally, Hila understands logic. I can filter data using natural language conditions."

**Key points**:
- Natural language logic parsing.
- Dynamic data filtering.

---

## Demo Tips & Best Practices

### Before You Start:
1. ✅ Ensure `./start.sh` is running.
2. ✅ Open http://localhost:3000 in a fresh window.
3. ✅ Check that the **data point clicking** works (try clicking a line point).

### During the Demo:
- **Use the Features**: Don't just talk about them. actually **Click the chart** and **Click the history**.
- **Point out the Icons**: "Notice the little chart icon telling me what I'm looking at."
- **Hover**: Always hover to show interactivity.

### Troubleshooting
- **Boxplot/Bubble**: If they look empty, refresh and try the specific query exactly as written.
- **Clicking**: If clicking a bubble doesn't work, try clicking a Line chart point (sometimes easier to hit).

---

## Dataset Quick Reference
**Product Groups**: Baby Care, Bakery, Beverages, etc.
**Quarters**: FY26-Q1 to FY27-Q4.

---

## Closing Statement
> "We've seen how Hila combines **Generative AI** with **Direct Manipulation**. We used natural language to create charts, clicked on data to drill down, and clicked on chat history to time-travel. It's a fluid, multi-modal interface for data exploration."

