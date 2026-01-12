from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import vertexai
from vertexai.generative_models import GenerativeModel, Part, SafetySetting
import base64
import io
from PIL import Image
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
from pydantic import BaseModel

# Load environment variables
load_dotenv()
print(f"🔧 Current working directory: {os.getcwd()}")
print(f"🔧 .env file exists: {os.path.exists('.env')}")

app = FastAPI(title="HungrAI Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"🔧 SUPABASE_URL: {SUPABASE_URL}")
print(f"🔧 SUPABASE_KEY: {'***' + SUPABASE_KEY[-10:] if SUPABASE_KEY else None}")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"✅ Supabase initialized: {SUPABASE_URL}")
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase: {str(e)}")
else:
    print("⚠️ Supabase credentials not found in environment variables")

# Initialize Vertex AI at module level (similar to DemoDay-AI pattern)
vertexai.init(project=GOOGLE_CLOUD_PROJECT, location=VERTEX_LOCATION)
print(f"✅ Vertex AI initialized: project={GOOGLE_CLOUD_PROJECT}, location={VERTEX_LOCATION}")

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "alive"
    }

def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

def validate_image(image_bytes: bytes) -> bool:
    """Validate if the uploaded file is a valid image"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False

async def identify_ingredients_and_suggest_recipes(image_parts: List[Part], filenames: List[str]) -> dict:
    """Use Gemini to identify ingredients and suggest recipes"""
    try:
        model = GenerativeModel("gemini-2.5-flash")
        
        # Safety settings
        safety_settings = [
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
        ]
        
        # Prompt for ingredient identification per image
        prompt = """Analyze the provided images and identify all food ingredients visible in each image.

For each image, provide:
- The ingredient name (single, primary ingredient visible)
- Confidence level (0.0 to 1.0)

Then, suggest recipes that can be made using ALL the detected ingredients together.

For each recipe, provide:
- Recipe ID (integer)
- Recipe title
- Match score (0.0 to 1.0 based on how well it uses the ingredients)
- Matched ingredients (list of ingredients from detected that are used)
- Missing ingredients (list of ingredients needed but not detected)
- Cooking instructions (list of steps)

Format your response as a structured JSON object with the following structure:
{
  "predictions": [
    {
      "filename": "image1.jpg",
      "label": "tomato",
      "confidence": 0.95
    }
  ],
  "ingredients": ["tomato", "onion"],
  "recipes": [
    {
      "id": 1,
      "title": "Recipe Name",
      "score": 0.85,
      "matched": ["tomato", "onion"],
      "missing": ["garlic", "olive oil"],
      "instructions": ["step 1", "step 2", "step 3"]
    }
  ],
  "candidate_count": 5
}

IMPORTANT:
- predictions array should have one entry per image with filename, label, and confidence
- ingredients array should be unique list of all detected ingredient labels
- recipes should be ranked by score (highest first)
- score represents what fraction of detected ingredients are used in the recipe
- Generate at least 5 recipe suggestions

Provide only the JSON object, no additional text."""

        # Combine prompt with image parts
        contents = [prompt] + image_parts
        
        # Generate response
        response = model.generate_content(
            contents,
            generation_config={
                "max_output_tokens": 8192,
                "temperature": 0.7,
                "top_p": 0.95,
            },
            safety_settings=safety_settings,
            stream=False,
        )
        
        # Parse response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Try to parse as JSON
        import json
        try:
            result = json.loads(response_text)
            
            # Ensure the result has the required structure
            if "predictions" not in result:
                result["predictions"] = []
            if "ingredients" not in result:
                result["ingredients"] = []
            if "recipes" not in result:
                result["recipes"] = []
            if "candidate_count" not in result:
                result["candidate_count"] = len(result.get("recipes", []))
            
            # Update filenames in predictions if they don't match
            for i, pred in enumerate(result["predictions"]):
                if i < len(filenames):
                    pred["filename"] = filenames[i]
            
            return result
        except json.JSONDecodeError:
            # If JSON parsing fails, return fallback structure
            return {
                "predictions": [
                    {"filename": fn, "label": "unknown", "confidence": 0.0}
                    for fn in filenames
                ],
                "ingredients": [],
                "recipes": [],
                "candidate_count": 0,
                "error": "Failed to parse AI response",
                "raw_response": response_text
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing with Gemini: {str(e)}")

@app.post("/predict", tags=["recipes"])
async def analyze_ingredients(files: List[UploadFile] = File(...)):
    """
    Analyze uploaded images to identify ingredients and suggest recipes.
    
    Compatible with Hungr-AI response format.
    
    Args:
        files: List of image files (JPEG, PNG, WebP)
        
    Returns:
        JSON object with predictions, ingredients, recipes, and candidate_count
    """
    if not files:
        raise HTTPException(status_code=400, detail="No images provided")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
    
    image_parts = []
    filenames = []
    
    # Process each uploaded image
    for file in files:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} is not a valid image"
            )
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Validate image
        if not validate_image(image_bytes):
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} is not a valid image format"
            )
        
        # Store filename
        filenames.append(file.filename or f"image_{len(filenames)}.jpg")
        
        # Create Part for Vertex AI
        mime_type = file.content_type
        image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
        image_parts.append(image_part)
    
    # Analyze ingredients and get recipe suggestions
    result = await identify_ingredients_and_suggest_recipes(image_parts, filenames)
    
    # Return in Hungr-AI format
    return result


# Pydantic model for prediction data
class PredictionData(BaseModel):
    user_id: str = None  # Optional user identifier
    user_email: str = None  # Optional user email
    predictions: List[dict]
    ingredients: List[str]
    recipes: List[dict]
    candidate_count: int
    metadata: dict = None  # Optional additional metadata


@app.post("/save-prediction", tags=["recipes"])
async def save_prediction(data: PredictionData):
    """
    Save prediction results to Supabase database.
    
    Args:
        data: PredictionData object containing prediction results
        
    Returns:
        JSON object with success status and saved record ID
    """
    if not supabase:
        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables."
        )
    
    try:
        # Prepare data for insertion
        record = {
            "user_id": data.user_id,
            "user_email": data.user_email,
            "predictions": data.predictions,
            "ingredients": data.ingredients,
            "recipes": data.recipes,
            "candidate_count": data.candidate_count,
            "metadata": data.metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"📝 Attempting to insert record: {record}")
        
        # Insert into Supabase
        response = supabase.table("prediction_history").insert(record).execute()
        
        print(f"✅ Supabase response: {response}")
        print(f"✅ Response data: {response.data}")
        
        return {
            "success": True,
            "message": "Prediction saved successfully",
            "record_id": response.data[0]["id"] if response.data else None,
            "timestamp": record["created_at"]
        }
        
    except Exception as e:
        print(f"❌ Error saving to Supabase: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error saving prediction to database: {str(e)}"
        )


@app.post("/predict-and-save", tags=["recipes"])
async def analyze_and_save_ingredients(
    files: List[UploadFile] = File(...),
    user_id: str = None,
    user_email: str = None
):
    """
    Analyze uploaded images to identify ingredients and suggest recipes,
    then automatically save the results to Supabase.
    
    Args:
        files: List of image files (JPEG, PNG, WebP)
        user_id: Optional user identifier for tracking
        user_email: Optional user email for tracking
        
    Returns:
        JSON object with predictions, ingredients, recipes, and save confirmation
    """
    # First, get the prediction results
    result = await analyze_ingredients(files)
    
    print(f"🔍 Prediction result: {result}")
    print(f"🔍 User ID: {user_id}, User Email: {user_email}")
    
    # Then save to Supabase if configured
    if supabase:
        try:
            prediction_data = PredictionData(
                user_id=user_id,
                user_email=user_email,
                predictions=result.get("predictions", []),
                ingredients=result.get("ingredients", []),
                recipes=result.get("recipes", []),
                candidate_count=result.get("candidate_count", 0),
                metadata={
                    "file_count": len(files),
                    "filenames": [f.filename for f in files]
                }
            )
            
            print(f"💾 Calling save_prediction...")
            save_result = await save_prediction(prediction_data)
            print(f"✅ Save result: {save_result}")
            result["saved"] = True
            result["record_id"] = save_result.get("record_id")
            result["saved_at"] = save_result.get("timestamp")
        except Exception as e:
            print(f"❌ Error in predict-and-save: {str(e)}")
            result["saved"] = False
            result["save_error"] = str(e)
    else:
        print("⚠️ Supabase not configured")
        result["saved"] = False
        result["save_error"] = "Supabase not configured"
    
    return result
