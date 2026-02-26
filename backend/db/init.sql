-- ============================================================
--  Capstone Project – Chatbot Conversation Storage
--  Run this to create the required tables and indexes.
-- ============================================================

-- Enable the pgcrypto extension so we can generate UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
--  Table: saved_conversations
--  One row per saved chat session.  Each session_id (user /
--  browser session) may have at most 5 saved conversations –
--  that limit is enforced in application code and can also be
--  checked via the index on session_id.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_conversations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(255) NOT NULL,
    title           VARCHAR(255) NOT NULL DEFAULT 'Untitled Chat',
    message_count   INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: look up all saved conversations for a given session
CREATE INDEX IF NOT EXISTS idx_saved_conv_session_id
    ON saved_conversations (session_id);

-- Index: order conversations by newest first per session
CREATE INDEX IF NOT EXISTS idx_saved_conv_session_created
    ON saved_conversations (session_id, created_at DESC);

-- ------------------------------------------------------------
--  Table: conversation_messages
--  All messages (user + assistant) for each saved conversation
--  in correct order.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_messages (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID        NOT NULL
                            REFERENCES saved_conversations(id)
                            ON DELETE CASCADE,
    role                VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content             TEXT        NOT NULL,
    position            INTEGER     NOT NULL,   -- 0-based ordering within the conversation
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: fetch all messages for a conversation in order
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id
    ON conversation_messages (conversation_id, position ASC);

-- Index: used when cascading deletes via conversation_id
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id_only
    ON conversation_messages (conversation_id);

-- ------------------------------------------------------------
--  Trigger: keep saved_conversations.updated_at fresh
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_saved_conv_updated_at ON saved_conversations;
CREATE TRIGGER trg_saved_conv_updated_at
    BEFORE UPDATE ON saved_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
