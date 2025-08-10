# Future Mindmap Backend Demo

A Supabase Edge Functions backend for a mindmapping application built with Deno and TypeScript.

## Features

- **Edge Functions**: Serverless functions powered by Deno
- **Database**: PostgreSQL with Supabase
- **Real-time**: Built-in real-time subscriptions
- **Authentication**: Supabase Auth (ready to configure)
- **RESTful API**: CRUD operations for mindmap nodes
- **Korean NLP Processing**: 한국어 형태소 분석 및 키워드 추출 (Korean morphological analysis and keyword extraction)
- **Multi-language Support**: 한국어/영어 자동 감지 및 처리 (Korean/English auto-detection and processing)
- **Enterprise Data Integration**: Fetch and normalize enterprise data based on keywords
- **AI Plan Generation**: OpenAI-powered strategic plan generation with fallback mechanisms
- **Auto-Expansion**: pgvector similarity search with LLM-powered child node generation
- **RAG Detail Enhancement**: Retrieval Augmented Generation for enriching node content
- **Session Management**: Persistent user session state with automatic cleanup

## Project Structure

```
Future_Mindmap_BackEnd_Demo/
├── supabase/
│   ├── functions/
│   │   ├── hello-world/          # Sample function
│   │   ├── mindmap-api/          # Main API endpoints
│   │   ├── parse-input/          # NLP text processing
│   │   ├── fetch-enterprise-data/ # Enterprise data integration
│   │   ├── generate-plan/        # AI-powered plan generation
│   │   ├── auto-expand/          # Intelligent node expansion
│   │   ├── rag-detail/           # RAG-powered content enrichment
│   │   ├── save-session/         # Session state management
│   │   ├── load-session/         # Session state retrieval
│   │   └── _shared/              # Shared utilities
│   ├── migrations/               # Database migrations
│   └── config.toml              # Supabase configuration
├── package.json                 # Project metadata
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Setup

1. **Install Supabase CLI**:
   ```bash
   npm install -g @supabase/cli
   ```

2. **Clone and setup**:
   ```bash
   cd Future_Mindmap_BackEnd_Demo
   cp .env.example .env
   ```

3. **Start Supabase locally**:
   ```bash
   supabase start
   ```

4. **Run migrations**:
   ```bash
   supabase db reset
   ```

**Note**: The auto-expand function requires the pgvector extension for similarity search. This is automatically enabled in the migrations, but ensure your Supabase instance supports pgvector (available in Supabase Cloud and recent local versions).

## API Endpoints

### Mindmap API (`/mindmap-api`)

- **GET** `/functions/v1/mindmap-api` - Get all mindmap nodes
- **POST** `/functions/v1/mindmap-api` - Create a new node
- **PUT** `/functions/v1/mindmap-api/:id` - Update a node
- **DELETE** `/functions/v1/mindmap-api/:id` - Delete a node

### Parse Input API (`/parse-input`) - 한국어 형태소 분석

- **POST** `/functions/v1/parse-input` - 한국어/영어 텍스트에서 키워드 추출 (Korean/English NLP)
- **GET** `/functions/v1/parse-input` - 처리된 사용자 입력 조회

### Enterprise Data API (`/fetch-enterprise-data`)

- **POST** `/functions/v1/fetch-enterprise-data` - Fetch and normalize enterprise data based on keywords
- **GET** `/functions/v1/fetch-enterprise-data` - Get cached enterprise data

### Plan Generation API (`/generate-plan`)

- **POST** `/functions/v1/generate-plan` - Generate strategic plans using OpenAI based on user input
- **GET** `/functions/v1/generate-plan` - Get saved plans

### Auto-Expand API (`/auto-expand`)

- **POST** `/functions/v1/auto-expand` - Auto-expand mindmap nodes using vector similarity and LLM
- **GET** `/functions/v1/auto-expand` - Get expansion history

### RAG Detail API (`/rag-detail`)

- **POST** `/functions/v1/rag-detail` - Enrich node content using RAG with vector similarity search
- **GET** `/functions/v1/rag-detail` - Get cached enriched content

### Session Management API (`/save-session`)

- **POST** `/functions/v1/save-session` - Save or update user session state
- **GET** `/functions/v1/save-session` - Retrieve user sessions
- **DELETE** `/functions/v1/save-session` - Delete sessions or cleanup expired sessions

### Load Session API (`/load-session`)

- **POST** `/functions/v1/load-session` - Load session by ID with validation and metrics
- **GET** `/functions/v1/load-session` - Load session via query parameters

### Request/Response Examples

**Create a node (POST)**:
```json
{
  "title": "New Idea",
  "content": "Description of the new idea",
  "x": 100,
  "y": 50,
  "parent_id": "uuid-of-parent-node" // optional
}
```

**Update a node (PUT)**:
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "x": 150,
  "y": 75
}
```

**한국어 텍스트 처리 (Korean Text Processing)**:
```json
{
  "rawText": "우리 회사는 인공지능 기술을 활용한 스마트 홈 시스템을 개발하고 있습니다."
}
```

**한국어 형태소 분석 결과 (Korean Analysis Response)**:
```json
{
  "data": {
    "id": "uuid",
    "raw_text": "우리 회사는 인공지능 기술을 활용한 스마트 홈 시스템을 개발하고 있습니다.",
    "keywords": {
      "nouns": ["우리", "회사", "인공지능", "기술", "스마트", "시스템"],
      "verbs": ["있습니다"],
      "adjectives": ["있습다"],
      "particles": ["는", "을", "은"],
      "entities": ["우리"],
      "topics": ["기술", "시스템", "인공지능", "스마트"],
      "sentiment": "neutral",
      "language": "korean"
    },
    "processed_at": "2025-08-08T16:21:16.640Z"
  },
  "success": true
}
```

**영어 텍스트 처리 (English Text Processing)**:
```json
{
  "rawText": "I want to develop mobile app for fitness tracking"
}
```

**영어 분석 결과 (English Analysis Response)**:
```json
{
  "data": {
    "id": "uuid", 
    "raw_text": "I want to develop mobile app for fitness tracking",
    "keywords": {
      "nouns": ["want", "develop", "mobile", "app", "fitness", "tracking"],
      "verbs": [],
      "adjectives": [],
      "particles": [],
      "entities": [],
      "topics": ["want", "develop", "mobile", "app", "fitness", "tracking"],
      "sentiment": "neutral",
      "language": "english"
    },
    "processed_at": "2025-08-08T16:20:44.415Z"
  },
  "success": true
}
```

**Fetch enterprise data (POST to fetch-enterprise-data)**:
```json
{
  "keywords": ["productivity", "automation", "tools"],
  "sources": ["internal_wiki", "knowledge_base"],
  "useCache": true
}
```

**Response from fetch-enterprise-data**:
```json
{
  "data": {
    "id": "uuid",
    "keyword_query": "productivity, automation, tools",
    "source": "internal_wiki,knowledge_base",
    "data": [
      {
        "id": "prod_001",
        "title": "Enterprise Automation Strategy",
        "description": "Comprehensive automation roadmap",
        "category": "strategy",
        "source": "internal_wiki",
        "relevance_score": 0.95,
        "keywords": ["automation", "productivity", "strategy"],
        "metadata": {"department": "Strategy", "priority": "high"},
        "url": "/wiki/automation-strategy"
      }
    ],
    "relevance_score": 0.925,
    "fetched_at": "2024-01-01T12:00:00Z",
    "cached_until": "2024-01-02T12:00:00Z"
  },
  "cached": false,
  "results_count": 15,
  "success": true
}
```

**Generate a plan (POST to generate-plan)**:
```json
{
  "userInput": "I want to launch a SaaS product for project management with AI features",
  "keywords": ["saas", "project management", "ai", "launch"],
  "enterpriseData": [
    {
      "title": "SaaS Development Best Practices",
      "description": "Enterprise guidelines for SaaS development",
      "source": "tech_standards",
      "relevance_score": 0.9
    }
  ],
  "useOpenAI": true
}
```

**Response from generate-plan**:
```json
{
  "data": {
    "id": "uuid",
    "title": "SaaS Product Launch Strategy",
    "description": "Comprehensive plan for launching a project management SaaS with AI features",
    "objective": "Successfully launch and scale a competitive SaaS product",
    "context": {
      "keywords": ["saas", "project management", "ai", "launch"],
      "enterprise_data_sources": ["tech_standards"],
      "user_input": "I want to launch a SaaS product..."
    },
    "plan_structure": [
      {
        "id": "market_research",
        "title": "Market Research & Validation",
        "description": "Research target market and validate product concept",
        "type": "goal",
        "priority": "high",
        "status": "pending",
        "timeline": {
          "estimated_duration": "4 weeks"
        },
        "metadata": {
          "effort_level": 4,
          "complexity": 3,
          "risk_level": 2,
          "resources_required": ["product_manager", "researcher"],
          "skills_required": ["market_research", "competitor_analysis"],
          "tags": ["research", "validation"]
        },
        "children": [...]
      }
    ],
    "metadata": {
      "total_estimated_duration": "24 weeks",
      "complexity_score": 8,
      "confidence_score": 7,
      "risk_assessment": "Medium-high risk due to competitive market",
      "success_metrics": ["Product launched", "100 paying customers", "Product-market fit"]
    },
    "generated_at": "2024-01-01T12:00:00Z"
  },
  "plan_source": "openai",
  "success": true
}
```

**Auto-expand a node (POST to auto-expand)**:
```json
{
  "parentNodeId": "uuid-of-parent-node",
  "parentNodeType": "mindmap_node",
  "maxChildren": 4,
  "similarityThreshold": 0.7,
  "expansionStyle": "comprehensive",
  "useLLM": true
}
```

**Response from auto-expand**:
```json
{
  "data": {
    "parent_node": {
      "id": "uuid",
      "title": "Project Management",
      "content": "Comprehensive project management approach",
      "x": 0,
      "y": 0,
      "type": "mindmap_node"
    },
    "similar_content": [
      {
        "id": "similar_1",
        "content_type": "enterprise_data",
        "content_text": "Agile project management methodologies",
        "similarity_score": 0.89,
        "metadata": {"source": "internal_wiki"}
      }
    ],
    "generated_children": [
      {
        "title": "Sprint Planning",
        "content": "Iterative planning process for project milestones and deliverables",
        "reasoning": "Essential component of agile project management methodology",
        "x": -120,
        "y": -100,
        "priority": 5,
        "confidence": 0.95
      },
      {
        "title": "Resource Allocation",
        "content": "Strategic assignment of team members and resources to project tasks",
        "reasoning": "Critical for project success and timeline management",
        "x": 120,
        "y": -100,
        "priority": 4,
        "confidence": 0.88
      }
    ],
    "expansion_context": {
      "expansion_style": "comprehensive",
      "generation_method": "llm",
      "similar_content_count": 3
    },
    "created_mindmap_nodes": [
      {
        "id": "new_node_1",
        "title": "Sprint Planning",
        "content": "Iterative planning process...",
        "x": -120,
        "y": -100,
        "parent_id": "uuid-of-parent-node"
      }
    ],
    "expansion_id": "expansion_uuid"
  },
  "success": true
}
```

**Enrich node content (POST to rag-detail)**:
```json
{
  "nodeId": "uuid-of-node",
  "nodeType": "mindmap_node",
  "enrichmentType": "comprehensive",
  "maxRelevantSources": 10,
  "similarityThreshold": 0.6,
  "includeExamples": true,
  "includeBestPractices": true,
  "includeRisks": true,
  "useLLM": true
}
```

**Response from rag-detail**:
```json
{
  "data": {
    "original_node": {
      "id": "uuid",
      "title": "Machine Learning Implementation",
      "content": "Implementing ML solutions in enterprise environments"
    },
    "enriched_content": {
      "detailed_description": "Machine Learning implementation in enterprise environments involves a comprehensive approach that encompasses data preparation, model selection, training infrastructure, and deployment strategies. This process requires careful consideration of scalability, security, and integration with existing systems...",
      "key_concepts": [
        "Data pipeline architecture",
        "Model lifecycle management", 
        "Production deployment",
        "Monitoring and observability",
        "Ethical AI considerations"
      ],
      "implementation_steps": [
        "Assess data quality and availability",
        "Define clear business objectives and success metrics",
        "Design scalable data processing pipeline",
        "Select appropriate ML algorithms and frameworks",
        "Implement model training and validation processes",
        "Deploy models with proper monitoring",
        "Establish continuous improvement workflows"
      ],
      "best_practices": [
        "Start with simple baseline models before complex solutions",
        "Implement comprehensive data validation and monitoring",
        "Use version control for both data and models",
        "Establish clear model governance and approval processes"
      ],
      "potential_risks": [
        "Data drift affecting model performance over time",
        "Bias in training data leading to unfair outcomes",
        "Security vulnerabilities in model endpoints",
        "Compliance issues with data privacy regulations"
      ],
      "examples": [
        "Fraud detection system with real-time scoring",
        "Recommendation engine for e-commerce platforms",
        "Predictive maintenance for manufacturing equipment"
      ],
      "related_resources": [
        "MLOps platform documentation and tutorials",
        "Industry-specific ML implementation case studies",
        "Data science team training and certification programs"
      ]
    },
    "relevant_sources": [
      {
        "content_type": "enterprise_data",
        "content_text": "ML deployment best practices from internal wiki",
        "similarity_score": 0.87
      }
    ],
    "enrichment_context": {
      "enrichment_type": "comprehensive",
      "sources_used": 5,
      "confidence_score": 0.85,
      "generation_method": "llm"
    },
    "cached_until": "2024-01-02T12:00:00Z",
    "enrichment_id": "enrichment_uuid"
  },
  "success": true
}
```

**Save session state (POST to save-session)**:
```json
{
  "sessionId": "user_session_001",
  "userId": "user_uuid_123",
  "sessionName": "Mobile App Planning",
  "sessionData": {
    "mindmap_nodes": [
      {
        "id": "node_1",
        "title": "Mobile App",
        "content": "Planning a fitness tracking application",
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
        "parent_id": "node_1"
      }
    ],
    "connections": [
      {
        "from": "node_1",
        "to": "node_2",
        "type": "hierarchical"
      }
    ],
    "user_inputs": ["mobile app", "fitness tracking"],
    "current_plan_id": "plan_uuid_456",
    "last_expansion": {
      "parent_node": "node_1",
      "expansion_type": "comprehensive",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  },
  "viewportState": {
    "zoom": 1.2,
    "center_x": -50,
    "center_y": -25,
    "viewport_width": 1920,
    "viewport_height": 1080
  },
  "uiPreferences": {
    "theme": "dark",
    "auto_save": true,
    "show_grid": false,
    "node_style": "minimal",
    "sidebar_collapsed": true
  },
  "expiresInDays": 45
}
```

**Response from save-session**:
```json
{
  "data": {
    "id": "session_db_uuid",
    "session_id": "user_session_001",
    "user_id": "user_uuid_123", 
    "session_name": "Mobile App Planning",
    "session_data": {
      "mindmap_nodes": [...],
      "connections": [...],
      "user_inputs": ["mobile app", "fitness tracking"],
      "current_plan_id": "plan_uuid_456"
    },
    "viewport_state": {
      "zoom": 1.2,
      "center_x": -50,
      "center_y": -25
    },
    "ui_preferences": {
      "theme": "dark",
      "auto_save": true,
      "show_grid": false
    },
    "last_activity": "2024-01-01T12:00:00Z",
    "expires_at": "2024-02-15T12:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "success": true
}
```

**Load session state (POST to load-session)**:
```json
{
  "sessionId": "user_session_001",
  "updateActivity": true,
  "validateNodes": true,
  "includeRelated": true
}
```

**Response from load-session**:
```json
{
  "data": {
    "session": {
      "id": "session_db_uuid",
      "session_id": "user_session_001",
      "user_id": "user_uuid_123",
      "session_name": "Mobile App Planning",
      "session_data": {
        "mindmap_nodes": [
          {
            "id": "node_1",
            "title": "Mobile App",
            "content": "Planning a fitness tracking application",
            "x": 0,
            "y": 0,
            "selected": true
          }
        ],
        "connections": [
          {
            "from": "node_1",
            "to": "node_2", 
            "type": "hierarchical"
          }
        ],
        "user_inputs": ["mobile app", "fitness tracking"],
        "current_plan_id": "plan_uuid_456"
      },
      "viewport_state": {
        "zoom": 1.2,
        "center_x": -50,
        "center_y": -25
      },
      "ui_preferences": {
        "theme": "dark",
        "auto_save": true
      },
      "last_activity": "2024-01-01T12:30:00Z",
      "expires_at": "2024-02-15T12:00:00Z",
      "is_active": true
    },
    "metrics": {
      "nodes_count": 5,
      "connections_count": 4,
      "user_inputs_count": 2,
      "session_age_days": 15,
      "last_activity_hours_ago": 2,
      "is_expired": false,
      "has_plan": true,
      "enriched_nodes_count": 1
    },
    "validation_results": {
      "missing_nodes": [],
      "orphaned_connections": [],
      "invalid_references": []
    },
    "related_data": {
      "current_plan": {
        "id": "plan_uuid_456",
        "title": "Mobile Fitness App Strategy",
        "description": "Comprehensive development plan"
      },
      "enriched_content": [
        {
          "node_id": "node_1",
          "enriched_content": {
            "detailed_description": "Enhanced content...",
            "key_concepts": ["mobile development", "fitness tracking"]
          }
        }
      ],
      "recent_expansions": [
        {
          "parent_node_id": "node_1",
          "expansion_context": {"expansion_type": "comprehensive"},
          "generated_children": [...]
        }
      ]
    }
  },
  "success": true,
  "message": "Session loaded successfully"
}
```

## Database Schema

### mindmap_nodes table
- `id`: UUID (Primary Key)
- `title`: TEXT (Node title)
- `content`: TEXT (Node description)
- `x`: FLOAT (X coordinate)
- `y`: FLOAT (Y coordinate)
- `parent_id`: UUID (Reference to parent node)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### user_inputs table
- `id`: UUID (Primary Key)
- `raw_text`: TEXT (Original user input)
- `keywords`: JSONB (Extracted keywords and analysis)
- `processed_at`: TIMESTAMP (When NLP processing occurred)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### enterprise_data table
- `id`: UUID (Primary Key)
- `keyword_query`: TEXT (Keywords used for fetching)
- `source`: TEXT (Data sources used)
- `data`: JSONB (Normalized enterprise data array)
- `relevance_score`: FLOAT (Overall relevance score)
- `fetched_at`: TIMESTAMP (When data was fetched)
- `cached_until`: TIMESTAMP (Cache expiration time)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### data_sources table
- `id`: UUID (Primary Key)
- `name`: TEXT (Data source identifier)
- `description`: TEXT (Source description)
- `base_url`: TEXT (API base URL)
- `api_key_required`: BOOLEAN (Whether API key is needed)
- `headers`: JSONB (Required HTTP headers)
- `rate_limit_per_hour`: INTEGER (API rate limit)
- `is_active`: BOOLEAN (Source availability)
- `last_accessed`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### plans table
- `id`: UUID (Primary Key)
- `title`: TEXT (Plan title)
- `description`: TEXT (Plan description)
- `objective`: TEXT (Primary goal)
- `context`: JSONB (Keywords, data sources, user input)
- `plan_structure`: JSONB (Hierarchical plan nodes)
- `metadata`: JSONB (Complexity, confidence, success metrics)
- `plan_source`: TEXT (Generation source: openai/fallback)
- `generated_at`: TIMESTAMP (When plan was generated)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### plan_executions table
- `id`: UUID (Primary Key)
- `plan_id`: UUID (Reference to plans table)
- `node_id`: TEXT (Reference to plan_structure node)
- `status`: TEXT (pending/in_progress/completed/blocked)
- `progress_percentage`: DECIMAL (0.00 to 100.00)
- `notes`: TEXT (Execution notes)
- `started_at`: TIMESTAMP
- `completed_at`: TIMESTAMP
- `estimated_completion`: TIMESTAMP
- `actual_duration`: INTERVAL
- `assigned_to`: TEXT (Person/team assigned)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### embeddings table
- `id`: UUID (Primary Key)
- `content_type`: TEXT (mindmap_node/user_input/enterprise_data/plan_node)
- `content_id`: UUID (Reference to actual content)
- `content_text`: TEXT (Text content for embedding)
- `embedding`: vector(1536) (OpenAI ada-002 embedding)
- `metadata`: JSONB (Additional context)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### node_expansions table
- `id`: UUID (Primary Key)
- `parent_node_id`: UUID (Node being expanded)
- `parent_node_type`: TEXT (Type of parent node)
- `expansion_context`: JSONB (Context and parameters)
- `similar_content`: JSONB (Found similar content)
- `generated_children`: JSONB (Generated child node suggestions)
- `expansion_method`: TEXT (llm_generation/fallback)
- `similarity_threshold`: DECIMAL (Similarity cutoff used)
- `max_children`: INTEGER (Maximum children generated)
- `llm_model`: TEXT (Model used for generation)
- `generation_prompt`: TEXT (Prompt used)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### user_sessions table
- `id`: UUID (Primary Key)
- `session_id`: TEXT (Unique session identifier)
- `user_id`: UUID (Reference to authenticated user, nullable)
- `session_name`: TEXT (Human-readable session name)
- `session_data`: JSONB (Mindmap nodes, connections, application state)
- `viewport_state`: JSONB (Zoom, pan, viewport configuration)
- `ui_preferences`: JSONB (Theme, layout, UI settings)
- `last_activity`: TIMESTAMP (Last session interaction)
- `expires_at`: TIMESTAMP (Session expiration time)
- `is_active`: BOOLEAN (Whether session is active)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Development

### Local Development
```bash
# Start Supabase services
supabase start

# Serve functions locally
supabase functions serve

# Deploy functions
supabase functions deploy
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Anon key for client-side access
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side access
- `OPENAI_API_KEY`: OpenAI API key for plan generation (required for generate-plan function)

## Testing

Test the API endpoints using curl or your favorite HTTP client:

```bash
# Get all nodes
curl http://127.0.0.1:54321/functions/v1/mindmap-api

# Create a new node
curl -X POST http://127.0.0.1:54321/functions/v1/mindmap-api \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Node","content":"Test content","x":0,"y":0}'

# Process Korean text with morphological analysis
curl -X POST http://127.0.0.1:54321/functions/v1/parse-input \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"rawText":"모바일 앱을 개발하고 싶습니다"}'

# Process English text with NLP
curl -X POST http://127.0.0.1:54321/functions/v1/parse-input \
  -H "Content-Type: application/json" \
  -d '{"rawText":"I want to create a revolutionary AI-powered productivity tool"}'

# Fetch enterprise data
curl -X POST http://127.0.0.1:54321/functions/v1/fetch-enterprise-data \
  -H "Content-Type: application/json" \
  -d '{"keywords":["productivity","automation","tools"],"sources":["internal_wiki","knowledge_base"]}'

# Generate a strategic plan
curl -X POST http://127.0.0.1:54321/functions/v1/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Launch a mobile fitness app","keywords":["mobile","fitness","app"],"useOpenAI":true}'

# Auto-expand a mindmap node
curl -X POST http://127.0.0.1:54321/functions/v1/auto-expand \
  -H "Content-Type: application/json" \
  -d '{"parentNodeId":"uuid-of-node","maxChildren":3,"expansionStyle":"comprehensive","useLLM":true}'

# Enrich node content with RAG
curl -X POST http://127.0.0.1:54321/functions/v1/rag-detail \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"uuid-of-node","enrichmentType":"comprehensive","includeExamples":true,"useLLM":true}'

# Save session state
curl -X POST http://127.0.0.1:54321/functions/v1/save-session \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_001","sessionData":{"mindmap_nodes":[],"connections":[],"user_inputs":[]}}'

# Get session by ID
curl "http://127.0.0.1:54321/functions/v1/save-session?sessionId=session_001"

# Load session with validation and metrics
curl -X POST http://127.0.0.1:54321/functions/v1/load-session \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_001","validateNodes":true,"includeRelated":true}'

# Load session via GET
curl "http://127.0.0.1:54321/functions/v1/load-session?sessionId=session_001&includeRelated=true"
```

## Deployment

1. Link your project to Supabase:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. Deploy functions:
   ```bash
   supabase functions deploy
   ```

3. Push database changes:
   ```bash
   supabase db push
   ```

## Advanced Features

### RAG Enrichment Types
- **comprehensive**: Thorough, multi-dimensional analysis covering all aspects
- **contextual**: Focus on relationships and broader context
- **technical**: Emphasize technical details and implementation specifics  
- **strategic**: Focus on strategic implications and business value

### Auto-Expansion Styles
- **comprehensive**: Diverse aspects and perspectives
- **focused**: Specific, actionable items
- **creative**: Innovative and novel angles  
- **analytical**: Logical, structured breakdown

### Vector Search Capabilities
- **Semantic Similarity**: Find conceptually related content across all data types
- **Cross-Content Search**: Search mindmap nodes, plans, enterprise data, and user inputs
- **Configurable Thresholds**: Adjust similarity sensitivity for different use cases
- **Intelligent Caching**: Automatic embedding generation and storage

### Session Management Features
- **Persistent State**: Save complete mindmap sessions with nodes, connections, and metadata
- **Viewport Persistence**: Remember zoom, pan, and viewport settings
- **UI Preferences**: Store theme, layout, and interface customizations
- **Automatic Cleanup**: Configurable session expiration with cleanup utilities
- **Multi-User Support**: Session isolation and user-specific session management
- **Anonymous Sessions**: Support for non-authenticated user sessions
- **Session Validation**: Integrity checks for node references and connections
- **Activity Tracking**: Automatic last activity updates and session metrics
- **Related Data Loading**: Load associated plans, enriched content, and expansions
- **Migration Support**: Automatic session data migration and repair

## Next Steps

- Configure authentication policies based on your needs
- Add real-time subscriptions for collaborative editing
- Generate embeddings for existing content using `/manage-embeddings`
- Implement additional API endpoints as needed
- Add input validation and error handling
- Set up CI/CD pipeline