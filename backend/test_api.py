#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from httpx import AsyncClient, HTTPError
import json

# Load environment variables
load_dotenv()

# Import our modules
from config import OPENROUTER_API_KEY, OPENROUTER_URL, AI_MODEL
from schemas import UserMetrics, WorkoutPlan
from utils import create_prompt

async def test_recommend_endpoint():
    print("🧪 Testing /recommend endpoint logic...")
    
    # Check API key
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OpenRouter API key not configured")
        return False
    
    print(f"✅ API Key found: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-10:]}")
    print(f"🤖 Using AI model: {AI_MODEL}")
    print(f"🌐 OpenRouter URL: {OPENROUTER_URL}")
    
    # Create test data
    mock_plan = WorkoutPlan(
        name="Push-Pull-Legs",
        exercises=["Bench Press", "Squats", "Deadlifts", "Pull-ups", "Overhead Press"],
        days_per_week=4,
        duration_minutes=60
    )
    
    user_metrics = UserMetrics(
        weight_kg=75.0,
        height_cm=175,
        age=28,
        goal="gain",
        activity_level="moderate",
        latest_workout_plan=mock_plan
    )
    
    print(f"👤 User metrics: {user_metrics}")
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    print(f"📋 Request headers: {headers}")
    
    prompt_text = create_prompt(user_metrics)
    print("----------prompt : ", prompt_text)
    print("-------------")
    
    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
        "max_tokens": 300,
        "temperature": 0.7
    }
    
    print(f"📦 Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        print("🔄 Making API call to OpenRouter...")
        async with AsyncClient() as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            print(f"📡 Response status: {response.status_code}")
            print(f"📡 Response headers: {dict(response.headers)}")
            
            if response.status_code != 200:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"❌ Response body: {response.text}")
                return False
            
            result = response.json()
            print("----------API Response----------")
            print(json.dumps(result, indent=2))
            print("------------------------------")
            
            # Check if the expected structure exists
            if "choices" not in result or len(result["choices"]) == 0:
                print(f"❌ Invalid API response structure: {result}")
                return False
            
            choice = result["choices"][0]
            print(f"🎯 API choice: {choice}")
            
            if "message" not in choice:
                print(f"❌ No message in API response choice: {choice}")
                return False
            
            message = choice["message"]
            print(f"💬 API message: {message}")
            
            # Try to get content from reasoning field first (for this specific model), then content
            recommendation = ""
            if "reasoning" in message and message["reasoning"]:
                recommendation = message["reasoning"]
                print("✅ Using reasoning field")
            elif "content" in message and message["content"]:
                recommendation = message["content"]
                print("✅ Using content field")
            else:
                print(f"❌ No content or reasoning in API response: {message}")
                return False
            
            if not recommendation:
                print("❌ Empty recommendation from API")
                return False
            
            print(f"📝 Recommendation length: {len(recommendation)} characters")
            print(f"📝 Recommendation preview: {recommendation[:100]}...")
            print("✅ Test completed successfully!")
            return True
    
    except HTTPError as e:
        print(f"❌ HTTPError occurred: {str(e)}")
        print(f"❌ HTTPError type: {type(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_recommend_endpoint())
    if result:
        print("🎉 All tests passed!")
    else:
        print("💥 Test failed!")
    sys.exit(0 if result else 1)
