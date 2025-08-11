-- Create career-specific tables for the AI career roadmap application
-- Migration: 20240107000000_create_career_tables.sql

-- Create user_profiles table for storing onboarding information
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Basic Information
    education TEXT NOT NULL CHECK (education IN ('highschool', 'college', 'bachelor', 'master', 'other')),
    school TEXT,
    major TEXT NOT NULL,
    -- Skills and Experience
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications TEXT,
    experience TEXT NOT NULL,
    -- Goal
    goal TEXT NOT NULL,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create career_maps table for storing generated career roadmaps
CREATE TABLE career_maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Foreign key to user profile
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    -- Basic Information
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    -- Certification Information (JSON structure matching frontend)
    certification_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Roadmap Steps (JSON array of steps with positions for ReactFlow)
    roadmap_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Reviews (JSON array of user reviews)
    reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- AI Generation Metadata
    ai_source TEXT NOT NULL DEFAULT 'openai' CHECK (ai_source IN ('openai', 'fallback', 'manual')),
    generation_prompt TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create career_modifications table for tracking chat-based modifications
CREATE TABLE career_modifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    career_map_id UUID NOT NULL REFERENCES career_maps(id) ON DELETE CASCADE,
    modification_request TEXT NOT NULL,
    previous_version JSONB NOT NULL,
    new_version JSONB NOT NULL,
    ai_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_education ON user_profiles(education);
CREATE INDEX idx_user_profiles_major ON user_profiles(major);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- GIN index for skills JSON array
CREATE INDEX idx_user_profiles_skills ON user_profiles USING GIN (skills);

CREATE INDEX idx_career_maps_user_profile_id ON career_maps(user_profile_id);
CREATE INDEX idx_career_maps_target_role ON career_maps(target_role);
CREATE INDEX idx_career_maps_created_at ON career_maps(created_at DESC);

-- GIN indexes for JSON fields
CREATE INDEX idx_career_maps_certification_info ON career_maps USING GIN (certification_info);
CREATE INDEX idx_career_maps_roadmap_steps ON career_maps USING GIN (roadmap_steps);
CREATE INDEX idx_career_maps_reviews ON career_maps USING GIN (reviews);

CREATE INDEX idx_career_modifications_career_map_id ON career_modifications(career_map_id);
CREATE INDEX idx_career_modifications_created_at ON career_modifications(created_at DESC);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_maps_updated_at 
    BEFORE UPDATE ON career_maps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_modifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - adjust based on auth requirements)
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on career_maps" ON career_maps
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on career_modifications" ON career_modifications
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO user_profiles (education, school, major, skills, certifications, experience, goal) VALUES
(
    'college',
    '서울대학교',
    '컴퓨터공학과',
    '["python", "javascript", "react", "sql"]'::jsonb,
    '정보처리기사',
    '웹 개발 프로젝트를 2개 완성했고, 파이썬으로 데이터 분석 경험이 있습니다. 알고리즘 문제 해결에 관심이 많고 백엔드 개발을 배우고 있습니다.',
    '최종적으로 IT 기업에서 백엔드 개발자가 되는 게 목표입니다. 대규모 서비스의 서버 아키텍처를 설계하고 성능 최적화하는 일을 하고 싶어요.'
),
(
    'bachelor',
    '연세대학교',
    '경영학과',
    '["git", "sql", "python"]'::jsonb,
    null,
    '대학교에서 경영학을 전공했지만 프로그래밍에 흥미를 느껴 독학으로 파이썬과 SQL을 배웠습니다. 간단한 데이터 분석 프로젝트를 몇 개 해봤습니다.',
    '나는 최종적으로 IT 기업에서 데이터 사이언티스트가 되는 게 목표야. 비즈니스 데이터를 분석해서 의사결정을 지원하는 일을 하고 싶어.'
);

-- Add comments to document the table structures
COMMENT ON TABLE user_profiles IS 'Stores user onboarding information including education, skills, and career goals';
COMMENT ON COLUMN user_profiles.skills IS 'JSONB array of skill strings from SKILL_OPTIONS in frontend';
COMMENT ON COLUMN user_profiles.experience IS 'User-provided work experience text (max 500 chars)';
COMMENT ON COLUMN user_profiles.goal IS 'User career goal text (max 1000 chars)';

COMMENT ON TABLE career_maps IS 'Stores AI-generated career roadmaps with ReactFlow-compatible structure';
COMMENT ON COLUMN career_maps.certification_info IS 'JSONB object matching frontend CertificationInfo interface';
COMMENT ON COLUMN career_maps.roadmap_steps IS 'JSONB array matching frontend RoadmapStep interface with x,y positions';
COMMENT ON COLUMN career_maps.reviews IS 'JSONB array matching frontend Review interface';

COMMENT ON TABLE career_modifications IS 'Tracks chat-based modifications to career maps';
COMMENT ON COLUMN career_modifications.modification_request IS 'User chat input requesting changes';
COMMENT ON COLUMN career_modifications.previous_version IS 'Career map state before modification';
COMMENT ON COLUMN career_modifications.new_version IS 'Career map state after modification';