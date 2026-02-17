// API Configuration
const API_BASE = 'http://localhost:8000';

// DOM Elements
const elements = {
    getRecommendation: document.getElementById('getRecommendation'),
    recommendationResult: document.getElementById('recommendationResult'),
    chatInput: document.getElementById('chatInput'),
    sendChat: document.getElementById('sendChat'),
    chatMessages: document.getElementById('chatMessages'),
    chatbotInput: document.getElementById('chatbotInput'),
    sendChatbot: document.getElementById('sendChatbot'),
    chatbotMessages: document.getElementById('chatbotMessages'),
    sessionId: document.getElementById('sessionId'),
    clearSession: document.getElementById('clearSession')
};

// Utility Functions
function addMessage(container, message, type = 'assistant', isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}${isStreaming ? ' streaming' : ''}`;
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    return messageDiv;
}

function showTypingIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.textContent = 'AI is thinking...';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    return indicator;
}

function updateStreamingMessage(messageDiv, content) {
    messageDiv.textContent += content;
    const container = messageDiv.parentElement;
    container.scrollTop = container.scrollHeight;
}

// Streaming API Call
async function streamResponse(endpoint, payload, container, messageDiv = null) {
    const typingIndicator = showTypingIndicator(container);
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Remove typing indicator and create streaming message
        container.removeChild(typingIndicator);
        const streamingDiv = messageDiv || addMessage(container, '', 'assistant', true);
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.error) {
                            updateStreamingMessage(streamingDiv, `Error: ${data.error}`);
                            break;
                        }
                        
                        if (data.content) {
                            updateStreamingMessage(streamingDiv, data.content);
                        }
                        
                        if (data.done) {
                            // Remove streaming class when done
                            streamingDiv.classList.remove('streaming');
                            
                            // Handle additional data
                            if (data.key_insights && endpoint === '/recommend/stream') {
                                const insightsDiv = document.createElement('div');
                                insightsDiv.className = 'insights';
                                insightsDiv.innerHTML = '<strong>Key Insights:</strong><ul>' + 
                                    data.key_insights.map(insight => `<li>${insight}</li>`).join('') + '</ul>';
                                container.appendChild(insightsDiv);
                            }
                            
                            if (data.session_id && data.message_count) {
                                console.log(`Session ${data.session_id}: ${data.message_count} messages`);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }
    } catch (error) {
        container.removeChild(typingIndicator);
        addMessage(container, `Error: ${error.message}`, 'assistant');
    }
}

// Event Listeners
elements.getRecommendation.addEventListener('click', () => {
    elements.recommendationResult.innerHTML = '';
    streamResponse('/recommend/stream', {}, elements.recommendationResult);
});

elements.sendChat.addEventListener('click', () => {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    addMessage(elements.chatMessages, message, 'user');
    elements.chatInput.value = '';
    
    streamResponse('/chat/stream', {
        message: message,
        session_id: 'temp-session',
        user_context: null
    }, elements.chatMessages);
});

elements.sendChatbot.addEventListener('click', () => {
    const message = elements.chatbotInput.value.trim();
    const sessionId = elements.sessionId.value.trim() || 'default';
    
    if (!message) return;
    
    addMessage(elements.chatbotMessages, message, 'user');
    elements.chatbotInput.value = '';
    
    streamResponse('/chatbot/stream', {
        message: message,
        session_id: sessionId,
        user_context: null
    }, elements.chatbotMessages);
});

elements.clearSession.addEventListener('click', async () => {
    const sessionId = elements.sessionId.value.trim() || 'default';
    
    try {
        const response = await fetch(`${API_BASE}/chatbot/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            elements.chatbotMessages.innerHTML = '';
            addMessage(elements.chatbotMessages, 'Session cleared!', 'assistant');
        } else {
            addMessage(elements.chatbotMessages, 'Failed to clear session', 'assistant');
        }
    } catch (error) {
        addMessage(elements.chatbotMessages, `Error: ${error.message}`, 'assistant');
    }
});

// Enter key support
elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.sendChat.click();
    }
});

elements.chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.sendChatbot.click();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Gym AI Recommender Frontend Loaded');
    
    // Add welcome message
    addMessage(elements.chatMessages, 'Welcome! Ask me about fitness, nutrition, or Jamaican meals!', 'assistant');
    addMessage(elements.chatbotMessages, 'Hello! I\'m your smart fitness assistant with memory. How can I help you today?', 'assistant');
});
