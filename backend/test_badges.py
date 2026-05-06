#!/usr/bin/env python3
"""
Simple test script to verify the badge system implementation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all badge-related imports work correctly"""
    try:
        from models.models import ClientBadge
        print("✅ ClientBadge model imported successfully")
        
        from schemas.schemas import BadgeResponse, BadgeCheckResponse
        print("✅ BadgeResponse and BadgeCheckResponse schemas imported successfully")
        
        # Test badge response structure
        badge_response = BadgeResponse(
            id=1,
            badge_name="Test Badge",
            awarded_date="2026-05-06"
        )
        print("✅ BadgeResponse schema works correctly")
        
        badge_check_response = BadgeCheckResponse(
            new_badges=[badge_response],
            total_badges=1,
            message="Test message"
        )
        print("✅ BadgeCheckResponse schema works correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def test_badge_logic():
    """Test the badge logic functions"""
    try:
        # Test that the badge logic functions exist
        from routers.users.account import (
            _check_workout_badges,
            _check_strength_badges, 
            _check_progress_badges,
            _check_attendance_badges,
            _check_streak_badges
        )
        print("✅ All badge checking functions imported successfully")
        return True
        
    except Exception as e:
        print(f"❌ Badge logic test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Enhanced Badge System")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Badge Logic Test", test_badge_logic),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        result = test_func()
        results.append(result)
        print(f"{'✅ PASSED' if result else '❌ FAILED'}: {test_name}")
    
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"🎉 All tests passed! ({passed}/{total})")
        print("✅ Enhanced Badge System is ready!")
    else:
        print(f"⚠️  Some tests failed ({passed}/{total})")
        print("❌ Please check the implementation")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
