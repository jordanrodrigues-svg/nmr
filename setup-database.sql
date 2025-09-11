-- SQL commands to set up the quiz functionality tables in Supabase
-- Run these commands in your Supabase SQL Editor

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code text NOT NULL UNIQUE,
    phase text NOT NULL DEFAULT 'lobby' CHECK (phase IN ('lobby', 'quiz', 'results')),
    current_question integer DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id varchar NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    name text NOT NULL,
    score integer DEFAULT 0,
    answers jsonb DEFAULT '[]'::jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_session_code ON game_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on game_sessions" ON game_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on players" ON players
    FOR ALL USING (true) WITH CHECK (true);

-- Insert a default game session for testing (session code: CHEMWITHJ)
INSERT INTO game_sessions (session_code, phase, current_question) 
VALUES ('CHEMWITHJ', 'lobby', 0)
ON CONFLICT (session_code) DO NOTHING;

COMMENT ON TABLE game_sessions IS 'Stores quiz game sessions with their current state';
COMMENT ON TABLE players IS 'Stores players participating in quiz sessions';