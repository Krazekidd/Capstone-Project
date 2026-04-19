from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OAuth
oauth = OAuth()

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
# Register Google OAuth provider
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

async def get_google_user_info(access_token: str) -> dict:
    """Fetch user information from Google using access token"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
        
        return response.json()

async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    """Exchange authorization code for access token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': os.getenv('GOOGLE_CLIENT_ID'),
                'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        
        return response.json()