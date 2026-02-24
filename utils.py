from typing import List, Dict, Optional
from datetime import datetime
from schemas import UserMetrics

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
    
    # Base system instructions
    system_instructions = f"""You are a knowledgeable fitness and nutrition assistant specializing in Jamaican cuisine and holistic wellness. {context}

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

    # Build conversation history
    messages = []
    history_messages = session["messages"][-10:]
    
    # Strategy: Merge system instructions into the first available message
    # This is more compatible with many OpenRouter providers than a separate 'system' role.
    
    if not history_messages:
        # No history: system + current user message
        messages.append({
            "role": "user",
            "content": f"INSTRUCTIONS: {system_instructions}\n\nUSER MESSAGE: {message}"
        })
    else:
        # Has history: prepend instructions to the FIRST history message
        for i, msg in enumerate(history_messages):
            if i == 0:
                content = f"CONTEXT & INSTRUCTIONS: {system_instructions}\n\nPREVIOUS MESSAGE: {msg['content']}"
                messages.append({"role": msg["role"], "content": content})
            else:
                messages.append(msg)
        
        # Add current message
        messages.append({
            "role": "user", 
            "content": message
        })

    # Final Check: Ensure roles alternate (User, Assistant, User...) 
    # to prevent 400 errors from strict providers like Groq/Fireworks
    final_messages = []
    last_role = None
    for msg in messages:
        if msg["role"] != last_role:
            final_messages.append(msg)
            last_role = msg["role"]
        else:
            # Merge consecutive same-role messages
            final_messages[-1]["content"] += "\n\n" + msg["content"]

    # Calculate prompt size metrics
    total_chars = sum(len(str(msg['content'])) for msg in final_messages)
    print(f" Total prompt messages: {len(final_messages)}")
    print(f" Estimated token count: {total_chars // 4}")
    
    return final_messages
    
    return messages
