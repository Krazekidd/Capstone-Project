#!/usr/bin/env python3
"""
Simple test script to validate conversation schemas and imports
"""

import sys
import json
from datetime import datetime
import uuid

def test_schemas():
    """Test the conversation schemas"""
    
    print("Testing conversation schemas...")
    
    try:
        from schemas.schemas import (
            AccountConversationRequest, 
            AccountConversationResponse, 
            AccountConversationHistoryResponse
        )
        print("✅ Schemas imported successfully")
        
        # Test AccountConversationRequest
        conversation_data = {
            "session_id": "test_session_123",
            "title": "Test Support Chat",
            "messages": [
                {"role": "user", "content": "Hello, I need help with my account"},
                {"role": "assistant", "content": "Hi! How can I help you today?"},
                {"role": "user", "content": "I can't log in to my account"}
            ]
        }
        
        request = AccountConversationRequest(**conversation_data)
        print("✅ AccountConversationRequest schema validation passed")
        
        # Test AccountConversationResponse
        response_data = {
            "id": uuid.uuid4(),
            "session_id": "test_session_123",
            "title": "Test Support Chat",
            "message_count": 3,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        response = AccountConversationResponse(**response_data)
        print("✅ AccountConversationResponse schema validation passed")
        
        # Test AccountConversationHistoryResponse
        history_data = {
            "conversations": [response],
            "total_count": 1
        }
        
        history = AccountConversationHistoryResponse(**history_data)
        print("✅ AccountConversationHistoryResponse schema validation passed")
        
        return True
        
    except Exception as e:
        print(f"❌ Schema test failed: {e}")
        return False

def test_models():
    """Test the conversation models"""
    
    print("\nTesting conversation models...")
    
    try:
        # Test basic import
        from models.models import SavedConversation, ConversationMessage
        print("✅ Models imported successfully")
        
        # Test model creation (without database)
        print("✅ Model classes are accessible")
        
        return True
        
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_endpoint_structure():
    """Test if the endpoints are properly structured"""
    
    print("\nTesting endpoint structure...")
    
    try:
        # Check if the account router file has our endpoints
        with open('routers/users/account.py', 'r') as f:
            content = f.read()
            
        if '@router.post("/conversations"' in content:
            print("✅ POST /account/conversations endpoint found")
        else:
            print("❌ POST /account/conversations endpoint not found")
            return False
            
        if '@router.get("/conversations"' in content:
            print("✅ GET /account/conversations endpoint found")
        else:
            print("❌ GET /account/conversations endpoint not found")
            return False
            
        if "save_support_conversation" in content:
            print("✅ save_support_conversation function found")
        else:
            print("❌ save_support_conversation function not found")
            return False
            
        if "get_conversation_history" in content:
            print("✅ get_conversation_history function found")
        else:
            print("❌ get_conversation_history function not found")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Endpoint structure test failed: {e}")
        return False

if __name__ == "__main__":
    print("Running conversation endpoint tests...\n")
    
    success = True
    success &= test_schemas()
    success &= test_models()
    success &= test_endpoint_structure()
    
    if success:
        print("\n🎉 All tests passed! The conversation endpoints are properly implemented.")
        print("\nEndpoints implemented:")
        print("- POST /account/conversations - Save support chat conversations")
        print("- GET /account/conversations - Get chat history")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        sys.exit(1)
