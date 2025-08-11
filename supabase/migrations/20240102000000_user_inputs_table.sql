-- Create user_inputs table for storing raw text and extracted keywords
CREATE TABLE user_inputs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    raw_text TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_user_inputs_processed_at ON user_inputs(processed_at);
CREATE INDEX idx_user_inputs_created_at ON user_inputs(created_at);

-- Create GIN index for JSONB keywords field for efficient querying
CREATE INDEX idx_user_inputs_keywords ON user_inputs USING GIN (keywords);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_inputs_updated_at 
    BEFORE UPDATE ON user_inputs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_inputs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_inputs table
-- For now, allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on user_inputs" ON user_inputs
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data to demonstrate the structure
INSERT INTO user_inputs (raw_text, keywords, processed_at) VALUES
(
    'I want to create a mobile app for tracking fitness goals and workouts. The app should have user authentication, progress tracking, and social features.',
    '{
        "nouns": ["app", "fitness", "goals", "workouts", "authentication", "progress", "tracking", "features"],
        "verbs": ["create", "tracking", "have"],
        "adjectives": ["mobile", "social"],
        "entities": [],
        "topics": ["mobile app", "fitness goals", "user authentication", "progress tracking", "social features"],
        "sentiment": "positive"
    }'::jsonb,
    NOW()
),
(
    'The current system is slow and difficult to use. We need better performance and a more intuitive user interface design.',
    '{
        "nouns": ["system", "performance", "interface", "design"],
        "verbs": ["need", "use"],
        "adjectives": ["slow", "difficult", "better", "intuitive"],
        "entities": [],
        "topics": ["current system", "user interface", "interface design"],
        "sentiment": "negative"
    }'::jsonb,
    NOW()
);

-- Add comments to document the table structure
COMMENT ON TABLE user_inputs IS 'Stores user input text and extracted keywords using NLP processing';
COMMENT ON COLUMN user_inputs.raw_text IS 'Original text input from the user';
COMMENT ON COLUMN user_inputs.keywords IS 'JSONB object containing extracted keywords: nouns, verbs, adjectives, entities, topics, sentiment';
COMMENT ON COLUMN user_inputs.processed_at IS 'Timestamp when the text was processed and keywords were extracted';