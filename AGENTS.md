# MenuGen - Agent Development Guide

This file contains essential information for agentic coding agents working on the MenuGen repository.

## Project Overview

MenuGen is an AI-powered menu recognition system that analyzes menu images using Google Gemini 1.5 Pro and performs concurrent Google Custom Search API calls to find dish images. The application features a responsive React + Tailwind CSS frontend and FastAPI Python backend.

**Technology Stack:**
- Backend: FastAPI, Python 3.9+, Pydantic, OpenAI SDK (for Gemini)
- Frontend: React 19+, Vite, Tailwind CSS, Axios
- External APIs: Google Gemini Vision, Google Custom Search

## Development Commands

### Backend (Python FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start development server (auto-reloads on changes)
uvicorn main:app --reload

# Alternative: start with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run tests (pytest framework)
pytest tests/ -v

# Run specific test file
pytest tests/test_llm_service.py -v

# Run specific test function
pytest tests/test_llm_service.py::test_analyze_menu_image -v

# Run tests with coverage
pytest tests/ --cov=services --cov=utils -v
```

### Frontend (React + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (hot-reload enabled)
npm run dev

# Build for production
npm run build

# Run linter (ESLint)
npm run lint

# Preview production build
npm run preview

# Run tests (when test framework is added)
npm run test
```

### Full Stack Development
```bash
# Terminal 1: Backend (port 8000)
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend (port 5173)
cd frontend && npm run dev

# Access application at: http://localhost:5173
```

## Code Style Guidelines

### Python Backend

#### Import Organization
```python
# Standard library imports first
import base64
import json
import logging
import asyncio
from typing import List, Optional, Dict

# Third-party imports
import aiohttp
from fastapi import FastAPI, File, UploadFile, HTTPException
from openai import OpenAI, APIError, APITimeoutError
from pydantic import BaseModel, Field

# Local imports
from config import settings
from schemas import Dish, MenuResponse
from services.llm_service import gemini_analyzer
from utils.file_utils import encode_image_to_base64
```

#### Type Hints and Pydantic Models
- Always use type hints for function parameters and return values
- Use `List`, `Optional`, `Dict` from `typing` module
- Create Pydantic models for all data validation and API schemas
- Use `Field()` for validation rules and descriptions

#### Naming Conventions
- **Classes**: `PascalCase` (e.g., `GeminiAnalyzer`, `GoogleSearcher`, `Settings`)
- **Functions/Variables**: `snake_case` (e.g., `analyze_menu_image`, `base64_image`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE_MB`, `DEFAULT_TIMEOUT`)
- **Private Methods**: prefix with underscore (e.g., `_validate_image`, `_get_system_prompt`)
- **Module Instances**: lowercase with underscores (e.g., `gemini_analyzer`, `google_searcher`)

#### Async/Await Patterns
- Use `async`/`await` for all I/O operations (API calls, file operations)
- Use `asyncio.gather()` for concurrent operations
- Use `asyncio.Semaphore` for limiting concurrent requests
- Always handle async context managers properly

#### Error Handling
```python
import logging
logger = logging.getLogger(__name__)

try:
    result = await api_call()
    return result
except ValueError as e:
    logger.error(f"Validation error: {str(e)}")
    raise HTTPException(status_code=400, detail=str(e))
except APIError as e:
    logger.error(f"API error: {str(e)}")
    raise HTTPException(status_code=500, detail="External API error")
except Exception as e:
    logger.error(f"Unexpected error: {str(e)}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

#### Documentation
- Use docstrings for all classes and functions
- Include Args, Returns, and Raises sections
- Use Chinese comments for user-facing text, English for code logic

### JavaScript/React Frontend

#### Import Organization
```javascript
// React and hooks imports first
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Third-party imports
import axios from 'axios';

// Local imports (relative paths)
import MenuUpload from './components/MenuUpload';
import MenuGrid from './components/MenuGrid';
import { analyzeMenu } from './api/client';
import './index.css';
```

#### Component Structure
```javascript
// Use function components with hooks
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  const ref = useRef(null);

  const handler = useCallback(() => {
    // Handle logic
  }, [dependencies]);

  useEffect(() => {
    // Side effects and cleanup
    return () => {
      // Cleanup if needed
    };
  }, [dependencies]);

  return (
    <div className="tailwind-utility-classes">
      {/* JSX content */}
    </div>
  );
}
```

#### Naming Conventions
- **Components**: `PascalCase` (e.g., `MenuUpload`, `LoadingState`, `ErrorBoundary`)
- **Functions/Variables**: `camelCase` (e.g., `handleUpload`, `fileName`, `dragActive`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_FILE_SIZE`)
- **Files**: `PascalCase.jsx` for components, `camelCase.js` for utilities

#### State Management
- Use `useState` for local component state
- Use `useRef` for DOM references and non-reactive values
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Use `useEffect` for side effects and API calls with proper cleanup

#### Error Handling
```javascript
try {
  const response = await apiCall();
  setData(response.data);
} catch (error) {
  const errorMessage = error.response?.data?.error || error.message;
  setError(errorMessage);
  console.error('API Error:', error);
} finally {
  setLoading(false);
}
```

#### Styling (Tailwind CSS)
- Use Tailwind utility classes for all styling
- Prefer responsive design prefixes (`sm:`, `md:`, `lg:`)
- Use consistent color scheme: indigo for primary, gray for secondary
- Add hover and transition states for interactive elements
- Use spacing utilities for consistent layout

## Project Structure Patterns

### Backend Organization
```
backend/
├── main.py              # FastAPI app entry point, API endpoints
├── config.py            # Settings and environment variables
├── schemas.py           # Pydantic data models
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── services/            # Business logic layer
│   ├── llm_service.py   # Gemini API integration
│   └── search_service.py # Google Search API integration
├── utils/               # Utility functions
│   └── file_utils.py    # File processing helpers
└── tests/               # Unit tests
```

### Frontend Organization
```
frontend/src/
├── App.jsx              # Main application component
├── main.jsx             # React entry point
├── components/          # Reusable UI components
│   ├── MenuUpload.jsx   # File upload interface
│   ├── MenuCard.jsx     # Individual dish display
│   ├── MenuGrid.jsx     # Grid layout for dishes
│   ├── LoadingState.jsx # Loading indicators
│   └── ErrorBoundary.jsx # Error handling wrapper
├── api/                 # API client layer
│   └── client.js        # Axios HTTP client
└── styles/              # Global styles
    └── index.css        # Tailwind imports
```

## Environment Variables

### Backend (.env)
```env
# LLM Configuration (Gemini)
LLM_API_KEY=your_gemini_api_key
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL=gemini-1.5-pro
LLM_TIMEOUT=30
LLM_TEMPERATURE=0.2

# Google Custom Search
SEARCH_API_KEY=your_search_api_key
SEARCH_ENGINE_ID=your_search_engine_id
SEARCH_TIMEOUT=5
SEARCH_NUM_RESULTS=1
MAX_CONCURRENT_SEARCHES=10

# Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE_MB=10
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Testing Guidelines

### Backend Testing (pytest)
- Test file naming: `test_*.py`
- Use `pytest-asyncio` for async function testing
- Mock external API calls in tests
- Test both success and error scenarios
- Run single test: `pytest tests/test_file.py::test_function_name -v`

### Frontend Testing
- Currently no testing framework configured
- Plan to add React Testing Library for component testing
- Use Jest for unit testing when implemented

## API Development Patterns

### Endpoint Structure
- Use RESTful conventions
- Return `MenuResponse` schema for all API responses
- Include proper error codes and messages
- Use HTTP status codes appropriately

### Request/Response Patterns
```python
# Pydantic schemas for validation
class Dish(BaseModel):
    original_name: str = Field(..., description="菜品原名")
    english_name: str = Field(..., description="英文名称")
    # ... other fields

# Consistent error response format
{
    "success": false,
    "error": "Error message",
    "error_code": "ERROR_CODE"
}
```

## Common Development Tasks

### Adding New API Endpoints
1. Define Pydantic schema in `schemas.py`
2. Implement business logic in `services/`
3. Add endpoint in `main.py`
4. Update frontend API client if needed

### Adding New Components
1. Create component file in `frontend/src/components/`
2. Use Tailwind for styling
3. Handle loading and error states
4. Make responsive by default

### File Upload Handling
- Validate file types and sizes in both frontend and backend
- Use Base64 encoding for image transmission
- Implement proper error handling for invalid files

## Performance Considerations

### Backend
- Use async/await for all I/O operations
- Implement concurrent API calls with `asyncio.gather()`
- Set appropriate timeouts for external API calls
- Use semaphore to limit concurrent requests

### Frontend
- Implement lazy loading for images
- Use React.memo for expensive components
- Debounce user inputs when applicable
- Optimize bundle size with dynamic imports

## Security Best Practices

- Never commit API keys to repository
- Validate all file uploads (type, size)
- Sanitize user inputs
- Use HTTPS in production
- Implement rate limiting for APIs
- Use environment variables for sensitive configuration

## Debugging Tips

### Backend
- Check uvicorn logs for API errors
- Use `logger.info()` statements for debugging
- Test endpoints with curl or Postman
- Validate environment variables are loaded

### Frontend
- Use browser DevTools (Network, Console tabs)
- Check API responses in Network tab
- Use React DevTools for component state
- Test with different image formats and sizes

## Linting and Formatting

### Backend
- No specific formatter configured (consider adding black)
- Use type hints consistently
- Follow PEP 8 guidelines

### Frontend
- ESLint configured with React hooks and refresh plugins
- Run `npm run lint` to check for issues
- Use consistent code formatting throughout

This guide provides the essential information for agentic coding agents to work effectively with the MenuGen codebase.