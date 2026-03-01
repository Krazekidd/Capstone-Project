from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from httpx import AsyncClient, HTTPError
import json
import asyncio
import logging
from config import OPENROUTER_API_KEY, OPENROUTER_URL, AI_MODEL
from schemas import (
    ChatRequest, ChatbotRequest, ChatResponse, ChatbotResponse,
    RecommendationResponse, UserMetrics, WorkoutPlan
)
from utils import create_prompt, create_chat_prompt, create_chatbot_prompt, chat_sessions

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Gym AI Recommender API"}

@router.post("/chatbot", response_model=ChatbotResponse)
async def chatbot_endpoint(request: ChatbotRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    model = AI_MODEL
    
    # Build conversation history
    messages = create_chatbot_prompt(request.message, request.session_id, request.user_context)
    
    payload = {
        "model": model,
        "messages": messages,
        # "max_tokens": 200,
        "temperature": 0.7
    }
    
    try:
        async with AsyncClient() as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            # Check if the expected structure exists
            if "choices" not in result or len(result["choices"]) == 0:
                raise HTTPException(status_code=500, detail="Invalid API response structure")
            
            choice = result["choices"][0]
            if "message" not in choice:
                raise HTTPException(status_code=500, detail="No message in API response")
            
            message = choice["message"]
            
            # Try to get content from reasoning field first, then content
            response_text = ""
            if "reasoning" in message and message["reasoning"]:
                response_text = message["reasoning"]
            elif "content" in message and message["content"]:
                response_text = message["content"]
            else:
                raise HTTPException(status_code=500, detail="No content or reasoning in API response")
            
            if not response_text:
                raise HTTPException(status_code=500, detail="Empty response from API")
            
            # Update session with new messages
            session = chat_sessions[request.session_id]
            session["messages"].append({
                "role": "user",
                "content": request.message
            })
            session["messages"].append({
                "role": "assistant", 
                "content": response_text
            })
            session["message_count"] += 2  # User message + assistant response
            
            print(f"💾 Updated session {request.session_id}: {session['message_count']} total messages")
            print(f"📋 Session content: {[msg['role'] + ': ' + msg['content'][:30] + '...' for msg in session['messages'][-3:]]}")
            
            return ChatbotResponse(
                response=response_text,
                session_id=request.session_id,
                message_count=session["message_count"]
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

@router.get("/chatbot/sessions/{session_id}")
async def get_session_info(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = chat_sessions[session_id]
    print(f"🔍 Retrieved session info for {session_id}")
    print(f"📊 Session stats: {session['message_count']} messages, created {session['created_at']}")
    
    return {
        "session_id": session_id,
        "message_count": session["message_count"],
        "created_at": session["created_at"],
        "last_messages": session["messages"][-5:]  # Return last 5 messages
    }

@router.delete("/chatbot/sessions/{session_id}")
async def clear_session(session_id: str):
    if session_id in chat_sessions:
        print(f"🗑️ Clearing session {session_id} with {chat_sessions[session_id]['message_count']} messages")
        del chat_sessions[session_id]
        print(f"✅ Session {session_id} cleared successfully")
        return {"message": "Session cleared"}
    else:
        print(f"❌ Session {session_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Session not found")

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    model = AI_MODEL
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": create_chat_prompt(request.message, request.user_context)}
        ],
        # "max_tokens": 200,
        "temperature": 0.7
    }
    
    try:
        async with AsyncClient() as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            # Check if the expected structure exists
            if "choices" not in result or len(result["choices"]) == 0:
                raise HTTPException(status_code=500, detail="Invalid API response structure")
            
            choice = result["choices"][0]
            if "message" not in choice:
                raise HTTPException(status_code=500, detail="No message in API response")
            
            message = choice["message"]
            
            # Try to get content from reasoning field first, then content
            response_text = ""
            if "reasoning" in message and message["reasoning"]:
                response_text = message["reasoning"]
            elif "content" in message and message["content"]:
                response_text = message["content"]
            else:
                raise HTTPException(status_code=500, detail="No content or reasoning in API response")
            
            if not response_text:
                raise HTTPException(status_code=500, detail="Empty response from API")
            
            return ChatResponse(response=response_text)
    
    except HTTPError as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendation():
    print("🚀 /recommend endpoint called")
    
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OpenRouter API key not configured")
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    print(f"✅ API Key found: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-10:]}")
    print(f"🤖 Using AI model: {AI_MODEL}")
    print(f"🌐 OpenRouter URL: {OPENROUTER_URL}")
    
    # Embedded mock data for testing
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
    
    model = AI_MODEL
    
    prompt_text = create_prompt(user_metrics)
    print("----------prompt : ", prompt_text)
    print("-------------")
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
        # "max_tokens": 300,
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
                response.raise_for_status()
            
            result = response.json()
            print("----------API Response----------")
            print(json.dumps(result, indent=2))
            print("------------------------------")
            
            # Check if the expected structure exists
            if "choices" not in result or len(result["choices"]) == 0:
                print(f"❌ Invalid API response structure: {result}")
                raise HTTPException(status_code=500, detail="Invalid API response structure")
            
            choice = result["choices"][0]
            print(f"🎯 API choice: {choice}")
            
            if "message" not in choice:
                print(f"❌ No message in API response choice: {choice}")
                raise HTTPException(status_code=500, detail="No message in API response")
            
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
                raise HTTPException(status_code=500, detail="No content or reasoning in API response")
            
            if not recommendation:
                print("❌ Empty recommendation from API")
                raise HTTPException(status_code=500, detail="Empty recommendation from API")
            
            print(f"📝 Recommendation length: {len(recommendation)} characters")
            print(f"📝 Recommendation preview: {recommendation[:100]}...")
            
            # Extract key insights - for web format, just split into short actionable phrases
            insights = []
            # Try to extract 2-3 key action items from the recommendation
            sentences = recommendation.split('.')
            for sentence in sentences[:3]:  # Take first 3 sentences
                sentence = sentence.strip()
                if sentence and len(sentence) > 10:
                    # Create a concise insight (first 50 chars)
                    insight = sentence[:50] + ("..." if len(sentence) > 50 else "")
                    insights.append(insight)
            
            print(f"💡 Extracted {len(insights)} insights: {insights}")
            
            response_data = RecommendationResponse(
                recommendation=recommendation,
                key_insights=insights[:5]  # Limit to top 5 insights
            )
            print(f"✅ Successfully created response: {response_data}")
            return response_data
    
    except HTTPError as e:
        print(f"❌ HTTPError occurred: {str(e)}")
        print(f"❌ HTTPError type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"JSON decode error: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ===== STREAMING ENDPOINTS =====

@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Streaming version of chat endpoint"""
    logger.info("🌊 CHAT STREAM ENDPOINT CALLED")
    logger.info(f"📨 Message: {request.message[:100]}..." if len(request.message) > 100 else f"📨 Message: {request.message}")
    logger.info(f"🆔 Session ID: {request.session_id}")
    logger.info(f"👤 User Context: {'Provided' if request.user_context else 'None'}")
    
    async def generate_stream():
        if not OPENROUTER_API_KEY:
            logger.error("❌ OpenRouter API key not configured")
            yield f"data: {json.dumps({'error': 'OpenRouter API key not configured', 'done': True})}\n\n"
            return
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": AI_MODEL,
            "messages": [
                {"role": "user", "content": create_chat_prompt(request.message, request.user_context)}
            ],
            # "max_tokens": 400,  # Increased from 200 to 400 tokens
            "temperature": 0.7,
            "stream": True
        }
        
        try:
            async with AsyncClient() as client:
                async with client.stream("POST", OPENROUTER_URL, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_detail = await response.aread()
                        try:
                            error_json = json.loads(error_detail)
                            error_msg = error_json.get("error", {}).get("message", str(error_detail))
                        except:
                            error_msg = str(error_detail)
                        
                        yield f"data: {json.dumps({'error': f'API Error {response.status_code}: {error_msg}', 'done': True})}\n\n"
                        return

                    full_response = ""
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # Remove "data: " prefix
                            if data_str.strip() == "[DONE]":
                                break
                            
                            try:
                                data = json.loads(data_str)
                                if data.get("choices") and len(data["choices"]) > 0:
                                    choice = data["choices"][0]
                                    if choice.get("delta", {}).get("content"):
                                        content = choice["delta"]["content"]
                                        full_response += content
                                        yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
                            except json.JSONDecodeError:
                                continue
                    
                    # Send completion signal
                    yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response})}\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

@router.post("/chatbot/stream")
async def chatbot_stream_endpoint(request: ChatbotRequest):
    """Streaming version of chatbot endpoint"""
    
    async def generate_stream():
        if not OPENROUTER_API_KEY:
            yield f"data: {json.dumps({'error': 'OpenRouter API key not configured', 'done': True})}\n\n"
            return
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Build conversation history
        messages = create_chatbot_prompt(request.message, request.session_id, request.user_context)
        
        payload = {
            "model": AI_MODEL,
            "messages": messages,
            # "max_tokens": 500,  # Increased from 200 to 500 tokens for more verbosity
            "temperature": 0.7,
            "stream": True
        }
        
        try:
            async with AsyncClient() as client:
                async with client.stream("POST", OPENROUTER_URL, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_detail = await response.aread()
                        try:
                            error_json = json.loads(error_detail)
                            error_msg = error_json.get("error", {}).get("message", str(error_detail))
                        except:
                            error_msg = str(error_detail)
                        
                        yield f"data: {json.dumps({'error': f'API Error {response.status_code}: {error_msg}', 'done': True})}\n\n"
                        return

                    full_response = ""
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # Remove "data: " prefix
                            if data_str.strip() == "[DONE]":
                                break
                            
                            try:
                                data = json.loads(data_str)
                                if data.get("choices") and len(data["choices"]) > 0:
                                    choice = data["choices"][0]
                                    if choice.get("delta", {}).get("content"):
                                        content = choice["delta"]["content"]
                                        full_response += content
                                        yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
                            except json.JSONDecodeError:
                                continue
                    
                    # Update session with new messages after streaming is complete
                    if full_response:
                        session = chat_sessions[request.session_id]
                        session["messages"].append({
                            "role": "user",
                            "content": request.message
                        })
                        session["messages"].append({
                            "role": "assistant", 
                            "content": full_response
                        })
                        session["message_count"] += 2
                        
                        print(f"💾 Updated stream session {request.session_id}: {session['message_count']} total messages")
                    
                    # Send completion signal with session info
                    yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response, 'session_id': request.session_id, 'message_count': chat_sessions[request.session_id]['message_count']})}\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

@router.post("/recommend/stream")
async def recommend_stream_endpoint():
    """Streaming version of recommend endpoint"""
    
    async def generate_stream():
        if not OPENROUTER_API_KEY:
            yield f"data: {json.dumps({'error': 'OpenRouter API key not configured', 'done': True})}\n\n"
            return
        
        # Embedded mock data for testing
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
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": AI_MODEL,
            "messages": [
                {"role": "user", "content": create_prompt(user_metrics)}
            ],
            # "max_tokens": 600,  # Increased from 300 to 600 tokens for detailed recipes
            "temperature": 0.7,
            "stream": True
        }
        
        try:
            async with AsyncClient() as client:
                async with client.stream("POST", OPENROUTER_URL, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    
                    full_response = ""
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # Remove "data: " prefix
                            if data_str.strip() == "[DONE]":
                                break
                            
                            try:
                                data = json.loads(data_str)
                                if data.get("choices") and len(data["choices"]) > 0:
                                    choice = data["choices"][0]
                                    if choice.get("delta", {}).get("content"):
                                        content = choice["delta"]["content"]
                                        full_response += content
                                        yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
                            except json.JSONDecodeError:
                                continue
                    
                    # Extract key insights from full response
                    insights = []
                    sentences = full_response.split('.')
                    for sentence in sentences[:3]:
                        sentence = sentence.strip()
                        if sentence and len(sentence) > 10:
                            insight = sentence[:50] + ("..." if len(sentence) > 50 else "")
                            insights.append(insight)
                    
                    print("----------streaming complete----------")
                    print(full_response)
                    print("------------------------------")
                    
                    # Send completion signal with insights
                    yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response, 'key_insights': insights[:5]})}\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")
