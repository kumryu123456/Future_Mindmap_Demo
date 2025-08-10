-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for storing vector representations
CREATE TABLE embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('mindmap_node', 'user_input', 'enterprise_data', 'plan_node', 'generated_content')),
    content_id UUID NOT NULL,
    content_text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for embeddings table
CREATE INDEX idx_embeddings_content_type ON embeddings(content_type);
CREATE INDEX idx_embeddings_content_id ON embeddings(content_id);
CREATE INDEX idx_embeddings_created_at ON embeddings(created_at DESC);

-- Create vector similarity search index (HNSW for fast approximate search)
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Create GIN index for metadata queries
CREATE INDEX idx_embeddings_metadata ON embeddings USING GIN (metadata);

-- Create trigger to update updated_at
CREATE TRIGGER update_embeddings_updated_at 
    BEFORE UPDATE ON embeddings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on embeddings" ON embeddings
    FOR ALL USING (true) WITH CHECK (true);

-- Create node_expansions table for tracking auto-expansion history
CREATE TABLE node_expansions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_node_id UUID NOT NULL,
    parent_node_type TEXT NOT NULL DEFAULT 'mindmap_node',
    expansion_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    similar_content JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_children JSONB NOT NULL DEFAULT '[]'::jsonb,
    expansion_method TEXT NOT NULL DEFAULT 'llm_generation',
    similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
    max_children INTEGER DEFAULT 5,
    llm_model TEXT DEFAULT 'gpt-3.5-turbo',
    generation_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for node_expansions
CREATE INDEX idx_node_expansions_parent_id ON node_expansions(parent_node_id);
CREATE INDEX idx_node_expansions_parent_type ON node_expansions(parent_node_type);
CREATE INDEX idx_node_expansions_method ON node_expansions(expansion_method);
CREATE INDEX idx_node_expansions_created_at ON node_expansions(created_at DESC);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_node_expansions_context ON node_expansions USING GIN (expansion_context);
CREATE INDEX idx_node_expansions_similar_content ON node_expansions USING GIN (similar_content);
CREATE INDEX idx_node_expansions_generated_children ON node_expansions USING GIN (generated_children);

-- Create trigger for node_expansions
CREATE TRIGGER update_node_expansions_updated_at 
    BEFORE UPDATE ON node_expansions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE node_expansions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on node_expansions" ON node_expansions
    FOR ALL USING (true) WITH CHECK (true);

-- Function to calculate cosine similarity
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS DECIMAL AS $$
BEGIN
    RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql;

-- Function to find similar content by vector similarity
CREATE OR REPLACE FUNCTION find_similar_content(
    query_embedding vector(1536),
    content_types TEXT[] DEFAULT ARRAY['mindmap_node', 'user_input', 'enterprise_data'],
    similarity_threshold DECIMAL DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content_type TEXT,
    content_id UUID,
    content_text TEXT,
    similarity_score DECIMAL,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.content_type,
        e.content_id,
        e.content_text,
        ROUND(cosine_similarity(e.embedding, query_embedding), 4) as similarity_score,
        e.metadata
    FROM embeddings e
    WHERE 
        e.content_type = ANY(content_types)
        AND e.embedding IS NOT NULL
        AND cosine_similarity(e.embedding, query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Insert sample embeddings data (using mock embeddings for demonstration)
-- Note: In production, these would be real OpenAI embeddings

-- Sample mindmap node embeddings
INSERT INTO embeddings (content_type, content_id, content_text, embedding, metadata) VALUES
(
    'mindmap_node',
    (SELECT id FROM mindmap_nodes WHERE title = 'Central Idea' LIMIT 1),
    'Central Idea: This is the main concept of our mindmap',
    ('[' || array_to_string(array(select random() from generate_series(1,1536)), ',') || ']')::vector,
    '{"node_type": "central", "depth": 0}'::jsonb
),
(
    'mindmap_node',
    (SELECT id FROM mindmap_nodes WHERE title = 'Branch 1' LIMIT 1),
    'Branch 1: First major branch from the center',
    ('[' || array_to_string(array(select random() from generate_series(1,1536)), ',') || ']')::vector,
    '{"node_type": "branch", "depth": 1}'::jsonb
);

-- Sample user input embeddings
INSERT INTO embeddings (content_type, content_id, content_text, embedding, metadata)
SELECT 
    'user_input',
    id,
    raw_text,
    ('[' || array_to_string(array(select random() from generate_series(1,1536)), ',') || ']')::vector,
    ('{"keywords": ' || keywords::text || '}')::jsonb
FROM user_inputs 
LIMIT 3;

-- Sample enterprise data embeddings
INSERT INTO embeddings (content_type, content_id, content_text, embedding, metadata)
SELECT 
    'enterprise_data',
    id,
    keyword_query,
    ('[' || array_to_string(array(select random() from generate_series(1,1536)), ',') || ']')::vector,
    ('{"source": "' || source || '", "relevance_score": ' || relevance_score || '}')::jsonb
FROM enterprise_data 
LIMIT 3;

-- Sample plan node embeddings
INSERT INTO embeddings (content_type, content_id, content_text, embedding, metadata)
SELECT 
    'plan_node',
    id,
    title || ': ' || description,
    ('[' || array_to_string(array(select random() from generate_series(1,1536)), ',') || ']')::vector,
    ('{"objective": "' || objective || '"}')::jsonb
FROM plans 
LIMIT 3;

-- Insert sample node expansion history
INSERT INTO node_expansions (
    parent_node_id, 
    parent_node_type,
    expansion_context,
    similar_content,
    generated_children,
    expansion_method,
    similarity_threshold,
    max_children,
    generation_prompt
) VALUES
(
    (SELECT id FROM mindmap_nodes WHERE title = 'Central Idea' LIMIT 1),
    'mindmap_node',
    '{
        "parent_title": "Central Idea",
        "parent_content": "This is the main concept of our mindmap",
        "expansion_goal": "Generate related sub-concepts and implementation ideas"
    }'::jsonb,
    '[
        {
            "id": "similar_1",
            "content_text": "Strategic planning and goal setting",
            "similarity_score": 0.85,
            "source": "enterprise_data"
        },
        {
            "id": "similar_2", 
            "content_text": "Project management methodologies",
            "similarity_score": 0.78,
            "source": "user_input"
        }
    ]'::jsonb,
    '[
        {
            "title": "Strategic Planning",
            "content": "Develop comprehensive strategic plans based on the central concept",
            "reasoning": "Highly related to main concept with strong similarity match",
            "x": -150,
            "y": -100
        },
        {
            "title": "Implementation Framework", 
            "content": "Create actionable framework for executing the main idea",
            "reasoning": "Practical next step derived from similar content analysis",
            "x": 150,
            "y": -100
        },
        {
            "title": "Success Metrics",
            "content": "Define measurable outcomes and KPIs for the central concept",
            "reasoning": "Essential component for any strategic initiative",
            "x": 0,
            "y": -200
        }
    ]'::jsonb,
    'llm_generation',
    0.7,
    5,
    'Generate 3-5 child nodes that expand on the parent concept. Use similar content for context and ensure each child node provides actionable value.'
);

-- Add comments
COMMENT ON TABLE embeddings IS 'Stores vector embeddings for semantic similarity search across all content types';
COMMENT ON COLUMN embeddings.content_type IS 'Type of content: mindmap_node, user_input, enterprise_data, plan_node, generated_content';
COMMENT ON COLUMN embeddings.content_id IS 'UUID reference to the actual content record';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding (1536 dimensions for OpenAI ada-002)';
COMMENT ON COLUMN embeddings.metadata IS 'Additional context and properties for the embedded content';

COMMENT ON TABLE node_expansions IS 'Tracks history and context of automatic node expansions';
COMMENT ON COLUMN node_expansions.expansion_context IS 'Context used for expansion including parent info and goals';
COMMENT ON COLUMN node_expansions.similar_content IS 'Similar content found via vector search used for generation';
COMMENT ON COLUMN node_expansions.generated_children IS 'Array of child nodes generated by LLM';
COMMENT ON COLUMN node_expansions.similarity_threshold IS 'Minimum similarity score used for content matching';

COMMENT ON FUNCTION find_similar_content IS 'Performs vector similarity search to find related content across content types';