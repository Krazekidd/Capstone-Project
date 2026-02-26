from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from schemas import UserMetrics, RecommendationResponse, ChatRequest, ChatResponse, ChatbotRequest, ChatbotResponse, WorkoutPlan  # Removed conversation-related schemas
from utils import create_prompt, create_chat_prompt, create_chatbot_prompt, chat_sessions, generate_session_id  # Removed conversation-related utils
from config import OLLAMA_MODEL, OLLAMA_CONTEXT_SIZE, OLLAMA_CHATBOT_CONTEXT_SIZE
# from database import ConversationDB, create_tables, get_db  # Disabled database imports
import json
import logging
import time
from ollama import chat
# from sqlalchemy.orm import Session  # Disabled SQLAlchemy import
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ollama_app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Gym AI Recommender - Ollama Version"}

@router.post("/chatbot", response_model=ChatbotResponse)
async def chatbot_endpoint(request: ChatbotRequest):
    # Build conversation history
    messages = create_chatbot_prompt(request.message, request.session_id, request.user_context)
    
    try:
        # Use official ollama library
        response = chat(
            model=OLLAMA_MODEL,
            messages=messages
        )
        
        response_text = response.message.content
        
        if not response_text:
            raise HTTPException(status_code=500, detail="Empty response from Ollama")
        
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
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

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
    try:
        # Use official ollama library
        response = chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": create_chat_prompt(request.message, request.user_context)}]
        )
        
        response_text = response.message.content
        
        if not response_text:
            raise HTTPException(status_code=500, detail="Empty response from Ollama")
        
        return ChatResponse(response=response_text)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendation():
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
    
    print("----------prompt : ", create_prompt(user_metrics))
    print("-------------")
    
    try:
        # Use official ollama library
        response = chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": create_prompt(user_metrics)}]
        )
        
        recommendation = response.message.content
        print("----------Ollama Response----------")
        print(recommendation)
        print("------------------------------")
        
        if not recommendation:
            raise HTTPException(status_code=500, detail="Empty recommendation from Ollama")
        
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
        
        return RecommendationResponse(
            recommendation=recommendation,
            key_insights=insights[:5]  # Limit to top 5 insights
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@router.get("/models")
async def list_models():
    """List available Ollama models"""
    try:
        from ollama import list
        models = list()
        return {"models": models}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")

# ===== STREAMING ENDPOINTS =====

@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Streaming version of chat endpoint"""
    
    async def generate_stream():
        try:
            import time
            start_time = time.time()
            first_word_time = None
            
            # Use streaming chat from ollama
            response = chat(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": create_chat_prompt(request.message, request.user_context)}],
                stream=True,
                options={
                    "temperature": 0.7,
                    "num_ctx": OLLAMA_CONTEXT_SIZE  # Use standard context size
                }
            )
            
            full_response = ""
            chunk_count = 0
            for chunk in response:
                chunk_count += 1
                
                # Handle different Ollama response formats
                content = ""
                
                if isinstance(chunk, dict):
                    # Check if message exists and has content
                    message_obj = chunk.get('message')
                    if message_obj:
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    # Fallback to direct field access
                    if not content:
                        if chunk.get('content'):
                            content = chunk['content']
                        elif chunk.get('thinking'):
                            content = chunk['thinking']
                        elif chunk.get('response'):
                            content = chunk['response']
                
                # Try to handle chunk as object directly
                else:
                    if hasattr(chunk, 'message'):
                        message_obj = chunk.message
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    if not content and hasattr(chunk, 'content'):
                        content = chunk.content
                    elif not content and hasattr(chunk, 'thinking'):
                        content = chunk.thinking
                
                if content:
                    # Record first word time if this is the first content
                    if first_word_time is None:
                        first_word_time = time.time()
                    
                    full_response += content
                    # Send chunk as SSE
                    yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
            
            logger.info(f"CHAT Processed {chunk_count} chunks total")
            logger.info(f"CHAT Final response length: {len(full_response)}")
            if first_word_time is None:
                logger.warning(f"CHAT CRITICAL: No content was ever detected in any chunk!")
            else:
                logger.info(f"CHAT Content was detected successfully")
            
            # Print timing information at end
            if first_word_time is not None:
                time_to_first_word = (first_word_time - start_time) * 1000  # Convert to milliseconds
                logger.info(f"CHAT FIRST WORD TIMING: {time_to_first_word:.2f}ms from start to first content")
                logger.info(f"Model: {OLLAMA_MODEL}")
                first_content_preview = full_response[:20] + "..." if len(full_response) > 20 else full_response
                logger.info(f"First content: '{first_content_preview}'")
                total_time = (time.time() - start_time) * 1000
                logger.info(f"Total streaming time: {total_time:.2f}ms")
                logger.info(f"Total response length: {len(full_response)} chars")
            else:
                logger.warning(f"WARNING: No content was ever detected in any chunk!")
            
            # Send completion signal
            yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming: {e}")
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

@router.post("/chatbot/stream")
async def chatbot_stream_endpoint(request: ChatbotRequest):
    """Streaming version of chatbot endpoint"""
    
    async def generate_stream():
        try:
            import time
            start_time = time.time()
            first_word_time = None
            print(f"🎯 Starting chatbot stream for model: {OLLAMA_MODEL}")
            print(f"⏰ Start time recorded: {start_time}")
            
            # Build conversation history
            messages = create_chatbot_prompt(request.message, request.session_id, request.user_context)
            
            # Use streaming chat from ollama
            response = chat(
                model=OLLAMA_MODEL,
                messages=messages,
                stream=True,
                options={
                    "temperature": 0.7,
                    "num_ctx": OLLAMA_CHATBOT_CONTEXT_SIZE  # Use larger context size for chatbot with memory
                }
            )
            
            full_response = ""
            chunk_count = 0
            for chunk in response:
                chunk_count += 1
                
                # Handle different Ollama response formats
                content = ""
                
                if isinstance(chunk, dict):
                    # Check if message exists and has content
                    message_obj = chunk.get('message')
                    if message_obj:
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    # Fallback to direct field access
                    if not content:
                        if chunk.get('content'):
                            content = chunk['content']
                        elif chunk.get('thinking'):
                            content = chunk['thinking']
                        elif chunk.get('response'):
                            content = chunk['response']
                
                # Try to handle chunk as object directly
                else:
                    if hasattr(chunk, 'message'):
                        message_obj = chunk.message
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    if not content and hasattr(chunk, 'content'):
                        content = chunk.content
                    elif not content and hasattr(chunk, 'thinking'):
                        content = chunk.thinking
                
                if content:
                    # Record first word time if this is the first content
                    if first_word_time is None:
                        first_word_time = time.time()
                    
                    full_response += content
                    # Send chunk as SSE
                    yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
            
            # Print timing information at the end
            if first_word_time is not None:
                time_to_first_word = (first_word_time - start_time) * 1000  # Convert to milliseconds
                logger.info(f"CHATBOT FIRST WORD TIMING: {time_to_first_word:.2f}ms from start to first content")
                logger.info(f"Model: {OLLAMA_MODEL}")
                first_content_preview = full_response[:20] + "..." if len(full_response) > 20 else full_response
                logger.info(f"First content: '{first_content_preview}'")
                total_time = (time.time() - start_time) * 1000
                logger.info(f"Total streaming time: {total_time:.2f}ms")
                logger.info(f"Total response length: {len(full_response)} chars")
            else:
                logger.warning(f"WARNING: No content was ever detected in any chunk!")
            
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
                
                logger.info(f"Updated stream session {request.session_id}: {session['message_count']} total messages")
            
            # Send completion signal with session info
            yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response, 'session_id': request.session_id, 'message_count': chat_sessions[request.session_id]['message_count']})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in chatbot streaming: {e}")
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

@router.post("/recommend/stream")
async def recommend_stream_endpoint():
    """Streaming version of recommend endpoint"""
    
    async def generate_stream():
        try:
            import time
            start_time = time.time()
            first_word_time = None
            
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
            
            prompt_text = create_prompt(user_metrics)
            logger.info(f"Starting recommend streaming with model: {OLLAMA_MODEL}")
            logger.info(f"Prompt length: {len(prompt_text)} characters")
            
            # Use streaming chat from ollama
            response = chat(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": create_prompt(user_metrics)}],
                stream=True,
                options={
                    "temperature": 0.7,
                    "num_ctx": OLLAMA_CONTEXT_SIZE  # Use standard context size
                }
            )
            
            full_response = ""
            chunk_count = 0
            for chunk in response:
                chunk_count += 1
                
                # Handle different Ollama response formats
                content = ""
                
                if isinstance(chunk, dict):
                    # Check if message exists and has content
                    message_obj = chunk.get('message')
                    if message_obj:
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    # Fallback to direct field access
                    if not content:
                        if chunk.get('content'):
                            content = chunk['content']
                        elif chunk.get('thinking'):
                            content = chunk['thinking']
                        elif chunk.get('response'):
                            content = chunk['response']
                    
                    # Also check if this is the final chunk with done=True
                    if chunk.get('done') and not content:
                        continue
                
                # Try to handle chunk as object directly
                else:
                    if hasattr(chunk, 'message'):
                        message_obj = chunk.message
                        if hasattr(message_obj, 'content') and message_obj.content:
                            content = message_obj.content
                        elif hasattr(message_obj, 'thinking') and message_obj.thinking:
                            content = message_obj.thinking
                    
                    if not content and hasattr(chunk, 'content'):
                        content = chunk.content
                    elif not content and hasattr(chunk, 'thinking'):
                        content = chunk.thinking
                
                if content:
                    # Record first word time if this is the first content
                    if first_word_time is None:
                        first_word_time = time.time()
                    
                    full_response += content
                    
                    # Send chunk as SSE with proper formatting
                    try:
                        chunk_data = json.dumps({'content': content, 'done': False})
                        sse_data = f"data: {chunk_data}\n\n"
                        yield sse_data
                    except Exception as e:
                        logger.error(f"Error formatting SSE chunk: {e}")
                        # Try to send a simple chunk
                        yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
            
            logger.info(f"RECOMMEND Processed {chunk_count} chunks total")
            logger.info(f"RECOMMEND Final response length: {len(full_response)}")
            if first_word_time is None:
                logger.warning(f"RECOMMEND CRITICAL: No content was ever detected in any chunk!")
            else:
                logger.info(f"RECOMMEND Content was detected successfully")
            
            # Print timing information at end
            if first_word_time is not None:
                time_to_first_word = (first_word_time - start_time) * 1000  # Convert to milliseconds
                logger.info(f"RECOMMEND FIRST WORD TIMING: {time_to_first_word:.2f}ms from start to first content")
                logger.info(f"Model: {OLLAMA_MODEL}")
                first_content_preview = full_response[:20] + "..." if len(full_response) > 20 else full_response
                logger.info(f"First content: '{first_content_preview}'")
                total_time = (time.time() - start_time) * 1000
                logger.info(f"Total streaming time: {total_time:.2f}ms")
                logger.info(f"Total response length: {len(full_response)} chars")
            else:
                logger.warning(f"WARNING: No content was ever detected in any chunk!")
            
            # Send completion signal
            try:
                completion_data = json.dumps({'content': '', 'done': True, 'full_response': full_response})
                yield f"data: {completion_data}\n\n"
            except Exception as e:
                logger.error(f"Error sending completion signal: {e}")
                yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in recommend streaming: {e}")
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

# Conversation Management Endpoints - DISABLED
# All database functionality has been disabled for now

# @router.post("/conversations/save")
# async def save_conversation(request: ConversationTitle, session_id: str, db: Session = Depends(get_db)):
#     """Save conversation to database - DISABLED"""
#     pass

# @router.get("/conversations", response_model=SavedConversationsResponse)
# async def get_saved_conversations(db: Session = Depends(get_db)):
#     """Get all saved conversations (max 5) - DISABLED"""
#     pass

# @router.post("/conversations/load")
# async def load_conversation(request: ConversationLoadRequest, db: Session = Depends(get_db)):
#     """Load conversation from database to memory - DISABLED"""
#     pass

# @router.delete("/conversations/delete")
# async def delete_conversation(request: ConversationDeleteRequest, db: Session = Depends(get_db)):
#     """Delete conversation from database - DISABLED"""
#     pass

@router.post("/conversations/new")
async def create_new_conversation():
    """Create a new conversation session"""
    try:
        session_id = generate_session_id()
        
        # Initialize new session in memory
        chat_sessions[session_id] = {
            "messages": [],
            "created_at": datetime.now(),
            "message_count": 0,
            "is_saved": False
        }
        
        logger.info(f"Created new conversation session: {session_id}")
        
        return {"session_id": session_id, "message": "New conversation created"}
    
    except Exception as e:
        logger.error(f"Error creating new conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
