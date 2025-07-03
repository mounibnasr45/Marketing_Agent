# BuiltWith Analyzer Backend

A FastAPI backend that provides website analysis using SimilarWeb, BuiltWith, and AI-powered chat functionality.

## Features

- 🔍 **SimilarWeb Integration**: Website traffic analysis, competitor data, and market insights
- 🔧 **BuiltWith Integration**: Technology stack detection and analysis
- 💬 **AI Chat System**: Intelligent analysis using OpenRouter/LLM APIs
- 📊 **Data Storage**: Supabase integration for persistent data storage
- 🚀 **RESTful API**: Clean, documented API endpoints

## Quick Start

### 1. Setup Environment

```bash
# Navigate to backend directory
cd backend

# Copy environment template
copy .env.example .env

# Edit .env with your API keys
notepad .env
```

### 2. Install Dependencies

#### Option A: Using the startup script (Windows)
```bash
start.bat
```

#### Option B: Manual setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Server**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **Interactive Docs**: http://localhost:8000/redoc

## API Endpoints

### 1. SimilarWeb Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "websites": ["github.com", "linkedin.com"],
  "userId": "user-123"
}
```

**Response**: Website traffic data, competitor analysis, market insights

### 2. BuiltWith Tech Stack Analysis
```http
POST /api/analyze-tech-stack
Content-Type: application/json

{
  "websites": ["github.com", "linkedin.com"],
  "userId": "user-123"
}
```

**Response**: Technology stack information, frameworks, tools used

### 3. AI Chat Analysis
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What are the main traffic sources?",
  "analysis_data": { ... }
}
```

**Response**: AI-powered insights and follow-up suggestions

### 4. Health Check
```http
GET /health
```

**Response**: Service status and API availability

## Environment Variables

Create a `.env` file with the following variables:

```env
# Apify API Token for SimilarWeb data
APIFY_API_TOKEN=your_apify_token_here

# BuiltWith API Key for technology stack analysis
BUILTWITH_API_KEY=your_builtwith_api_key_here

# OpenRouter API Key for LLM chat functionality
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Supabase configuration for data storage
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

## API Keys Setup

### 1. Apify (SimilarWeb Data)
1. Sign up at [apify.com](https://apify.com)
2. Get your API token from the account settings
3. Add to `.env` as `APIFY_API_TOKEN`

### 2. BuiltWith (Technology Stack)
1. Sign up at [builtwith.com](https://builtwith.com/api)
2. Purchase an API subscription
3. Add your API key to `.env` as `BUILTWITH_API_KEY`

### 3. OpenRouter (AI Chat)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your API key from the dashboard
3. Add to `.env` as `OPENROUTER_API_KEY`

### 4. Supabase (Database)
1. Create a project at [supabase.com](https://supabase.com)
2. Get your URL and anon key from project settings
3. Add to `.env` as `SUPABASE_URL` and `SUPABASE_KEY`

## Testing

Run the integration test suite:

```bash
# Make sure the server is running first
uvicorn main:app --reload

# In another terminal, run tests
python test_integration.py
```

## Mock Data

The backend includes comprehensive mock data for testing without API keys:

- **SimilarWeb Mock Data**: LinkedIn and GitHub traffic analytics
- **BuiltWith Mock Data**: Technology stacks for popular websites
- **Chat Mock Data**: Sample AI responses and suggestions

## Architecture

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── start.bat           # Windows startup script
├── test_integration.py # Integration tests
└── README.md           # This file
```

## Data Models

### Website Analysis Response
```json
{
  "success": true,
  "data": [
    {
      "name": "GitHub",
      "globalRank": 64,
      "totalVisits": 1200000000,
      "avgVisitDuration": "12:30",
      "bounceRate": 0.28,
      "trafficSources": { ... },
      "topCountries": [ ... ],
      "topKeywords": [ ... ],
      "builtwith_result": {
        "domain": "github.com",
        "technologies": [
          {
            "name": "React",
            "tag": "JavaScript Frameworks",
            "version": "18.2.0",
            "popularity": 88
          }
        ]
      }
    }
  ],
  "count": 1,
  "note": "Analysis complete"
}
```

### Chat Response
```json
{
  "response": "Based on the analysis...",
  "suggestions": [
    "How can I improve traffic sources?",
    "What technologies should I adopt?",
    "How do I compare to competitors?"
  ]
}
```

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (Next.js frontend)

To add more origins, modify the `allow_origins` in `main.py`.

## Error Handling

The API includes comprehensive error handling:
- **Graceful Fallbacks**: Mock data when APIs are unavailable
- **Timeout Protection**: Request timeouts to prevent hanging
- **Detailed Logging**: Console output for debugging
- **HTTP Status Codes**: Proper status codes for different scenarios

## Development

### Adding New Endpoints

1. Define Pydantic models for request/response
2. Create the endpoint function with proper error handling
3. Add route to FastAPI app
4. Update tests in `test_integration.py`
5. Document in this README

### Adding New API Integrations

1. Create a client class (e.g., `NewAPIClient`)
2. Add environment variables for API keys
3. Implement async methods with error handling
4. Add mock data fallbacks
5. Update health check endpoint

## Production Deployment

For production deployment:

1. Set up a proper database (PostgreSQL recommended)
2. Configure environment variables securely
3. Use a production ASGI server (Gunicorn + Uvicorn)
4. Set up proper logging and monitoring
5. Configure HTTPS and security headers
6. Set up rate limiting and API key validation

## Support

For issues or questions:
1. Check the health endpoint: `/health`
2. Review the logs in the console
3. Verify environment variables are set correctly
4. Test with mock data first (no API keys needed)
