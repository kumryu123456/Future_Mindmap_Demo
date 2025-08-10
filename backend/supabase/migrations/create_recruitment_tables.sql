-- 채용 정보 관련 테이블들 생성

-- 1. 회사 정보 테이블
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    size VARCHAR(20) CHECK (size IN ('startup', 'mid', 'large', 'unicorn')),
    industry VARCHAR(100),
    location VARCHAR(200),
    website VARCHAR(500),
    description TEXT,
    employee_count INTEGER,
    founded_year INTEGER,
    culture_keywords TEXT[], -- 회사 문화 키워드 배열
    tech_stack TEXT[], -- 주요 기술 스택
    benefits TEXT[], -- 복리후생
    rating DECIMAL(2,1), -- 기업 평점 (1.0-5.0)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기술 스킬 테이블
CREATE TABLE tech_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) CHECK (category IN ('language', 'framework', 'database', 'cloud', 'tool', 'methodology')),
    demand_score INTEGER CHECK (demand_score >= 1 AND demand_score <= 100), -- 시장 수요도
    salary_impact DECIMAL(3,1) CHECK (salary_impact >= 0.0 AND salary_impact <= 10.0), -- 연봉 영향도
    learning_difficulty INTEGER CHECK (learning_difficulty >= 1 AND learning_difficulty <= 10), -- 학습 난이도
    trend VARCHAR(20) CHECK (trend IN ('rising', 'stable', 'declining')),
    related_skills TEXT[], -- 연관 기술들
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 채용 공고 테이블
CREATE TABLE job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    
    -- 지역 및 근무 조건
    location VARCHAR(200),
    work_type VARCHAR(20) CHECK (work_type IN ('remote', 'hybrid', 'office')),
    
    -- 경력 및 학력 요구사항
    experience_min INTEGER, -- 최소 경력 (년)
    experience_max INTEGER, -- 최대 경력 (년)
    education_level VARCHAR(50),
    
    -- 연봉 정보
    salary_min INTEGER, -- 최소 연봉 (만원)
    salary_max INTEGER, -- 최대 연봉 (만원)
    salary_type VARCHAR(20) CHECK (salary_type IN ('annual', 'monthly', 'negotiable')),
    
    -- 채용 정보
    employment_type VARCHAR(30) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    team_size INTEGER,
    
    -- 메타 정보
    source VARCHAR(50), -- 채용 사이트 출처
    external_id VARCHAR(100), -- 외부 사이트의 공고 ID
    external_url VARCHAR(500), -- 원본 공고 URL
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- 날짜 정보
    posted_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 채용 공고 - 기술 스킬 연결 테이블 (다대다 관계)
CREATE TABLE job_posting_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    tech_skill_id UUID REFERENCES tech_skills(id) ON DELETE CASCADE,
    requirement_level VARCHAR(20) CHECK (requirement_level IN ('required', 'preferred', 'plus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(job_posting_id, tech_skill_id)
);

-- 5. 연봉 분석 데이터 테이블
CREATE TABLE salary_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(100) NOT NULL, -- 직무명
    experience_level VARCHAR(50), -- 경력 수준
    location VARCHAR(100),
    
    -- 연봉 통계
    avg_salary INTEGER, -- 평균 연봉
    percentile_25 INTEGER, -- 25분위 연봉
    percentile_50 INTEGER, -- 중간값 연봉  
    percentile_75 INTEGER, -- 75분위 연봉
    min_salary INTEGER, -- 최소 연봉
    max_salary INTEGER, -- 최대 연봉
    
    -- 분석 메타데이터
    sample_size INTEGER, -- 분석 대상 공고 수
    analysis_period_start DATE,
    analysis_period_end DATE,
    growth_rate DECIMAL(5,2), -- 전년 대비 성장률 (%)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role, experience_level, location, analysis_period_end)
);

-- 6. 기술 트렌드 분석 테이블
CREATE TABLE tech_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tech_skill_id UUID REFERENCES tech_skills(id) ON DELETE CASCADE,
    
    -- 트렌드 데이터
    job_postings_count INTEGER, -- 해당 기술을 요구하는 공고 수
    monthly_growth_rate DECIMAL(5,2), -- 월간 성장률
    yearly_growth_rate DECIMAL(5,2), -- 연간 성장률
    
    -- 메타데이터
    analysis_month DATE, -- 분석 월 (YYYY-MM-01)
    region VARCHAR(50), -- 지역
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tech_skill_id, analysis_month, region)
);

-- 7. 사용자 커리어 추천 로그 테이블
CREATE TABLE career_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_input TEXT, -- 사용자가 입력한 내용
    recommended_skills TEXT[], -- 추천된 기술들
    recommended_roles TEXT[], -- 추천된 직무들
    match_score DECIMAL(3,2), -- 매칭 점수 (0.00-1.00)
    
    -- 추천 근거
    reasoning TEXT, -- 추천 이유
    market_data JSONB, -- 시장 데이터
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);

CREATE INDEX idx_tech_skills_name ON tech_skills(name);
CREATE INDEX idx_tech_skills_category ON tech_skills(category);
CREATE INDEX idx_tech_skills_demand ON tech_skills(demand_score DESC);

CREATE INDEX idx_job_postings_company ON job_postings(company_id);
CREATE INDEX idx_job_postings_location ON job_postings(location);
CREATE INDEX idx_job_postings_active ON job_postings(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_job_postings_posted_at ON job_postings(posted_at DESC);
CREATE INDEX idx_job_postings_salary ON job_postings(salary_min, salary_max);

CREATE INDEX idx_job_posting_skills_job ON job_posting_skills(job_posting_id);
CREATE INDEX idx_job_posting_skills_tech ON job_posting_skills(tech_skill_id);
CREATE INDEX idx_job_posting_skills_level ON job_posting_skills(requirement_level);

CREATE INDEX idx_salary_analysis_role ON salary_analysis(role);
CREATE INDEX idx_salary_analysis_period ON salary_analysis(analysis_period_end DESC);

CREATE INDEX idx_tech_trends_skill ON tech_trends(tech_skill_id);
CREATE INDEX idx_tech_trends_month ON tech_trends(analysis_month DESC);

-- 초기 기술 스킬 데이터 삽입 (프론트엔드 중심)
INSERT INTO tech_skills (name, category, demand_score, salary_impact, learning_difficulty, trend, related_skills) VALUES
-- 프로그래밍 언어
('JavaScript', 'language', 95, 7.5, 6, 'stable', ARRAY['TypeScript', 'React', 'Node.js', 'Vue']),
('TypeScript', 'language', 85, 8.2, 7, 'rising', ARRAY['JavaScript', 'React', 'Angular', 'Node.js']),
('Python', 'language', 90, 8.0, 5, 'stable', ARRAY['Django', 'Flask', 'FastAPI', 'Data Science']),
('Java', 'language', 85, 7.8, 7, 'stable', ARRAY['Spring', 'Kotlin', 'Android']),

-- 프론트엔드 프레임워크
('React', 'framework', 90, 8.5, 6, 'stable', ARRAY['JavaScript', 'TypeScript', 'Next.js', 'Redux']),
('Vue.js', 'framework', 75, 7.8, 5, 'stable', ARRAY['JavaScript', 'Nuxt.js', 'TypeScript']),
('Angular', 'framework', 70, 8.0, 8, 'stable', ARRAY['TypeScript', 'RxJS', 'NgRx']),
('Next.js', 'framework', 80, 8.8, 7, 'rising', ARRAY['React', 'TypeScript', 'Vercel']),
('Svelte', 'framework', 45, 7.5, 6, 'rising', ARRAY['JavaScript', 'SvelteKit']),

-- 백엔드 프레임워크
('Node.js', 'framework', 85, 8.2, 6, 'stable', ARRAY['JavaScript', 'Express', 'TypeScript']),
('Express', 'framework', 75, 7.5, 4, 'stable', ARRAY['Node.js', 'JavaScript']),
('Spring Boot', 'framework', 80, 8.5, 8, 'stable', ARRAY['Java', 'Spring', 'JPA']),
('Django', 'framework', 70, 8.0, 6, 'stable', ARRAY['Python', 'REST API']),
('FastAPI', 'framework', 60, 8.2, 5, 'rising', ARRAY['Python', 'async', 'REST API']),

-- 데이터베이스
('PostgreSQL', 'database', 80, 7.8, 6, 'stable', ARRAY['SQL', 'Database Design']),
('MySQL', 'database', 85, 7.5, 5, 'stable', ARRAY['SQL', 'Database Design']),
('MongoDB', 'database', 75, 7.8, 5, 'stable', ARRAY['NoSQL', 'Node.js']),
('Redis', 'database', 70, 7.5, 4, 'stable', ARRAY['Caching', 'Session Management']),

-- 클라우드 및 DevOps
('AWS', 'cloud', 85, 9.0, 8, 'rising', ARRAY['EC2', 'S3', 'Lambda', 'DevOps']),
('Docker', 'tool', 80, 8.5, 6, 'stable', ARRAY['Kubernetes', 'DevOps', 'Containerization']),
('Kubernetes', 'tool', 70, 9.2, 9, 'rising', ARRAY['Docker', 'DevOps', 'Orchestration']),
('GitHub Actions', 'tool', 75, 7.8, 5, 'rising', ARRAY['CI/CD', 'DevOps', 'Git']);

-- 초기 회사 데이터 (주요 IT 기업)
INSERT INTO companies (name, size, industry, location, tech_stack, culture_keywords, rating) VALUES
('네이버', 'large', 'IT서비스', '경기 분당구', ARRAY['Java', 'Spring', 'React', 'Node.js', 'Kubernetes'], ARRAY['수평적문화', '기술중심', '성장지향'], 4.2),
('카카오', 'large', 'IT서비스', '경기 판교', ARRAY['Java', 'Spring', 'React', 'Kotlin', 'AWS'], ARRAY['자율성', '창의성', '소통'], 4.0),
('쿠팡', 'large', '이커머스', '서울 송파구', ARRAY['Java', 'Python', 'React', 'AWS', 'Kubernetes'], ARRAY['고성과', '글로벌', '데이터중심'], 3.8),
('우아한형제들', 'mid', '배달서비스', '서울 송파구', ARRAY['Java', 'Spring Boot', 'React', 'Kotlin'], ARRAY['개발문화', '성장', '배움'], 4.3),
('당근마켓', 'mid', '중고거래', '서울 구로구', ARRAY['Ruby', 'React', 'TypeScript', 'Go'], ARRAY['투명성', '임팩트', '성장'], 4.5);

COMMENT ON TABLE companies IS '기업 정보 테이블';
COMMENT ON TABLE tech_skills IS '기술 스킬 마스터 테이블';
COMMENT ON TABLE job_postings IS '채용 공고 정보 테이블';
COMMENT ON TABLE job_posting_skills IS '채용공고-기술스킬 연결 테이블';
COMMENT ON TABLE salary_analysis IS '연봉 분석 데이터 테이블';
COMMENT ON TABLE tech_trends IS '기술 트렌드 분석 테이블';
COMMENT ON TABLE career_recommendations IS '커리어 추천 로그 테이블';