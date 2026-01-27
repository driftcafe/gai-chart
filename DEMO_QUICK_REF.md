# 🎯 Hila Demo - Quick Reference Card

## ⚡ **30-Second Wow Queries**

Perfect for grabbing attention immediately:

```
1. "Show me revenue vs costs"
2. "Add margin to see profitability"
3. "Which quarter had the best margins?"
```

**Why these work:** Natural language, builds conversationally, shows intelligence.

---

## 🔄 **Conversational Refinement Sequence**

Shows the killer feature - iterative building:

```
1. "Show me revenue trends"
2. "Add costs to compare"
3. "Make it a bar chart"
4. "Add margin"
```

**Why this works:** Each query builds on the last, no starting over.

---

## 🎨 **Chart Type Showcase**

Demonstrate variety:

```
1. "Show revenue vs costs as a line chart"
2. "Change this to a bar chart"
3. "Make it an area chart"
4. "Show this as a scatter plot"
```

**Why this works:** Same data, different visualizations, instant switching.

---

## 📊 **Business Intelligence Queries**

Show analytical power:

```
1. "What's our profit margin trend?"
2. "Show me regional performance"
3. "Which region has the best margins?"
4. "Compare 2023 vs 2024 revenue"
```

**Why this works:** Replaces BI tools, answers real business questions.

---

## 🧪 **Edge Cases That Impress**

Show robustness:

```
1. "Show me the money" → Revenue chart
2. "How are we doing?" → Performance overview
3. "Is it getting better?" → Trend analysis
4. "gimme q3 numbers" → Works despite typos/slang
```

**Why this works:** Handles messy real-world input.

---

## 💰 **The ROI Demo**

Run these 5 queries in rapid succession:

```
1. "Show revenue trends"
2. "Add costs"
3. "Make it a bar chart"
4. "Show margins"
5. "Compare regions"
```

Then point to terminal:
```
Total Cost: $0.0015 (less than a penny!)
Your $5 = 3,300+ charts
```

**Why this works:** Concrete, shocking economics.

---

## 🎬 **The Complete 5-Minute Demo**

**Minute 1:** Natural Language
- "Show me revenue vs costs"
- "Add margin to see profitability"

**Minute 2:** Iterative Refinement
- "Show me revenue trends"
- "Add costs"
- "Make it a bar chart"

**Minute 3:** Business Intelligence
- "What's our profit margin trend?"
- "Which region has the best margins?"

**Minute 4:** Data Safety
- Show DevTools → No raw data sent to AI
- Explain schema-only architecture

**Minute 5:** Economics & Vision
- Show cost: < 1 penny for 5 charts
- Discuss future: More data sources, more intelligence

---

## 🎯 **Audience-Specific Openers**

**For Executives:**
```
"Show me revenue vs costs"
→ Then: "Which quarter had the best margins?"
→ Focus: Business value, time savings
```

**For Technical Teams:**
```
"Show me revenue vs costs"
→ Then: Open DevTools, show data safety
→ Focus: Architecture, security, extensibility
```

**For Data Analysts:**
```
"What's our profit margin trend?"
→ Then: "Compare 2023 vs 2024"
→ Focus: Complex queries, transformations
```

---

## 💡 **Pro Tips**

1. **Start Simple:** "How did we perform?" not "Create a multi-series..."
2. **Let It Breathe:** Pause after each response
3. **Show Costs:** Keep backend terminal visible
4. **Handle Failures:** "Let me rephrase..." shows it's conversational
1.  **Start Simple:** "How did we perform?" not "Create a multi-series..."
2.  **Let It Breathe:** Pause after each response
3.  **Show Costs:** Keep backend terminal visible
4.  **Handle Failures:** "Let me rephrase..." shows it's conversational
5.  **End Interactive:** "What would YOU want to see?"

---

## 🚨 **Avoid These Queries** (For Now)

These don't work well with Claude Haiku:

- ❌ **Quarter filtering**: "Show me just Q3", "Compare Q3 to Q4", "Focus on Q3 and Q4"
- ❌ **Data transformations**: "Show as percentages", "Calculate growth rate"
- ❌ **Complex calculations**: "Add a trendline", "Show moving average"
- ❌ **Time ranges we don't have**: "Show me last 12 months" (only have quarterly data)

**Instead:** Show all data and let the visualization do the comparison!

Stick to the proven queries above for maximum success rate!

---

## 📱 **Quick Demo Checklist**

Before you start:
- [ ] Backend running (`./start.sh`)
- [ ] Browser at http://localhost:3000
- [ ] Backend terminal visible (for cost tracking)
- [ ] This reference card open
- [ ] Know your audience (exec/tech/analyst)

During demo:
- [ ] Start with natural language query
- [ ] Show iterative refinement
- [ ] Point out costs in terminal
- [ ] Explain data safety if technical audience
- [ ] End with "What would you visualize?"

After demo:
- [ ] Check `curl http://localhost:8000/api/usage` for stats
- [ ] Share cost numbers
- [ ] Discuss next steps

---

**You're ready to wow them! 🎉**
