# BuiltWith Analyzer - Modular Backend Structure

## Overview
The backend has been refactored into a modular structure for better maintainability, scalability, and code organization.

## Project Structure

```
backend/
├── main.py                 # Original monolithic file (backup)
├── main_new.py            # New modular main application file
├── config.py              # Configuration and environment setup
├── models.py              # Pydantic models and data structures
├── routes.py              # API route handlers
├── middleware.py          # Custom middleware (logging, etc.)
├── mock_data.py           # Mock data for testing
├── clients/               # External API clients
│   ├── __init__.py
│   ├── apify_client.py    # Apify API integration
│   ├── builtwith_client.py # BuiltWith API integration
│   └── openrouter_client.py # OpenRouter API integration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── backend.log           # Log file
```

## Key Modules

### 1. `main_new.py` - Application Entry Point
- FastAPI application setup
- Middleware registration
- CORS configuration
- Route inclusion

### 2. `config.py` - Configuration Management
- Environment variable loading
- Logging configuration
- Supabase client initialization
- Health status monitoring

### 3. `models.py` - Data Models
- Pydantic models for request/response validation
- Type definitions for API contracts
- Data structure consistency

### 4. `routes.py` - API Route Handlers
- Business logic for each endpoint
- Request/response processing
- Error handling
- Comprehensive logging

### 5. `clients/` - External API Clients
- **ApifyClient**: SimilarWeb data integration
- **BuiltWithClient**: Technology stack analysis
- **OpenRouterClient**: AI chat functionality
- Isolated API logic with fallback mechanisms

### 6. `middleware.py` - Custom Middleware
- Request/response logging
- Performance monitoring
- Error tracking

### 7. `mock_data.py` - Test Data
- Mock responses for development
- Fallback data when APIs are unavailable
- Consistent test scenarios

## Benefits of Modular Structure

### 1. **Separation of Concerns**
- Each module has a single responsibility
- Easy to locate and modify specific functionality
- Reduced coupling between components

### 2. **Improved Maintainability**
- Smaller, focused files
- Clear module boundaries
- Easier debugging and testing

### 3. **Better Scalability**
- Easy to add new API clients
- Simple to extend functionality
- Modular deployment options

### 4. **Enhanced Testing**
- Individual modules can be tested in isolation
- Mock dependencies easily
- Better test coverage

### 5. **Code Reusability**
- Clients can be reused across different routes
- Shared utilities and configurations
- Consistent error handling

## Logging Enhancements

### Backend Logging
- **Request/Response Logging**: Every API call is logged with timing
- **Error Tracking**: Detailed error information with stack traces
- **Performance Monitoring**: Request processing time measurement
- **Service Status**: Health checks for all external services

### Frontend Logging
- **API Call Logging**: All fetch requests logged with timing
- **Response Monitoring**: Status codes and response sizes tracked
- **Error Handling**: Detailed error logging with context
- **User Actions**: Key user interactions logged for debugging

## Usage

### Running the Modular Backend

1. **Option 1: Use the new modular structure**
   ```bash
   cd backend
   python main_new.py
   ```

2. **Option 2: Keep using the original file**
   ```bash
   cd backend
   python main.py
   ```

### Development Workflow

1. **Adding New API Clients**
   - Create new client in `clients/` directory
   - Import in `clients/__init__.py`
   - Use in route handlers

2. **Adding New Routes**
   - Add route handlers to `routes.py`
   - Import necessary models and clients
   - Include comprehensive logging

3. **Configuration Changes**
   - Update `config.py` for new environment variables
   - Modify health check in `config.py`
   - Update `.env.example` if needed

## Migration Guide

To switch from the monolithic to modular structure:

1. **Backup Current Setup**
   ```bash
   cp main.py main_backup.py
   ```

2. **Update Import Statements**
   ```bash
   # Replace main.py with main_new.py in startup scripts
   ```

3. **Test All Endpoints**
   ```bash
   # Verify all API endpoints work correctly
   # Check logs for any import errors
   ```

4. **Update Documentation**
   ```bash
   # Update any deployment scripts or documentation
   ```

## Environment Variables

All environment variables are managed through `config.py`:

```env
# OpenRouter API Key for LLM chat functionality
OPENROUTER_API_KEY=your_openrouter_key

# Supabase configuration for data storage
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Apify API Token for SimilarWeb data
APIFY_API_TOKEN=your_apify_token

# BuiltWith API Key for technology stack analysis
BUILTWITH_API_KEY=your_builtwith_key
```

## Logging Output Examples

### Backend Logs
```
2025-07-03 10:30:15,123 - __main__ - INFO - 📥 Incoming POST request to /api/analyze
2025-07-03 10:30:15,124 - __main__ - INFO -    Client: 127.0.0.1
2025-07-03 10:30:15,567 - __main__ - INFO - 🔍 Starting website analysis for 1 websites
2025-07-03 10:30:15,568 - __main__ - INFO -    Websites: ['linkedin.com']
2025-07-03 10:30:16,789 - __main__ - INFO - 📤 Response for POST /api/analyze
2025-07-03 10:30:16,790 - __main__ - INFO -    Status: 200
2025-07-03 10:30:16,790 - __main__ - INFO -    Processing time: 1.223s
```

### Frontend Logs
```javascript
🚀 Frontend: Sending SimilarWeb analysis request
   📤 Request URL: http://localhost:8000/api/analyze
   📦 Request Data: {websites: ['linkedin.com'], userId: 'user-1720012345'}
   ⏰ Request Time: 2025-07-03T10:30:15.123Z
📥 Frontend: Received SimilarWeb analysis response
   ✅ Response Status: 200
   ⏱️ Response Time: 1223.45ms
   📊 Response Headers: {content-type: 'application/json', x-process-time: '1.223'}
```

## Next Steps

1. **Database Integration**: Add proper database models and migrations
2. **Authentication**: Implement user authentication and authorization
3. **Caching**: Add Redis caching for frequently accessed data
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Add application performance monitoring
6. **Documentation**: Generate API documentation with OpenAPI/Swagger
7. **Testing**: Add comprehensive unit and integration tests
