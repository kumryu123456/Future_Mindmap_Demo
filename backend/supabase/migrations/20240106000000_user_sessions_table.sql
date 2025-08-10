-- Create user_sessions table for storing session state
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID,
    session_name TEXT,
    session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    viewport_state JSONB DEFAULT '{}'::jsonb,
    ui_preferences JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW() + INTERVAL '30 days') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity DESC);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

-- Create composite index for active sessions by user
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active, last_activity DESC);

-- Create GIN indexes for JSONB fields for efficient querying
CREATE INDEX idx_user_sessions_session_data ON user_sessions USING GIN (session_data);
CREATE INDEX idx_user_sessions_viewport_state ON user_sessions USING GIN (viewport_state);
CREATE INDEX idx_user_sessions_ui_preferences ON user_sessions USING GIN (ui_preferences);

-- Create trigger to automatically update updated_at and last_activity
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update last_activity on any update
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_last_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

-- Enable Row Level Security (RLS)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions table
-- For now, allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < TIMEZONE('utc'::text, NOW())
    AND is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also mark sessions as inactive if they haven't been active for more than expiry time
    UPDATE user_sessions 
    SET is_active = false
    WHERE expires_at < TIMEZONE('utc'::text, NOW())
    AND is_active = true;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_sessions BIGINT,
    active_sessions BIGINT,
    expired_sessions BIGINT,
    avg_session_duration INTERVAL,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE is_active = true) as active_sessions,
        COUNT(*) FILTER (WHERE expires_at < TIMEZONE('utc'::text, NOW())) as expired_sessions,
        AVG(updated_at - created_at) as avg_session_duration,
        MAX(last_activity) as last_activity
    FROM user_sessions
    WHERE (target_user_id IS NULL OR user_id = target_user_id);
END;
$$ LANGUAGE plpgsql;

-- Insert sample user sessions for demonstration
INSERT INTO user_sessions (
    session_id, 
    user_id, 
    session_name,
    session_data,
    viewport_state,
    ui_preferences
) VALUES
(
    'session_demo_001',
    gen_random_uuid(),
    'Mobile App Planning Session',
    '{
        "mindmap_nodes": [
            {
                "id": "node_1",
                "title": "Mobile App",
                "content": "Planning a mobile fitness tracking application",
                "x": 0,
                "y": 0,
                "selected": true
            },
            {
                "id": "node_2", 
                "title": "User Authentication",
                "content": "Secure login and user management",
                "x": -200,
                "y": -150,
                "selected": false
            }
        ],
        "connections": [
            {
                "from": "node_1",
                "to": "node_2",
                "type": "hierarchical"
            }
        ],
        "user_inputs": ["mobile app", "fitness tracking", "user management"],
        "current_plan_id": null,
        "last_expansion": null
    }'::jsonb,
    '{
        "zoom": 1.0,
        "center_x": 0,
        "center_y": 0,
        "viewport_width": 1920,
        "viewport_height": 1080
    }'::jsonb,
    '{
        "theme": "light",
        "auto_save": true,
        "show_grid": true,
        "snap_to_grid": false,
        "node_style": "modern",
        "connection_style": "curved"
    }'::jsonb
),
(
    'session_demo_002',
    gen_random_uuid(),
    'Enterprise Automation Project',
    '{
        "mindmap_nodes": [
            {
                "id": "node_auto_1",
                "title": "Process Automation",
                "content": "Streamlining business workflows through automation",
                "x": 100,
                "y": 50,
                "selected": false
            }
        ],
        "connections": [],
        "user_inputs": ["process automation", "workflow optimization", "business efficiency"],
        "current_plan_id": "plan_uuid_example",
        "last_expansion": {
            "parent_node": "node_auto_1",
            "expansion_type": "comprehensive",
            "timestamp": "2024-01-01T10:00:00Z"
        }
    }'::jsonb,
    '{
        "zoom": 0.8,
        "center_x": 50,
        "center_y": 25,
        "viewport_width": 1440,
        "viewport_height": 900
    }'::jsonb,
    '{
        "theme": "dark",
        "auto_save": true,
        "show_grid": false,
        "snap_to_grid": true,
        "node_style": "minimal",
        "connection_style": "straight",
        "sidebar_collapsed": true
    }'::jsonb
),
(
    'session_expired_example',
    gen_random_uuid(),
    'Expired Session Example',
    '{
        "mindmap_nodes": [],
        "connections": [],
        "user_inputs": [],
        "current_plan_id": null,
        "last_expansion": null
    }'::jsonb,
    '{"zoom": 1.0, "center_x": 0, "center_y": 0}'::jsonb,
    '{"theme": "light"}'::jsonb
);

-- Update one session to be expired for testing
UPDATE user_sessions 
SET expires_at = TIMEZONE('utc'::text, NOW() - INTERVAL '1 day'),
    is_active = false,
    last_activity = TIMEZONE('utc'::text, NOW() - INTERVAL '2 days')
WHERE session_id = 'session_expired_example';

-- Add comments to document the table structure
COMMENT ON TABLE user_sessions IS 'Stores user session state including mindmap data, viewport settings, and UI preferences';
COMMENT ON COLUMN user_sessions.session_id IS 'Unique session identifier provided by client';
COMMENT ON COLUMN user_sessions.user_id IS 'Reference to authenticated user (nullable for anonymous sessions)';
COMMENT ON COLUMN user_sessions.session_name IS 'Human-readable name for the session';
COMMENT ON COLUMN user_sessions.session_data IS 'JSONB containing mindmap nodes, connections, and application state';
COMMENT ON COLUMN user_sessions.viewport_state IS 'JSONB containing zoom, pan, and viewport configuration';
COMMENT ON COLUMN user_sessions.ui_preferences IS 'JSONB containing theme, layout, and user interface preferences';
COMMENT ON COLUMN user_sessions.last_activity IS 'Timestamp of last session interaction (updated on every save)';
COMMENT ON COLUMN user_sessions.expires_at IS 'Session expiration timestamp (default 30 days from creation)';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active and valid';

COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired sessions and marks old sessions as inactive';
COMMENT ON FUNCTION get_session_stats IS 'Returns session statistics for a user or globally';

-- Create a scheduled job to cleanup expired sessions (if using pg_cron extension)
-- This would need to be enabled separately in your Supabase instance
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');