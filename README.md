# Generative UI for Financial Data

A Proof of Concept (PoC) demonstrating how to transform natural language questions into dynamic, interactive charts using LLMs while maintaining **data safety** for sensitive financial information.

## 🎯 Core Value Proposition

**Transform reactive chart development into proactive, AI-driven visualization generation.**

Instead of spending cycles redesigning and integrating new chart types based on user feedback, uses Claude to generate visualization configurations on-the-fly based on user intent.

## 🔒 Data Safety Architecture

**Critical Rule: Never send raw financial data to the LLM.**

### The Flow:
1. **Backend extracts schema** (column names/types only) from the dataset
2. **LLM receives schema** and user query, generates chart configuration JSON
3. **Backend sends config + data separately** to frontend
4. **Frontend injects actual data** into the chart configuration
5. **ECharts renders** the interactive visualization

```
User Query → Schema Only → LLM → Chart Config → Frontend → Data Injection → Rendered Chart
                ↓                                    ↓
            (Safe to send)                    (Actual financial data)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js (for serving frontend)
- Anthropic API Key

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Start Backend Server

```bash
# From backend directory
python main.py
```

The API will be available at `http://localhost:8000`

### 3. Start Frontend

```bash
# From frontend directory (in a new terminal)
cd frontend

# Serve with Python's built-in server
python -m http.server 3000

# Or use any other static file server:
# npx serve -p 3000
```

The UI will be available at `http://localhost:3000`

### 4. Try It Out!

Open your browser to `http://localhost:3000` and ask questions like:

- "Show me Q3 Revenue vs Costs"
- "Compare margins across regions"
- "Create a line chart of revenue trends"
- "Add a trendline" (conversational refinement)

## 📁 Project Structure

```
gai-charts/
├── backend/
│   ├── main.py              # FastAPI server with API endpoints
│   ├── llm_service.py       # Claude integration with data-safe prompts
│   ├── data_service.py      # Mock financial data + schema extraction
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # Clean, minimal UI
│   ├── styles.css           # Apple-esque aesthetic
│   └── app.js               # Chart rendering + data injection logic
├── .env.example             # Environment variable template
└── README.md                # This file
```

## 🎨 Design Philosophy

**Minimal, Apple-esque Aesthetic**

- Clean typography and spacing
- Professional financial color palette
- Subtle animations and transitions
- No clutter or excessive grid lines
- Interactive features (zoom, tooltips, legend toggle)

### Color Palette
- Primary: `#2563eb` (blue)
- Secondary: `#10b981` (green)
- Accent: `#f59e0b` (amber)
- Negative: `#ef4444` (red)
- Neutral: `#64748b` (slate)

## 🔧 Technical Stack

- **Backend**: Python + FastAPI
- **Frontend**: HTML/JS (lightweight, no build steps)
- **AI Model**: Anthropic Claude 3.5 Sonnet
- **Charts**: Apache ECharts (interactive, professional)
- **Data**: Mock financial data (structured for easy SQL swap)

## 💡 Key Features

### 1. Data Safety First
- LLM never sees actual financial values
- Schema-only approach
- Data injection on frontend

### 2. Conversational Refinement
- Stateful conversation history
- Iterative chart modifications
- Context-aware updates

### 3. Interactive Visualizations
- Zoom and pan
- Tooltips on hover
- Legend toggle
- Responsive design

### 4. Extensible Architecture
- Easy to swap mock data for real SQL queries
- Modular service design
- Clear separation of concerns

## 📊 Available Datasets

### Quarterly Financials
- **Columns**: quarter, revenue, costs, margin, region
- **Rows**: 14 (Q1 2023 - Q3 2024, North America & Europe)

### Monthly Metrics
- **Columns**: month, active_users, churn_rate, arpu
- **Rows**: 9 (Jan 2024 - Sep 2024)

## 🔄 How to Swap in Real Data

The architecture is designed for easy migration to real SQL data:

1. **Update `data_service.py`**:
   ```python
   def get_dataset(self, dataset_name: str):
       # Replace mock data with SQL query
       query = "SELECT * FROM quarterly_financials"
       return execute_sql_query(query)
   ```

2. **Schema extraction remains the same** - it works with any data structure

3. **No changes needed** to LLM service or frontend

## 🛡️ Security Considerations

- **API Key**: Store in `.env`, never commit to version control
- **CORS**: Configure allowed origins in production
- **Rate Limiting**: Add rate limiting for production use
- **Data Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries when connecting to real databases

## 🚧 Future Enhancements

- [ ] Add more chart types (heatmaps, candlesticks, etc.)
- [ ] Implement chart export (PNG, SVG, PDF)
- [ ] Add data filtering and aggregation
- [ ] Support for multiple datasets in one chart
- [ ] User authentication and saved queries
- [ ] Real-time data updates
- [ ] Advanced statistical analysis (trendlines, forecasting)

## 📝 API Endpoints

### `GET /`
Health check endpoint

### `GET /api/datasets`
List all available datasets

### `GET /api/datasets/{dataset_name}`
Get schema and metadata for a specific dataset

### `POST /api/generate-chart`
Generate chart configuration from natural language query

**Request Body**:
```json
{
  "query": "Show me Q3 Revenue vs Costs",
  "dataset": "quarterly_financials",
  "conversation_history": []
}
```

**Response**:
```json
{
  "success": true,
  "config": { /* ECharts configuration */ },
  "data": [ /* Actual financial data */ ],
  "conversation_history": [ /* Chat messages */ ]
}
```

## 🤝 Contributing

This is a PoC. Feel free to extend and improve:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this in your projects!

## 🙏 Acknowledgments

- **Apache ECharts** for the excellent charting library
- **Anthropic** for Claude API
- **FastAPI** for the modern Python web framework

---

Built with ❤️ for financial data teams who want to move faster.
