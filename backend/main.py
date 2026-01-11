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

# Load environment variables
load_dotenv()

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

# Initialize Vertex AI at module level (similar to DemoDay-AI pattern)
vertexai.init(project=GOOGLE_CLOUD_PROJECT, location=VERTEX_LOCATION)
print(f"✅ Vertex AI initialized: project={GOOGLE_CLOUD_PROJECT}, location={VERTEX_LOCATION}")

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok"
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
