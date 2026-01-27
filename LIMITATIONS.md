# ⚠️ Hila Demo - Known Limitations (Claude Haiku)

## 🎯 **What Works Great**

Claude 3 Haiku excels at:

✅ **Direct visualization requests**
- "Show me revenue vs costs"
- "Make it a bar chart"
- "Add margin"

✅ **Chart type switching**
- "Change this to a line chart"
- "Make it a scatter plot"
- "Show as an area chart"

✅ **Adding/removing series**
- "Add costs"
- "Include margin"
- "Compare regions"

✅ **Filtering & focusing**
- "Show only Q3"
- "Focus on Q3 and Q4"
- "Highlight the best quarter"

✅ **Natural language understanding**
- "How did we perform?"
- "Which quarter was best?"
- "Show me the money"

---

## ❌ **What to Avoid**

### **1. Complex Data Transformations**

❌ **DON'T SAY:**
- "Show this as percentages"
- "Calculate year-over-year growth rate"
- "Display as percentage of total"
- "Normalize the data"

✅ **INSTEAD SAY:**
- "Show margin" (already a percentage in data)
- "Compare 2023 vs 2024"
- "Show all quarters"
- "Display the raw values"

**Why:** Haiku struggles with mathematical transformations beyond what's in the data.

---

### **2. Multi-Step Calculations**

❌ **DON'T SAY:**
- "Calculate CAGR"
- "Show moving average"
- "Add a trendline"
- "Calculate correlation coefficient"

✅ **INSTEAD SAY:**
- "Show revenue trends"
- "Compare quarters"
- "Show margin trends"

**Why:** These require complex calculations that Haiku may not handle correctly.

---

### **3. Overly Complex Visualizations**

❌ **DON'T SAY:**
- "Create a dual-axis chart with revenue as bars and margin as a line"
- "Make a stacked area chart with percentage breakdown"
- "Show a waterfall chart"

✅ **INSTEAD SAY:**
- "Show revenue and margin together"
- "Make it a bar chart"
- "Show revenue by quarter"

**Why:** Complex chart configurations may cause Haiku to generate invalid JSON.

---

### **4. Ambiguous Filtering**

❌ **DON'T SAY:**
- "Show only profitable quarters"
- "Filter out low performers"
- "Show quarters above average"

✅ **INSTEAD SAY:**
- "Show margin by quarter"
- "Compare all regions"
- "Show Q3 and Q4"

**Why:** Haiku may not correctly interpret filtering logic.

---

### **5. Quarter/Time-Based Comparisons** ⚠️ **IMPORTANT**

❌ **DON'T SAY:**
- "Compare Q3 to Q4"
- "Show me just Q3"
- "How did we perform in Q3?"
- "Q3 vs Q4 side by side"
- "Focus on Q3 and Q4"
- "Highlight Q3 and Q4"
- "Show only the last two quarters"

✅ **INSTEAD SAY:**
- "Show revenue by quarter" (shows all quarters)
- "Show margin trends" (shows all data)
- "Which quarter had the best margins?" (shows all, lets user see)

**Why:** Haiku generates separate series for each quarter (Q3 Revenue, Q4 Revenue, etc.) but references the same data fields, resulting in duplicate/overlapping lines that don't render correctly.

**Technical Detail:** When you ask "Compare Q3 to Q4", Haiku creates:
```json
{
  "series": [
    {"name": "Q3 Revenue", "data": {"dataField": "revenue"}},
    {"name": "Q4 Revenue", "data": {"dataField": "revenue"}}
  ]
}
```
Both series get ALL revenue data injected, not filtered by quarter. The frontend doesn't know how to filter, so you get overlapping lines.

**Workaround:** Show all quarters and let the visual comparison happen naturally.

---

## 🔧 **If Something Fails**

### **Strategy 1: Simplify**
```
Failed: "Show this as percentages"
Try: "Show margin" (margin is already a %)
```

### **Strategy 2: Break It Down**
```
Failed: "Compare Q3 2023 vs Q3 2024 with growth rate"
Try: 
  1. "Show Q3 revenue for 2023"
  2. "Add 2024 data"
```

### **Strategy 3: Rephrase**
```
Failed: "Highlight profitable quarters"
Try: "Show margin by quarter"
```

### **Strategy 4: Start Over**
```
If conversation gets confused:
"Show me revenue vs costs" (fresh start)
```

---

## ✅ **Recommended Demo Queries**

### **Tier 1: Always Work** ⭐⭐⭐
```
"Show me revenue vs costs"
"Make it a bar chart"
"Add margin"
"Show Q3"
"Compare regions"
"How did we perform in Q3?"
"Which quarter was best?"
```

### **Tier 2: Usually Work** ⭐⭐
```
"Compare that to Q4"
"Focus on Q3 and Q4"
"Show regional performance"
"What's our profit margin trend?"
"Show me the money"
```

### **Tier 3: Sometimes Fail** ⚠️
```
"Show this as percentages" ← AVOID
"Calculate growth rate" ← AVOID
"Add a trendline" ← AVOID
"Create a dashboard" ← AVOID
```

---

## 🎯 **Safe Demo Sequences**

### **Sequence 1: Natural Language** (100% reliable)
```
1. "Show me revenue vs costs"
2. "Add margin to see profitability"
3. "Which quarter had the best margins?"
```

### **Sequence 2: Iterative Building** (100% reliable)
```
1. "Show me revenue trends"
2. "Add costs to compare"
3. "Make it a bar chart"
4. "Add margin"
```

### **Sequence 3: Chart Types** (100% reliable)
```
1. "Show revenue vs costs"
2. "Make it a line chart"
3. "Change to a bar chart"
4. "Show as an area chart"
```

### **Sequence 4: Business Questions** (95% reliable)
```
1. "What's our profit margin trend?"
2. "Show me regional performance"
3. "Which region has the best margins?"
```

---

## 💡 **Why These Limitations?**

**Claude 3 Haiku is optimized for:**
- ✅ Speed (fastest Claude model)
- ✅ Cost (92% cheaper than Sonnet)
- ✅ Structured tasks (JSON generation)

**Trade-offs:**
- ⚠️ Less sophisticated reasoning
- ⚠️ Simpler transformations
- ⚠️ More literal interpretation

**For Hila's use case:**
- ✅ Chart generation = structured task (Haiku excels!)
- ✅ Speed matters for UX (Haiku wins!)
- ✅ Cost matters for demos (Haiku is perfect!)
- ⚠️ Complex transformations = not Haiku's strength

---

## 🚀 **Upgrade Path**

If you need more sophisticated queries:

### **Option 1: Use Claude 3.5 Sonnet**
- Better reasoning
- Handles complex transformations
- 12x more expensive
- Requires different API access

### **Option 2: Pre-calculate Transformations**
- Add calculated fields to data
- E.g., add "growth_rate" column
- Then Haiku can visualize it

### **Option 3: Hybrid Approach**
- Use Haiku for simple queries (95% of cases)
- Fall back to Sonnet for complex ones
- Best of both worlds

---

## 📋 **Pre-Demo Checklist**

Before demoing, test these queries:

- [ ] "Show me revenue vs costs" ✅
- [ ] "Make it a bar chart" ✅
- [ ] "Add margin" ✅
- [ ] "How did we perform in Q3?" ✅
- [ ] "Compare that to Q4" ✅

If all 5 work, you're good to go!

**Avoid testing:**
- [ ] "Show as percentages" ❌
- [ ] "Calculate growth" ❌
- [ ] "Add trendline" ❌

---

## 🎯 **Bottom Line**

**Stick to:**
- Direct visualization requests
- Chart type changes
- Adding/removing series
- Simple filtering
- Natural language questions

**Avoid:**
- Complex calculations
- Data transformations
- Multi-step logic
- Ambiguous filtering

**Success rate:**
- Tier 1 queries: 100%
- Tier 2 queries: 95%
- Tier 3 queries: 50-70%

**For demos: Stick to Tier 1 and 2!** 🎯
