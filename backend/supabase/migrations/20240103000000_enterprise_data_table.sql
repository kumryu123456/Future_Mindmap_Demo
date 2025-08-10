-- Create enterprise_data table for caching fetched enterprise data
CREATE TABLE enterprise_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword_query TEXT NOT NULL,
    source TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '[]'::jsonb,
    relevance_score FLOAT NOT NULL DEFAULT 0.0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    cached_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_enterprise_data_keyword_query ON enterprise_data(keyword_query);
CREATE INDEX idx_enterprise_data_cached_until ON enterprise_data(cached_until);
CREATE INDEX idx_enterprise_data_relevance_score ON enterprise_data(relevance_score DESC);
CREATE INDEX idx_enterprise_data_fetched_at ON enterprise_data(fetched_at DESC);

-- Create GIN index for JSONB data field for efficient querying
CREATE INDEX idx_enterprise_data_content ON enterprise_data USING GIN (data);

-- Create composite index for cache lookups
CREATE INDEX idx_enterprise_data_cache_lookup ON enterprise_data(keyword_query, cached_until);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_enterprise_data_updated_at 
    BEFORE UPDATE ON enterprise_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE enterprise_data ENABLE ROW LEVEL SECURITY;

-- Create policies for enterprise_data table
-- For now, allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on enterprise_data" ON enterprise_data
    FOR ALL USING (true) WITH CHECK (true);

-- Create data_sources table for managing external data sources
CREATE TABLE data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_url TEXT NOT NULL,
    api_key_required BOOLEAN DEFAULT false,
    headers JSONB DEFAULT '{}'::jsonb,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for data_sources
CREATE INDEX idx_data_sources_name ON data_sources(name);
CREATE INDEX idx_data_sources_is_active ON data_sources(is_active);

-- Create trigger for data_sources
CREATE TRIGGER update_data_sources_updated_at 
    BEFORE UPDATE ON data_sources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for data_sources
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for data_sources
CREATE POLICY "Allow all operations on data_sources" ON data_sources
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data sources
INSERT INTO data_sources (name, description, base_url, api_key_required, is_active) VALUES
(
    'internal_wiki',
    'Company internal wiki and documentation',
    'https://wiki.company.com/api/v1',
    true,
    true
),
(
    'knowledge_base', 
    'Enterprise knowledge management system',
    'https://kb.company.com/api',
    true,
    true
),
(
    'external_api',
    'External industry data provider',
    'https://api.industry-data.com/v2',
    true,
    false
),
(
    'crm_system',
    'Customer relationship management data',
    'https://crm.company.com/api/v1',
    true,
    true
),
(
    'project_management',
    'Project management and task tracking',
    'https://pm.company.com/api',
    true,
    true
);

-- Insert sample enterprise data for demonstration
INSERT INTO enterprise_data (keyword_query, source, data, relevance_score, cached_until) VALUES
(
    'productivity, automation, tools',
    'internal_wiki,knowledge_base',
    '[
        {
            "id": "prod_001",
            "title": "Enterprise Automation Strategy 2024",
            "description": "Comprehensive roadmap for implementing automation across business units",
            "category": "strategy",
            "source": "internal_wiki",
            "relevance_score": 0.95,
            "keywords": ["automation", "productivity", "strategy", "roadmap"],
            "metadata": {"department": "Strategy", "priority": "high", "status": "approved"},
            "url": "/wiki/automation-strategy-2024",
            "created_at": "2024-01-01T10:00:00Z"
        },
        {
            "id": "prod_002",
            "title": "Productivity Tools Comparison Matrix",
            "description": "Analysis of approved productivity tools and their effectiveness metrics",
            "category": "tools",
            "source": "knowledge_base",
            "relevance_score": 0.88,
            "keywords": ["productivity", "tools", "comparison", "metrics"],
            "metadata": {"department": "IT", "last_updated": "2024-01-15"},
            "url": "/kb/productivity-tools-matrix",
            "created_at": "2024-01-15T14:30:00Z"
        }
    ]'::jsonb,
    0.915,
    NOW() + INTERVAL '24 hours'
),
(
    'mobile, app, development',
    'tech_standards,internal_wiki',
    '[
        {
            "id": "mobile_001",
            "title": "Mobile Development Standards v3.0",
            "description": "Updated enterprise guidelines for mobile application development",
            "category": "standards",
            "source": "tech_standards",
            "relevance_score": 0.96,
            "keywords": ["mobile", "development", "standards", "guidelines"],
            "metadata": {"version": "3.0", "compliance": "mandatory", "effective_date": "2024-01-01"},
            "url": "/standards/mobile-dev-v3",
            "created_at": "2024-01-01T09:00:00Z"
        },
        {
            "id": "mobile_002",
            "title": "Cross-Platform App Architecture Patterns",
            "description": "Best practices for building scalable cross-platform mobile applications",
            "category": "architecture",
            "source": "internal_wiki",
            "relevance_score": 0.89,
            "keywords": ["mobile", "app", "architecture", "cross-platform"],
            "metadata": {"department": "Engineering", "complexity": "advanced"},
            "url": "/wiki/mobile-architecture-patterns",
            "created_at": "2024-01-10T16:20:00Z"
        }
    ]'::jsonb,
    0.925,
    NOW() + INTERVAL '24 hours'
);

-- Add comments to document the table structures
COMMENT ON TABLE enterprise_data IS 'Caches fetched and normalized enterprise data with keyword associations';
COMMENT ON COLUMN enterprise_data.keyword_query IS 'Comma-separated keywords used for the data query';
COMMENT ON COLUMN enterprise_data.source IS 'Comma-separated list of data sources used';
COMMENT ON COLUMN enterprise_data.data IS 'JSONB array of normalized enterprise data records';
COMMENT ON COLUMN enterprise_data.relevance_score IS 'Average relevance score of the data set (0.0 to 1.0)';
COMMENT ON COLUMN enterprise_data.cached_until IS 'Timestamp until which this data is considered fresh';

COMMENT ON TABLE data_sources IS 'Configuration for external enterprise data sources';
COMMENT ON COLUMN data_sources.name IS 'Unique identifier for the data source';
COMMENT ON COLUMN data_sources.base_url IS 'Base URL for API calls to this data source';
COMMENT ON COLUMN data_sources.headers IS 'JSONB object containing required HTTP headers';
COMMENT ON COLUMN data_sources.rate_limit_per_hour IS 'Maximum API calls per hour for this source';