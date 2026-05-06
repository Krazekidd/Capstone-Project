#!/usr/bin/env python3
"""
Test script for conversation endpoints
"""

import sys
import json
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def test_conversation_endpoints():
    """Test the conversation endpoints"""
    
    print("Testing conversation endpoints...")
    
    # Test POST /account/conversations
    print("\n1. Testing POST /account/conversations")
    
    conversation_data = {
        "session_id": "test_session_123",
        "title": "Test Support Chat",
        "messages": [
            {"role": "user", "content": "Hello, I need help with my account"},
            {"role": "assistant", "content": "Hi! How can I help you today?"},
            {"role": "user", "content": "I can't log in to my account"}
        ]
    }
    
    try:
        # This will fail without authentication, but we can check the endpoint exists
        response = client.post("/account/conversations", json=conversation_data)
        print(f"POST /account/conversations status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Endpoint exists, authentication required (expected)")
        elif response.status_code == 422:
            print("✅ Endpoint exists, validation working")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing POST endpoint: {e}")
    
    # Test GET /account/conversations
    print("\n2. Testing GET /account/conversations")
    
    try:
        response = client.get("/account/conversations")
        print(f"GET /account/conversations status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Endpoint exists, authentication required (expected)")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing GET endpoint: {e}")
    
    print("\n✅ Endpoint tests completed!")

if __name__ == "__main__":
    test_conversation_endpoints()
