-- Create plans table for storing generated plans
CREATE TABLE plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    objective TEXT NOT NULL,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    plan_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    plan_source TEXT NOT NULL DEFAULT 'openai',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_plans_title ON plans(title);
CREATE INDEX idx_plans_plan_source ON plans(plan_source);
CREATE INDEX idx_plans_generated_at ON plans(generated_at DESC);
CREATE INDEX idx_plans_created_at ON plans(created_at DESC);

-- Create GIN indexes for JSONB fields for efficient querying
CREATE INDEX idx_plans_context ON plans USING GIN (context);
CREATE INDEX idx_plans_plan_structure ON plans USING GIN (plan_structure);
CREATE INDEX idx_plans_metadata ON plans USING GIN (metadata);

-- Create text search index for finding plans by keywords
CREATE INDEX idx_plans_text_search ON plans USING GIN (
    to_tsvector('english', title || ' ' || description || ' ' || objective)
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies for plans table
-- For now, allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on plans" ON plans
    FOR ALL USING (true) WITH CHECK (true);

-- Create plan_executions table for tracking plan progress
CREATE TABLE plan_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL, -- References the id field within plan_structure JSONB
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_duration INTERVAL,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for plan_executions
CREATE INDEX idx_plan_executions_plan_id ON plan_executions(plan_id);
CREATE INDEX idx_plan_executions_node_id ON plan_executions(node_id);
CREATE INDEX idx_plan_executions_status ON plan_executions(status);
CREATE INDEX idx_plan_executions_assigned_to ON plan_executions(assigned_to);

-- Create composite index for efficient plan progress queries
CREATE INDEX idx_plan_executions_plan_status ON plan_executions(plan_id, status);

-- Create trigger for plan_executions
CREATE TRIGGER update_plan_executions_updated_at 
    BEFORE UPDATE ON plan_executions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for plan_executions
ALTER TABLE plan_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for plan_executions
CREATE POLICY "Allow all operations on plan_executions" ON plan_executions
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample plans for demonstration
INSERT INTO plans (
    title, 
    description, 
    objective, 
    context, 
    plan_structure, 
    metadata, 
    plan_source,
    generated_at
) VALUES
(
    'Mobile App Development Strategy',
    'Comprehensive plan for developing a mobile fitness tracking application with social features',
    'Launch a successful mobile app that helps users track fitness goals and connect with others',
    '{
        "keywords": ["mobile", "app", "fitness", "social", "tracking"],
        "enterprise_data_sources": ["internal_wiki", "tech_standards"],
        "user_input": "I want to create a mobile app for tracking fitness goals with social features"
    }'::jsonb,
    '[
        {
            "id": "research_phase",
            "title": "Market Research and Planning",
            "description": "Research target audience, competitors, and technical requirements",
            "type": "goal",
            "priority": "high",
            "status": "pending",
            "timeline": {
                "estimated_duration": "2 weeks"
            },
            "metadata": {
                "effort_level": 3,
                "complexity": 2,
                "risk_level": 1,
                "resources_required": ["product_manager", "researcher"],
                "skills_required": ["market_research", "user_analysis"],
                "tags": ["research", "planning"]
            },
            "children": [
                {
                    "id": "competitor_analysis",
                    "title": "Competitor Analysis",
                    "description": "Analyze existing fitness apps and identify opportunities",
                    "type": "task",
                    "priority": "high",
                    "status": "pending",
                    "timeline": {
                        "estimated_duration": "1 week"
                    },
                    "metadata": {
                        "effort_level": 2,
                        "complexity": 2,
                        "risk_level": 1,
                        "resources_required": ["researcher"],
                        "skills_required": ["competitive_analysis"],
                        "tags": ["analysis"]
                    }
                }
            ]
        },
        {
            "id": "development_phase",
            "title": "App Development",
            "description": "Design and implement the mobile application",
            "type": "goal",
            "priority": "critical",
            "status": "pending",
            "timeline": {
                "estimated_duration": "8 weeks",
                "dependencies": ["research_phase"]
            },
            "metadata": {
                "effort_level": 5,
                "complexity": 4,
                "risk_level": 3,
                "resources_required": ["mobile_developer", "ui_designer", "backend_developer"],
                "skills_required": ["React Native", "Node.js", "UI/UX Design"],
                "tags": ["development", "critical_path"]
            }
        }
    ]'::jsonb,
    '{
        "total_estimated_duration": "10 weeks",
        "complexity_score": 7,
        "confidence_score": 8,
        "risk_assessment": "Medium risk due to technical complexity and market competition",
        "success_metrics": [
            "App launched on both iOS and Android",
            "1000+ active users within first month",
            "4.0+ star rating in app stores",
            "Social features engagement >50%"
        ]
    }'::jsonb,
    'openai',
    NOW()
),
(
    'Enterprise Automation Implementation',
    'Plan to implement workflow automation across business units',
    'Reduce manual processes by 60% and improve operational efficiency',
    '{
        "keywords": ["automation", "workflow", "efficiency", "enterprise"],
        "enterprise_data_sources": ["internal_wiki", "process_docs"],
        "user_input": "We need to automate our business processes to improve efficiency"
    }'::jsonb,
    '[
        {
            "id": "process_audit",
            "title": "Current Process Audit",
            "description": "Assess existing workflows and identify automation opportunities",
            "type": "goal",
            "priority": "high",
            "status": "pending",
            "timeline": {
                "estimated_duration": "3 weeks"
            },
            "metadata": {
                "effort_level": 4,
                "complexity": 3,
                "risk_level": 2,
                "resources_required": ["process_analyst", "department_leads"],
                "skills_required": ["process_mapping", "workflow_analysis"],
                "tags": ["audit", "analysis"]
            }
        },
        {
            "id": "automation_implementation",
            "title": "Automation Tool Implementation",
            "description": "Deploy and configure automation solutions",
            "type": "goal",
            "priority": "critical",
            "status": "pending",
            "timeline": {
                "estimated_duration": "6 weeks",
                "dependencies": ["process_audit"]
            },
            "metadata": {
                "effort_level": 5,
                "complexity": 4,
                "risk_level": 3,
                "resources_required": ["automation_engineer", "system_administrator"],
                "skills_required": ["RPA", "system_integration", "change_management"],
                "tags": ["implementation", "automation"]
            }
        }
    ]'::jsonb,
    '{
        "total_estimated_duration": "12 weeks",
        "complexity_score": 8,
        "confidence_score": 7,
        "risk_assessment": "Medium-high risk due to change management challenges",
        "success_metrics": [
            "60% reduction in manual process time",
            "90% automation accuracy rate",
            "Employee satisfaction score >7/10",
            "ROI positive within 6 months"
        ]
    }'::jsonb,
    'openai',
    NOW()
);

-- Insert some sample plan executions
INSERT INTO plan_executions (plan_id, node_id, status, progress_percentage, assigned_to) 
SELECT 
    id,
    'research_phase',
    'in_progress',
    25.0,
    'john.doe@company.com'
FROM plans 
WHERE title = 'Mobile App Development Strategy'
LIMIT 1;

INSERT INTO plan_executions (plan_id, node_id, status, progress_percentage, assigned_to) 
SELECT 
    id,
    'competitor_analysis',
    'completed',
    100.0,
    'jane.smith@company.com'
FROM plans 
WHERE title = 'Mobile App Development Strategy'
LIMIT 1;

-- Add comments to document the table structures
COMMENT ON TABLE plans IS 'Stores AI-generated strategic plans with hierarchical structure';
COMMENT ON COLUMN plans.title IS 'Descriptive title of the plan';
COMMENT ON COLUMN plans.description IS 'Brief overview of what the plan accomplishes';
COMMENT ON COLUMN plans.objective IS 'Primary goal or outcome the plan aims to achieve';
COMMENT ON COLUMN plans.context IS 'JSONB object containing keywords, enterprise data sources, and original user input';
COMMENT ON COLUMN plans.plan_structure IS 'JSONB array containing hierarchical plan nodes with tasks, timelines, and metadata';
COMMENT ON COLUMN plans.metadata IS 'JSONB object containing plan-level metadata like complexity, confidence, and success metrics';
COMMENT ON COLUMN plans.plan_source IS 'Source of plan generation: openai, fallback, or manual';

COMMENT ON TABLE plan_executions IS 'Tracks execution progress of individual plan nodes';
COMMENT ON COLUMN plan_executions.node_id IS 'References the id field within the plan_structure JSONB';
COMMENT ON COLUMN plan_executions.progress_percentage IS 'Completion percentage (0.00 to 100.00)';
COMMENT ON COLUMN plan_executions.actual_duration IS 'Time actually spent on this task/node';