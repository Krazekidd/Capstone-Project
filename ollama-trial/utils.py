from typing import List, Dict, Optional
from datetime import datetime
from schemas import UserMetrics
import uuid

# In-memory storage for chat sessions (for demo purposes)
chat_sessions: Dict[str, Dict[str, any]] = {}

def create_prompt(user_metrics: UserMetrics) -> str:
    goal = user_metrics.goal.lower()
    goal_text = "gain" if goal == "gain" else "lose" if goal == "loss" else "maintain"
    
    prompt = f"""User Profile: {user_metrics.weight_kg}kg, {user_metrics.height_cm}cm, age {user_metrics.age}, {user_metrics.goal} goal, {user_metrics.activity_level} activity level.

Please provide 3 authentic Jamaican meal options specifically designed for {goal_text} weight. For each meal, include:

1. **Dish Name** - Traditional Jamaican name
2. **Why it works** - How it supports {goal_text} goals
3. **Key Ingredients** - Main components with quantities
4. **Preparation Steps** - Clear, numbered cooking instructions
5. **Nutritional Benefits** - Protein, carbs, and healthy fats content
6. **Portion Size** - Recommended serving size

Format each meal option clearly separated with numbers 1, 2, and 3.

Make the recipes practical, using ingredients commonly available in Jamaican households or Caribbean markets. Include cooking tips and possible substitutions where relevant.

Focus on creating satisfying, flavorful meals that align with {goal_text} objectives while celebrating Jamaican culinary traditions."""

    return prompt

def create_chat_prompt(message: str, user_context: Optional[UserMetrics] = None) -> str:
    context = ""
    if user_context:
        context = f"User Profile: {user_context.weight_kg}kg, {user_context.height_cm}cm, age {user_context.age}, goal: {user_context.goal}, activity level: {user_context.activity_level}. "
    
    prompt = f"""{context}User Question: {message}

As a knowledgeable fitness and nutrition expert specializing in Jamaican cuisine, please provide a comprehensive and detailed response. Include:

- Specific, actionable advice
- Jamaican food examples when relevant
- Scientific reasoning behind recommendations
- Practical implementation tips
- Potential variations or alternatives

Make your response thorough (150-200 words) while remaining practical and easy to understand. Focus on evidence-based information that the user can immediately apply to their fitness and nutrition journey."""

    return prompt

def create_chatbot_prompt(message: str, session_id: str, user_context: Optional[UserMetrics] = None) -> List[Dict[str, str]]:
    # Get or create session
    if session_id not in chat_sessions:
        chat_sessions[session_id] = {
            "messages": [],
            "created_at": datetime.now(),
            "message_count": 0
        }
        print(f" Created new chat session: {session_id}")
    else:
        print(f" Using existing chat session: {session_id}")
        print(f" Session contains {len(chat_sessions[session_id]['messages'])} messages")
    
    session = chat_sessions[session_id]
    
    # Build conversation history
    messages = []
    
    # Add system context
    context = ""
    if user_context:
        context = f"User Profile: {user_context.weight_kg}kg, {user_context.height_cm}cm, age {user_context.age}, goal: {user_context.goal}, activity level: {user_context.activity_level}. "
    
    system_prompt = f"""You are a knowledgeable fitness and nutrition assistant specializing in Jamaican cuisine and holistic wellness. {context}

Your role is to provide:
- Detailed, evidence-based fitness advice
- Authentic Jamaican meal recommendations
- Nutritional guidance with scientific backing
- Practical lifestyle tips
- Supportive, encouraging communication style

Always provide comprehensive responses (150-200 words) that are:
- Informative and educational
- Culturally relevant to Jamaican context
- Practical and actionable
- Supportive and motivating
- Consistent with the user's goals and preferences

Remember previous conversations to provide personalized, context-aware advice. Build rapport by referencing previous discussions when relevant."""

    messages.append({
        "role": "system",
        "content": system_prompt
    })
    
    # Add conversation history (last 10 messages to manage token usage)
    history_messages = session["messages"][-10:]
    print(f" Adding {len(history_messages)} messages from history to prompt")
    for msg in history_messages:
        messages.append(msg)
    
    # Add current message
    messages.append({
        "role": "user", 
        "content": message
    })
    
    # Calculate prompt size metrics
    total_chars = sum(len(str(msg['content'])) for msg in messages)
    total_tokens_estimate = total_chars // 4  # Rough estimate: 1 token ≈ 4 chars
    
    print(f"🎯 Total prompt messages: {len(messages)}")
    print(f"📏 Prompt character count: {total_chars}")
    print(f"🪙 Estimated token count: {total_tokens_estimate}")
    print(f"📊 Prompt breakdown: {[(msg['role'], len(msg['content'])) for msg in messages]}")
    
    return messages

# Conversation management utilities - DISABLED
def generate_session_id() -> str:
    """Generate a unique session ID"""
    return str(uuid.uuid4())

# def generate_conversation_title(messages: List[Dict]) -> str:
#     """Generate a title for conversation based on first user message - DISABLED"""
#     pass

# def get_session_info(session_id: str) -> Optional[Dict]:
#     """Get session information - DISABLED"""
#     pass

# def is_session_saved(session_id: str) -> bool:
#     """Check if session is saved to database - DISABLED"""
#     pass

# def mark_session_saved(session_id: str):
#     """Mark session as saved in memory - DISABLED"""
#     pass
