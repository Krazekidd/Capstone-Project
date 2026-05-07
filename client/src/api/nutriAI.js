import axiosInstance from './axiosConfig';

export const sendNutriMessage = async (message, onChunk, userContext = null) => {
  try {
    // Get user data from localStorage to access user ID
    const userData = localStorage.getItem('userData');
    let userId = 'anonymous-user'; // fallback for non-authenticated users
    
    console.log('🔍 NutriAI Debug - Raw userData from localStorage:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 NutriAI Debug - Parsed user object:', parsedUser);
        console.log('🔍 NutriAI Debug - parsedUser.user.id:', parsedUser.user?.id);
        console.log('🔍 NutriAI Debug - parsedUser.id:', parsedUser.id);
        console.log('🔍 NutriAI Debug - parsedUser.user_id:', parsedUser.user_id);
        
        userId = parsedUser.user?.id || parsedUser.id || parsedUser.user_id || 'nutri-ai-session';
        console.log('🔍 NutriAI Debug - Final userId selected:', userId);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    } else {
      console.log('🔍 NutriAI Debug - No userData found in localStorage');
    }
    
    console.log('🔍 NutriAI Debug - Final session_id being sent:', userId);

    const response = await fetch(`${axiosInstance.defaults.baseURL}/chatbot/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ 
        message,
        session_id: userId,
        user_context: userContext
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Nutri-AI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.content) {
              onChunk(parsed.content);
            }
            if (parsed.done) {
              return;
            }
          } catch (e) {
            if (e.message && e.message !== 'Unexpected end of JSON input') {
              throw e;
            }
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
