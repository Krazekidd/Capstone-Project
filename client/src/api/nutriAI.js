import api from './axiosConfig';

export const sendNutriMessage = async (message, onChunk, userContext = null) => {
  try {
    const response = await fetch(`${api.defaults.baseURL}/chatbot/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ 
        message,
        session_id: 'nutri-ai-session',
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
