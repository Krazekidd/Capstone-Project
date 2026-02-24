// ===========================================================
//  Gym AI Recommender – Frontend Script
// ===========================================================

const API_BASE = 'http://localhost:8000';

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const el = {
    // Recommendation
    getRecommendation:    document.getElementById('getRecommendation'),
    recommendationResult: document.getElementById('recommendationResult'),
    // Chat (no memory)
    chatInput:    document.getElementById('chatInput'),
    sendChat:     document.getElementById('sendChat'),
    chatMessages: document.getElementById('chatMessages'),
    // Chatbot (memory)
    chatbotInput:    document.getElementById('chatbotInput'),
    sendChatbot:     document.getElementById('sendChatbot'),
    chatbotMessages: document.getElementById('chatbotMessages'),
    sessionId:       document.getElementById('sessionId'),
    clearSession:    document.getElementById('clearSession'),
    // Sidebar
    sidebar:        document.getElementById('sidebar'),
    sidebarToggle:  document.getElementById('sidebarToggle'),
    savedList:      document.getElementById('savedList'),
    savedEmpty:     document.getElementById('savedEmpty'),
    convBadge:      document.getElementById('convBadge'),
    saveChatBtn:    document.getElementById('saveChatBtn'),
    // Dialog
    dialogOverlay:  document.getElementById('dialogOverlay'),
    dialogCancel:   document.getElementById('dialogCancel'),
    dialogConfirm:  document.getElementById('dialogConfirm'),
    chatTitleInput: document.getElementById('chatTitleInput'),
};

// ---------------------------------------------------------------------------
// Utility: message helpers
// ---------------------------------------------------------------------------
function addMessage(container, text, type = 'assistant', isStreaming = false) {
    const div = document.createElement('div');
    div.className = `message ${type}${isStreaming ? ' streaming' : ''}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function showTypingIndicator(container) {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.textContent = '🤔 AI is thinking…';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function updateStreaming(div, content) {
    div.textContent += content;
    div.parentElement.scrollTop = div.parentElement.scrollHeight;
}

// ---------------------------------------------------------------------------
// Streaming helper
// ---------------------------------------------------------------------------
async function streamResponse(endpoint, payload, container) {
    const indicator = showTypingIndicator(container);
    let streamingDiv = null;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        container.removeChild(indicator);
        streamingDiv = addMessage(container, '', 'assistant', true);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split('\n');
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.error) { updateStreaming(streamingDiv, `⚠ ${data.error}`); break; }
                    if (data.content) updateStreaming(streamingDiv, data.content);
                    if (data.done) {
                        streamingDiv.classList.remove('streaming');
                        // Key insights (recommendations only)
                        if (data.key_insights?.length && endpoint === '/recommend/stream') {
                            const ins = document.createElement('div');
                            ins.className = 'insights';
                            ins.innerHTML = '<strong>Key Insights:</strong><ul>' +
                                data.key_insights.map(i => `<li>${i}</li>`).join('') + '</ul>';
                            container.appendChild(ins);
                        }
                        // Refresh sidebar after a chatbot message is streamed
                        if (data.session_id) refreshSidebar(data.session_id);
                    }
                } catch (_) { /* skip malformed chunks */ }
            }
        }
    } catch (err) {
        if (indicator.parentElement) container.removeChild(indicator);
        addMessage(container, `⚠ Error: ${err.message}`, 'assistant');
    }
}

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------
el.getRecommendation.addEventListener('click', () => {
    el.recommendationResult.innerHTML = '';
    streamResponse('/recommend/stream', {}, el.recommendationResult);
});

// ---------------------------------------------------------------------------
// Chat (no memory)
// ---------------------------------------------------------------------------
el.sendChat.addEventListener('click', () => {
    const msg = el.chatInput.value.trim();
    if (!msg) return;
    addMessage(el.chatMessages, msg, 'user');
    el.chatInput.value = '';
    streamResponse('/chat/stream', { message: msg, session_id: 'temp-session', user_context: null }, el.chatMessages);
});
el.chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') el.sendChat.click(); });

// ---------------------------------------------------------------------------
// Chatbot (memory)
// ---------------------------------------------------------------------------
el.sendChatbot.addEventListener('click', () => {
    const msg = el.chatbotInput.value.trim();
    const sid = el.sessionId.value.trim() || 'default';
    if (!msg) return;
    addMessage(el.chatbotMessages, msg, 'user');
    el.chatbotInput.value = '';
    streamResponse('/chatbot/stream', { message: msg, session_id: sid, user_context: null }, el.chatbotMessages);
});
el.chatbotInput.addEventListener('keypress', e => { if (e.key === 'Enter') el.sendChatbot.click(); });

// Clear session
el.clearSession.addEventListener('click', async () => {
    const sid = el.sessionId.value.trim() || 'default';
    try {
        const res = await fetch(`${API_BASE}/chatbot/sessions/${sid}`, { method: 'DELETE' });
        el.chatbotMessages.innerHTML = '';
        addMessage(el.chatbotMessages, res.ok ? '✅ Session cleared!' : '⚠ Failed to clear session.', 'assistant');
    } catch (err) {
        addMessage(el.chatbotMessages, `⚠ ${err.message}`, 'assistant');
    }
});

// ---------------------------------------------------------------------------
// Sidebar – mobile toggle
// ---------------------------------------------------------------------------
el.sidebarToggle.addEventListener('click', () => {
    el.sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', e => {
    if (
        window.innerWidth <= 768 &&
        !el.sidebar.contains(e.target) &&
        e.target !== el.sidebarToggle
    ) {
        el.sidebar.classList.remove('open');
    }
});

// ---------------------------------------------------------------------------
// Saved Conversations – Sidebar Rendering
// ---------------------------------------------------------------------------
let activeSavedId = null;

async function refreshSidebar(sessionId) {
    sessionId = sessionId || el.sessionId.value.trim() || 'default';
    try {
        const res = await fetch(`${API_BASE}/conversations?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) return;
        const list = await res.json();

        renderSavedList(list);
        updateBadge(list.length);
    } catch (_) { /* DB might not be running; fail silently */ }
}

function renderSavedList(conversations) {
    // Clear except the empty placeholder
    el.savedList.innerHTML = '';

    if (!conversations.length) {
        const li = document.createElement('li');
        li.className = 'saved-empty';
        li.textContent = 'No saved conversations yet.';
        el.savedList.appendChild(li);
        return;
    }

    conversations.forEach(conv => {
        const li = buildSavedItem(conv);
        el.savedList.appendChild(li);
    });
}

function buildSavedItem(conv) {
    const li = document.createElement('li');
    li.className = `saved-item${conv.id === activeSavedId ? ' active' : ''}`;
    li.dataset.id = conv.id;

    const date = new Date(conv.created_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    li.innerHTML = `
        <div class="saved-item-header">
            <span class="saved-item-title">${escapeHtml(conv.title)}</span>
            <button class="saved-item-delete" title="Delete this conversation" data-id="${conv.id}">✕</button>
        </div>
        <div class="saved-item-meta">${conv.message_count} messages · ${date}</div>
    `;

    // Load conversation on click (but not delete button)
    li.addEventListener('click', e => {
        if (e.target.classList.contains('saved-item-delete')) return;
        loadSavedConversation(conv.id);
    });

    // Delete button
    li.querySelector('.saved-item-delete').addEventListener('click', e => {
        e.stopPropagation();
        deleteConversation(conv.id);
    });

    return li;
}

function updateBadge(count) {
    const max = 5;
    el.convBadge.textContent = `${count} / ${max}`;
    el.convBadge.classList.toggle('at-limit', count >= max);
    el.saveChatBtn.disabled = count >= max;
    el.saveChatBtn.title = count >= max
        ? 'Limit reached – delete a conversation to save a new one'
        : 'Save current conversation';
}

// ---------------------------------------------------------------------------
// Load a saved conversation into the chatbot window
// ---------------------------------------------------------------------------
async function loadSavedConversation(convId) {
    try {
        const res = await fetch(`${API_BASE}/conversations/${convId}`);
        if (!res.ok) { alert('Failed to load conversation.'); return; }
        const conv = await res.json();

        // Visual: mark active
        activeSavedId = convId;
        document.querySelectorAll('.saved-item').forEach(li => {
            li.classList.toggle('active', li.dataset.id === convId);
        });

        // Re-render chatbot window with the saved messages
        el.chatbotMessages.innerHTML = '';
        addMessage(el.chatbotMessages, `📂 Loaded: "${conv.title}"`, 'assistant');

        for (const msg of conv.messages) {
            if (msg.role === 'system') continue; // skip system prompts
            addMessage(el.chatbotMessages, msg.content, msg.role === 'user' ? 'user' : 'assistant');
        }

        // Close sidebar on mobile after loading
        if (window.innerWidth <= 768) el.sidebar.classList.remove('open');
    } catch (err) {
        alert(`Error loading conversation: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// Delete a saved conversation
// ---------------------------------------------------------------------------
async function deleteConversation(convId) {
    if (!confirm('Delete this saved conversation?')) return;
    try {
        const res = await fetch(`${API_BASE}/conversations/${convId}`, { method: 'DELETE' });
        if (!res.ok) { alert('Failed to delete conversation.'); return; }
        if (activeSavedId === convId) activeSavedId = null;
        await refreshSidebar();
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// Save Dialog
// ---------------------------------------------------------------------------
el.saveChatBtn.addEventListener('click', () => {
    el.chatTitleInput.value = '';
    el.dialogOverlay.classList.add('open');
    el.chatTitleInput.focus();
});

el.dialogCancel.addEventListener('click', () => {
    el.dialogOverlay.classList.remove('open');
});

el.dialogOverlay.addEventListener('click', e => {
    if (e.target === el.dialogOverlay) el.dialogOverlay.classList.remove('open');
});

el.chatTitleInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') el.dialogConfirm.click();
});

el.dialogConfirm.addEventListener('click', async () => {
    const title = el.chatTitleInput.value.trim() || 'Untitled Chat';
    const sid   = el.sessionId.value.trim() || 'default';
    el.dialogOverlay.classList.remove('open');
    await saveCurrentConversation(sid, title);
});

async function saveCurrentConversation(sessionId, title) {
    try {
        const res = await fetch(`${API_BASE}/conversations/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, title }),
        });

        if (res.status === 409) {
            alert('⚠ You\'ve reached the 5 saved conversation limit. Delete one to save a new chat.');
            return;
        }
        if (res.status === 404) {
            addMessage(el.chatbotMessages, '⚠ No active session found. Start chatting first, then save.', 'assistant');
            return;
        }
        if (res.status === 400) {
            addMessage(el.chatbotMessages, '⚠ No messages to save yet – send some messages first.', 'assistant');
            return;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
            alert(`Save failed: ${err.detail}`);
            return;
        }

        await refreshSidebar(sessionId);
        addMessage(el.chatbotMessages, `✅ Conversation "${title}" saved!`, 'assistant');
    } catch (err) {
        alert(`Save error: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// Helper: escape HTML to prevent XSS in rendered titles
// ---------------------------------------------------------------------------
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Initialise
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('Gym AI Recommender – Loaded');
    addMessage(el.chatMessages, '👋 Welcome! Ask me about fitness, nutrition, or Jamaican meals!', 'assistant');
    addMessage(el.chatbotMessages, '🤖 Hello! I\'m your smart fitness assistant with memory. How can I help you today?', 'assistant');

    // Load saved conversations for default session on startup
    refreshSidebar(el.sessionId.value.trim() || 'default');
});

// Re-load sidebar when session ID changes
el.sessionId.addEventListener('change', () => {
    refreshSidebar(el.sessionId.value.trim() || 'default');
});
