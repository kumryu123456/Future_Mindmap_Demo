-- Create mindmap_nodes table
CREATE TABLE mindmap_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    parent_id UUID REFERENCES mindmap_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_mindmap_nodes_parent_id ON mindmap_nodes(parent_id);
CREATE INDEX idx_mindmap_nodes_created_at ON mindmap_nodes(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mindmap_nodes_updated_at 
    BEFORE UPDATE ON mindmap_nodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For now, allow all operations (you might want to restrict this based on user auth)
CREATE POLICY "Allow all operations on mindmap_nodes" ON mindmap_nodes
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO mindmap_nodes (title, content, x, y) VALUES
    ('Central Idea', 'This is the main concept of our mindmap', 0, 0),
    ('Branch 1', 'First major branch from the center', -200, -100),
    ('Branch 2', 'Second major branch from the center', 200, -100),
    ('Sub-idea 1.1', 'Detailed point under Branch 1', -300, -200),
    ('Sub-idea 1.2', 'Another point under Branch 1', -100, -200);

-- Update parent relationships
UPDATE mindmap_nodes SET parent_id = (SELECT id FROM mindmap_nodes WHERE title = 'Central Idea') 
WHERE title IN ('Branch 1', 'Branch 2');

UPDATE mindmap_nodes SET parent_id = (SELECT id FROM mindmap_nodes WHERE title = 'Branch 1') 
WHERE title IN ('Sub-idea 1.1', 'Sub-idea 1.2');