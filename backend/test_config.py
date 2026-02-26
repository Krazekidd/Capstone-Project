#!/usr/bin/env python3

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if API key is loaded
api_key = os.getenv("OPENROUTER_API_KEY")
print(f"API Key loaded: {bool(api_key)}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key preview: {api_key[:10]}...{api_key[-10:]}")
else:
    print("❌ API Key not found in environment variables")
    print("Available env vars starting with OPENROUTER:")
    for key, value in os.environ.items():
        if key.startswith("OPENROUTER"):
            print(f"  {key}: {value[:10]}..." if value else f"  {key}: (empty)")

# Test imports
try:
    from router import router
    print("✅ Router import successful")
except Exception as e:
    print(f"❌ Router import failed: {e}")

try:
    from config import OPENROUTER_API_KEY, OPENROUTER_URL, AI_MODEL
    print(f"✅ Config import successful")
    print(f"  OPENROUTER_API_KEY: {'Set' if OPENROUTER_API_KEY else 'Not set'}")
    print(f"  OPENROUTER_URL: {OPENROUTER_URL}")
    print(f"  AI_MODEL: {AI_MODEL}")
except Exception as e:
    print(f"❌ Config import failed: {e}")
