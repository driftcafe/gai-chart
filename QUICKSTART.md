# 🚀 Hila Quick Start Guide

## One-Line Setup

```bash
# Get your Anthropic API key from: https://console.anthropic.com/
# Then add it to backend/.env
```

## Start Hila (Two Options)

### Option 1: Automated Start
```bash
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
../backend/venv/bin/python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python3 -m http.server 3000
```

## Access Points

- 🎨 **Frontend UI**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## First Steps

1. Open http://localhost:3000
2. Type: "Show me Q3 Revenue vs Costs"
3. Press "Generate"
4. Watch the magic happen! ✨

## Example Queries

**Basic:**
- "Show me revenue trends"
- "Compare costs by region"
- "Create a pie chart of revenue"

**Advanced:**
- "Show revenue vs costs with margin overlay"
- "Compare North America vs Europe performance"

**Refinement:**
- "Change this to a bar chart"
- "Add margin to the chart"
- "Make it an area chart"

## Project Structure

```
gai-charts/
├── backend/          # Python FastAPI server
│   ├── main.py       # API endpoints
│   ├── llm_service.py    # Claude integration
│   └── data_service.py   # Data + schema
├── frontend/         # HTML/JS UI
│   ├── index.html    # Main interface
│   ├── styles.css    # Styling
│   └── app.js        # Chart logic
└── start.sh          # Quick start script
```

## Key Files to Edit

**Add your API key:**
```bash
backend/.env
```

**Customize data:**
```bash
backend/data_service.py
```

**Adjust UI styling:**
```bash
frontend/styles.css
```

## Troubleshooting

**"API key not configured"**
→ Edit `backend/.env` and add your Anthropic API key

**"Connection refused"**
→ Make sure backend is running on port 8000

**"Module not found"**
→ Run: `backend/venv/bin/pip install -r backend/requirements.txt`

**Charts not rendering**
→ Check browser console for errors
→ Verify backend is returning data

## Data Safety Architecture

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Backend                 │
│ ┌─────────────────────┐ │
│ │ Extract Schema Only │ │ ← NO raw data!
│ └─────────┬───────────┘ │
│           ▼             │
│ ┌─────────────────────┐ │
│ │ Send to Claude LLM  │ │
│ └─────────┬───────────┘ │
│           ▼             │
│ ┌─────────────────────┐ │
│ │ Get Chart Config    │ │
│ └─────────────────────┘ │
└───────┬─────────────────┘
        │
        ├─── Config ────┐
        │               │
        └─── Data ──────┤
                        ▼
                ┌───────────────┐
                │ Frontend      │
                │ Inject Data   │
                │ Render Chart  │
                └───────────────┘
```

## Available Datasets

**quarterly_financials:**
- quarter, revenue, costs, margin, region
- 14 rows (Q1 2023 - Q3 2024)

**monthly_metrics:**
- month, active_users, churn_rate, arpu
- 9 rows (Jan - Sep 2024)

## Next Steps

1. ✅ Get it running
2. 📊 Try example queries
3. 🎨 Customize the styling
4. 💾 Swap in your real data
5. 🚀 Deploy to production

## Resources

- 📖 Full README: `README.md`
- 💡 Example Queries: `EXAMPLES.md`
- 🏗️ Architecture Diagram: See generated image
- 📚 API Documentation: http://localhost:8000/docs

---

**Need Help?** Check the full README.md for detailed documentation.
