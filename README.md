# HungrAI

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white) ![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

HungrAI is an AI-powered recipe discovery platform that transforms ingredient photos into personalized recipe recommendations. Using advanced computer vision powered by Google Gemini on Vertex AI, HungrAI identifies ingredients from uploaded images and suggests creative, practical recipes that match what you already have in your kitchen.
![banner](https://github.com/binaryshrey/Portfolio/blob/main/app/assets/hungrai.webp)

## Introducing HungrAI

HungrAI solves a common problem: you have ingredients at home, but you're not sure what to cook. Instead of manually typing ingredient lists or searching through countless recipe websites, simply snap a photo of your ingredients and let AI do the work.

The platform analyzes your images in real-time, identifies multiple ingredients simultaneously and generates tailored recipe suggestions complete with:

- **Ingredient matching** - Shows which detected ingredients each recipe uses
- **Missing ingredients** - Highlights what else you might need
- **Match scores** - Ranks recipes by how well they utilize your available ingredients
- **Step-by-step instructions** - Clear cooking guidance for each recipe
- **Prediction history** - Track your past ingredient scans and recipe discoveries

Unlike traditional recipe apps that require manual input, HungrAI streamlines the cooking discovery process through visual ingredient recognition, making meal planning effortless and inspiring.

## Built With

### Frontend

- **Next.js** - React framework for web application
- **Tailwind CSS** - Utility-first CSS framework for styling
- **TypeScript** - Type-safe development
- **WorkOS AuthKit** - Authentication and identity management
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & AI

- **FastAPI** - High-performance Python web framework
- **Google Vertex AI Gemini 2.5 Flash** - Advanced multimodal AI for image understanding and recipe generation
- **Pillow (PIL)** - Image processing and validation
- **Python Multipart** - File upload handling

### Data & Storage

- **Supabase** - PostgreSQL database for user data and prediction history
- **Supabase Auth** - User authentication and session management
- **Database Tables**:
  - User predictions and scan history
  - Ingredient detection records
  - Recipe suggestions and metadata

### Infrastructure & Deployment

- **Google Cloud Run** - Serverless container deployment for backend
- **Vercel** - Frontend deployment and hosting
- **Docker** - Backend containerization

### Security & Authentication

- **WorkOS** - Enterprise-grade authentication
- **Environment-based secrets** - Secure credential management

## Architecture Overview

**Flow:**

1. User uploads ingredient photos through Next.js frontend
2. Images are sent to FastAPI backend via multipart/form-data
3. Backend processes images and calls Vertex AI Gemini API
4. Gemini analyzes images and returns ingredient predictions + recipe suggestions
5. Results are stored in Supabase for prediction history
6. Frontend displays recipes with match scores and instructions

## Key Features

### Visual Ingredient Recognition

- **Multi-image upload** - Scan multiple ingredients simultaneously
- **Real-time processing** - Fast image analysis powered by Gemini 2.5 Flash
- **High accuracy** - Confidence scores for each detected ingredient
- **Validation** - Image format verification and error handling

### AI-Powered Recipe Generation

Gemini drives intelligent recipe suggestions:

- **Context-aware matching** - Recipes that maximize use of detected ingredients
- **Match scoring** - Ranked by ingredient utilization (0.0 to 1.0)
- **Missing ingredient detection** - Shows what else you might need
- **Detailed instructions** - Step-by-step cooking guidance
- **Multiple suggestions** - At least 5 recipe options per scan

### Prediction History & Dashboard

- **User-scoped data** - Personal prediction history per authenticated user
- **Recent scans** - View your latest ingredient detections
- **Recipe library** - Access previously generated recipes
- **Metadata tracking** - Timestamps and confidence levels

### Multi-Project Support

- **Profile management** - Personalized user profiles via WorkOS
- **Settings** - Customizable preferences
- **Shopping list** - Plan your grocery shopping
- **Support** - Help and documentation access

### Secure Authentication

- **WorkOS AuthKit** - Enterprise-grade authentication
- **Protected routes** - Dashboard and features require login
- **Session management** - Secure cookie-based sessions
- **User scoping** - All data isolated per user account

### Cloud-Native Architecture

- **Serverless backend** - FastAPI deployed on Cloud Run with auto-scaling
- **PostgreSQL database** - Managed by Supabase for reliability
- **Environment isolation** - Separate dev/prod configurations
- **Health monitoring** - `/health` endpoint for uptime checks

## Core User Flow

### 1. Sign Up & Authentication

Users sign in through WorkOS AuthKit, which provides secure authentication and session management. Upon successful login, users are redirected to the dashboard.

### 2. Upload Ingredients

From the dashboard, users navigate to the "Upload Ingredients" page where they can:

- Select multiple ingredient photos from their device
- Preview selected images before upload
- Submit for AI analysis

### 3. AI Processing

The backend:

- Validates uploaded images (format and size)
- Converts images to base64 for Vertex AI processing
- Sends images to Gemini 2.5 Flash with structured prompts
- Receives ingredient predictions and recipe suggestions

### 4. Recipe Display

Results are formatted and displayed with:

- **Detected ingredients** with confidence scores
- **Recipe cards** showing:
  - Recipe title and match score
  - Matched ingredients (what you have)
  - Missing ingredients (what you need)
  - Cooking instructions
- **Candidate count** - Total number of suggestions generated

### 5. History Tracking

All predictions are stored in Supabase with:

- User email association
- Timestamp of prediction
- Full ingredient and recipe data
- Metadata for filtering and sorting

### 6. Dashboard View

Users can view their prediction history on the dashboard:

- Recent scans displayed in chronological order
- Quick access to past recipe suggestions
- Filter by date or ingredients

## API Overview

### `GET /health`

**Use when:** Checking service availability  
**Returns:** `{"status": "alive"}`

### `POST /predict`

**Use when:** Uploading ingredient images for analysis  
**Request:** Multipart form-data with image files  
**Returns:** JSON with predictions, ingredients, and recipes

```json
{
  "predictions": [
    {
      "filename": "image1.jpg",
      "label": "tomato",
      "confidence": 0.95
    }
  ],
  "ingredients": ["tomato", "onion", "garlic"],
  "recipes": [
    {
      "id": 1,
      "title": "Tomato Pasta",
      "score": 0.85,
      "matched": ["tomato", "onion", "garlic"],
      "missing": ["pasta", "olive oil"],
      "instructions": ["Boil pasta...", "Sauté onions...", "Add tomatoes..."]
    }
  ],
  "candidate_count": 5
}
```

### `GET /predictions`

**Use when:** Fetching user prediction history  
**Query params:** `user_email`, `limit`  
**Returns:** Array of prediction records with timestamps

## Development Setup

```bash
# Clone repository
git clone https://github.com/binaryshrey/HungrAI.git
cd HungrAI

# Frontend setup
cd hungrai
npm install
npm run dev

# Backend setup (in separate terminal)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

## Project Structure

```
HungrAI/
├── backend/                  # FastAPI backend
│   ├── main.py               # API endpoints and Vertex AI integration
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container configuration
├── hungrai/                  # Next.js frontend
│   ├── app/                  # Next.js App Router
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── upload_ingredients/ # Image upload interface
│   │   ├── actions/          # Server actions
│   │   └── callback/         # Auth callbacks
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── home/             # Landing page components
│   │   └── ui/               # Reusable UI components
│   └── utils/                # Utilities and constants
└── DATABASE_INTEGRATION.md   # Database documentation
```

## License

Apache License 2.0

---
