# BuiltWith Analyzer - Full Stack Website Intelligence Platform

A comprehensive web application that analyzes websites using SimilarWeb for traffic insights, BuiltWith for technology stack detection, and provides AI-powered analysis through an intelligent chat system.

## 🚀 Features

### Frontend (Next.js)
- **Modern React/Next.js Interface**: Beautiful, responsive UI with Tailwind CSS
- **Progressive Analysis Flow**: Step-by-step analysis from traffic to technology to AI insights
- **Real-time Data Visualization**: Charts, graphs, and interactive components
- **AI Chat Integration**: Natural language queries about analysis results

### Backend (FastAPI)
- **SimilarWeb Integration**: Traffic analytics, competitor analysis, market insights
- **BuiltWith Integration**: Technology stack detection and framework analysis
- **AI-Powered Chat**: OpenRouter/LLM integration for intelligent analysis
- **Supabase Storage**: Persistent data storage and user management
- **RESTful API**: Clean, documented endpoints with automatic OpenAPI docs

## 🏗️ Architecture

```
builtwith-analyzer/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   └── public/              # Static assets
│
├── backend/                 # FastAPI application
│   ├── main.py             # Main application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Backend documentation
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for backend)
- **npm/pnpm** (for frontend dependencies)
- **pip** (for backend dependencies)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd builtwith-analyzer

# Setup frontend
npm install
# or
pnpm install

# Setup backend
cd backend
```

### 2. Backend Setup

#### Option A: Quick Start (Windows)
```bash
# Navigate to backend directory
cd backend

# Run the startup script
start.bat
```

#### Option B: Quick Start (macOS/Linux)
```bash
# Navigate to backend directory
cd backend

# Make script executable and run
chmod +x start.sh
./start.sh
```

#### Option C: Manual Setup
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

# Copy environment template
cp .env.example .env

# Edit .env with your API keys (see API Setup below)
nano .env

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
# In the main project directory
npm run dev
# or
pnpm dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔑 API Keys Setup

Create a `.env` file in the `backend/` directory:

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

### Getting API Keys

1. **Apify (SimilarWeb Data)**
   - Sign up at [apify.com](https://apify.com)
   - Get API token from account settings
   - Provides website traffic analytics

2. **BuiltWith (Technology Stack)**
   - Sign up at [builtwith.com/api](https://builtwith.com/api)
   - Purchase API subscription
   - Provides technology stack detection

3. **OpenRouter (AI Chat)**
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Get API key from dashboard
   - Provides access to various LLM models

4. **Supabase (Database)**
   - Create project at [supabase.com](https://supabase.com)
   - Get URL and anon key from settings
   - Provides database and authentication

## 🧪 Testing Without API Keys

The application includes comprehensive mock data, so you can test it without any API keys:

1. Start the backend (it will use mock data automatically)
2. Start the frontend
3. Try analyzing domains like "linkedin.com" or "github.com"
4. All features will work with realistic mock data

## 📖 Usage

### 1. Website Analysis
1. Enter a domain name (e.g., "linkedin.com")
2. Click "Analyze" to start SimilarWeb analysis
3. Review traffic data, competitor insights, and market analysis

### 2. Technology Stack Analysis
1. Click "Analyze Tech Stack" button
2. Wait for BuiltWith analysis to complete
3. Explore technology comparisons and recommendations

### 3. AI-Powered Insights
1. Click "Start Chat" to access AI assistant
2. Ask questions about your analysis:
   - "What are the main traffic sources?"
   - "How does my tech stack compare to competitors?"
   - "What growth opportunities exist?"

## 🔌 API Endpoints

### SimilarWeb Analysis
```http
POST /api/analyze
{
  "websites": ["linkedin.com"],
  "userId": "user-123"
}
```

### BuiltWith Analysis
```http
POST /api/analyze-tech-stack
{
  "websites": ["linkedin.com"],
  "userId": "user-123"
}
```

### AI Chat
```http
POST /api/chat
{
  "message": "What are the main traffic sources?",
  "analysis_data": { ... }
}
```

## 🛠️ Development

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Backend Development
```bash
# Start with auto-reload
uvicorn main:app --reload

# Run tests
python test_integration.py

# Check API documentation
# Visit http://localhost:8000/docs
```

### Environment Variables
- Frontend automatically connects to `http://localhost:8000`
- Backend serves on `http://localhost:8000`
- Configure CORS origins in `backend/main.py` if needed

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the Next.js application
2. Update API endpoint in frontend code
3. Deploy to your preferred platform

### Backend (Railway/Heroku/DigitalOcean)
1. Set environment variables on your platform
2. Install Python dependencies
3. Start with: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker (Optional)
```dockerfile
# Backend Dockerfile example
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

1. **Backend won't start**
   - Check Python version (3.8+ required)
   - Verify virtual environment is activated
   - Install dependencies: `pip install -r requirements.txt`

2. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check CORS settings in `backend/main.py`
   - Verify API URLs in frontend components

3. **API errors**
   - Check `.env` file exists and has correct keys
   - Verify API keys are valid and have credits
   - Check network connectivity

4. **Mock data not showing**
   - This is normal without API keys
   - Check console for error messages
   - Restart backend server

### Getting Help

- Check the `/health` endpoint for service status
- Review console logs for error messages
- Test with mock data first (no API keys needed)
- Verify all environment variables are set correctly

## 🎯 Roadmap

- [ ] **Advanced Analytics**: More detailed traffic analysis
- [ ] **Export Features**: PDF reports and data export
- [ ] **User Accounts**: Save analyses and comparisons
- [ ] **Bulk Analysis**: Analyze multiple domains at once
- [ ] **Alerts**: Monitor changes in technology stacks
- [ ] **API Rate Limiting**: Implement proper rate limiting
- [ ] **Caching**: Redis caching for improved performance
- [ ] **Mobile App**: React Native mobile application

---

**Built with ❤️ using Next.js, FastAPI, and AI**
