from typing import List, Dict, Optional
from datetime import datetime
from schemas import UserMetrics
from config import MAX_CONTEXT_MESSAGES
import logging

logger = logging.getLogger(__name__)

# In-memory storage for chat sessions (for demo purposes)
chat_sessions: Dict[str, Dict[str, any]] = {}


def create_prompt(user_metrics: UserMetrics) -> str:
    logger.info("=" * 80)
    logger.info("🔧 CREATE_PROMPT - Building recommendation prompt")
    logger.info(f"📊 User Metrics: weight={user_metrics.weight_kg}kg, height={user_metrics.height_cm}cm, age={user_metrics.age}")
    logger.info(f"🎯 Goal: {user_metrics.goal}, Activity Level: {user_metrics.activity_level}")
    
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

    logger.info(f"📝 Prompt length: {len(prompt)} chars (~{len(prompt)//4} tokens)")
    logger.info("=" * 80)
    return prompt

def create_chat_prompt(message: str, user_context: Optional[UserMetrics] = None) -> str:
    logger.info("=" * 80)
    logger.info("💬 CREATE_CHAT_PROMPT - Building chat prompt")
    logger.info(f"📨 User Message: {message[:100]}..." if len(message) > 100 else f"📨 User Message: {message}")
    
    context = ""
    if user_context:
        context = f"User: {user_context.weight_kg}kg, {user_context.height_cm}cm, {user_context.age}yo, goal: {user_context.goal}, activity: {user_context.activity_level}. "
        logger.info(f"👤 User Context Added: weight={user_context.weight_kg}kg, goal={user_context.goal}")
    else:
        logger.info("👤 No user context provided")
    
    # Shorter, more efficient prompt
    prompt = f"""{context}You're a friendly fitness & nutrition expert specializing in Caribbean/Jamaican cuisine.

WRITING STYLE: Use standard English only. NO Jamaican Patois. NO em dashes (—). Use simple punctuation: periods, commas, question marks only.

RESPONSE LENGTH: 
- For casual chat/greetings: Keep it brief (30-50 words)
- For fitness/nutrition questions: Provide detailed answers (150-200 words)
- NEVER include word counts in your responses

Answer naturally - be conversational for greetings, detailed and informative for fitness/nutrition questions. Use Jamaican food examples when relevant.

User: {message}"""

    logger.info(f"📝 Final prompt length: {len(prompt)} chars (~{len(prompt)//4} tokens)")
    logger.info("=" * 80)
    return prompt

def create_chatbot_prompt(message: str, session_id: str, user_context: Optional[UserMetrics] = None) -> List[Dict[str, str]]:
    logger.info("=" * 80)
    logger.info("🤖 CREATE_CHATBOT_PROMPT - Building chatbot conversation")
    logger.info(f"🆔 Session ID: {session_id}")
    logger.info(f"📨 User Message: {message[:100]}..." if len(message) > 100 else f"📨 User Message: {message}")
    
    # Get or create session
    if session_id not in chat_sessions:
        chat_sessions[session_id] = {
            "messages": [],
            "created_at": datetime.now(),
            "message_count": 0
        }
        logger.info(f"✨ Created new chat session: {session_id}")
    else:
        logger.info(f"♻️ Using existing chat session: {session_id}")
        logger.info(f"📚 Session contains {len(chat_sessions[session_id]['messages'])} messages")
    
    session = chat_sessions[session_id]
    
    # Add system context (shortened)
    context = ""
    if user_context:
        context = f"User: {user_context.weight_kg}kg, {user_context.height_cm}cm, {user_context.age}yo, goal: {user_context.goal}, activity: {user_context.activity_level}. "
        logger.info(f"👤 User Context Added: weight={user_context.weight_kg}kg, goal={user_context.goal}")
    else:
        logger.info("👤 No user context provided")
    
    # Optimized system instructions - much shorter
    system_instructions = f"""You're a friendly fitness & nutrition coach specializing in Caribbean/Jamaican cuisine. {context}

WRITING STYLE: Use standard English only. NO Jamaican Patois or dialect. NO em dashes (—). Use simple punctuation: periods, commas, question marks only.

RESPONSE LENGTH:
- For casual chat/greetings: Keep it brief (30-50 words)
- For fitness/nutrition questions: Provide detailed answers (150-200 words)
- NEVER include word counts in your responses

Be conversational for casual chat (hi, how are you, etc.) but expert and thorough for fitness/nutrition questions. Use Jamaican food examples when relevant. Remember previous messages."""

    logger.info(f"📋 System instructions length: {len(system_instructions)} chars")

    # Build conversation history - limit to last MAX_CONTEXT_MESSAGES to save tokens
    history_messages = session["messages"][-MAX_CONTEXT_MESSAGES:]
    
    logger.info(f"📜 Including last {len(history_messages)} messages from history (max: {MAX_CONTEXT_MESSAGES})")
    
    messages = []
    
    if not history_messages:
        # No history: system + current user message
        messages.append({
            "role": "user",
            "content": f"{system_instructions}\n\n{message}"
        })
        logger.info("📝 No history - merged instructions with current message")
    else:
        # Has history: prepend instructions to first message
        for i, msg in enumerate(history_messages):
            if i == 0:
                content = f"{system_instructions}\n\nPrevious: {msg['content']}"
                messages.append({"role": msg["role"], "content": content})
                logger.info("� Prepended instructions to first history message")
            else:
                messages.append(msg)
        
        # Add current message
        messages.append({
            "role": "user", 
            "content": message
        })

    # Ensure roles alternate
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
    logger.info(f"� Total prompt messages: {len(final_messages)}")
    logger.info(f"📏 Total characters: {total_chars} (~{total_chars // 4} tokens)")
    logger.info("=" * 80)
    
    return final_messages
