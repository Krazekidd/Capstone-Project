# Ollama Configuration
OLLAMA_MODEL = "qwen2.5:3b" # "llama3:8b" #"lfm2.5-thinking:1.2b"  # Change to your preferred model
# Other common models: "llama3.2", "llama3.1", "mistral", "codellama", "phi3"

#"gemma3n:e2b"
#llama3.2:1b - second to try
#llama3.2:3b -first to try
#llama3:8b
#phi3:3.8b
#qwen2.5:1.5b   
#qwen2.5:3b

# Context Configuration
import os
OLLAMA_CONTEXT_SIZE = int(os.getenv("OLLAMA_CONTEXT_SIZE", "4096"))  # Default to 4096 tokens
OLLAMA_CHATBOT_CONTEXT_SIZE = int(os.getenv("OLLAMA_CHATBOT_CONTEXT_SIZE", "16384"))  # Larger context for chatbot with memory