# Future Mindmap Demo

AI-powered mindmap application with advanced Korean NLP processing and real-time collaboration features.

## 🏗️ Architecture

This is a full-stack TypeScript application consisting of:

- **Frontend**: React 19 + XYFlow + Zustand (TypeScript)
- **Backend**: Supabase Edge Functions (Deno + TypeScript)
- **Database**: PostgreSQL with pgvector extension
- **AI/ML**: OpenAI integration for embeddings and LLM

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Deno (for backend development)
- Supabase CLI

### Development Setup

1. **Clone and setup**:
```bash
git clone <repository>
cd future-mindmap-demo
npm install
```

2. **Backend Development**:
```bash
# Start Supabase local development
cd backend
supabase start
supabase functions serve

# Backend will run on http://localhost:54321
```

3. **Frontend Development**:
```bash
# Start frontend development server
cd frontend
npm run dev

# Frontend will run on http://localhost:5173
```

4. **Full Stack Development**:
```bash
# From root directory
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` files:

**Frontend** (`frontend/.env.local`):
```bash
VITE_API_BASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENTERPRISE_TOKEN=your_enterprise_token
```

**Backend** (`backend/supabase/config.toml`):
```toml
[api]
port = 54321

[auth]
site_url = "http://127.0.0.1:5173"

[db]
port = 54322
```

## 📁 Project Structure

```
future-mindmap-demo/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Supabase backend
│   ├── supabase/
│   │   ├── functions/      # Edge functions (API endpoints)
│   │   ├── migrations/     # Database migrations
│   │   └── config.toml
│   └── package.json
├── package.json             # Root workspace configuration
└── README.md
```

## 🎯 Features

### Core Features
- ✅ AI-powered mindmap creation
- ✅ Advanced Korean NLP processing
- ✅ Real-time mindmap visualization
- ✅ Session management and persistence
- ✅ Vector embeddings for semantic search
- ✅ Enterprise data integration

### Korean Language Support
- Morphological analysis
- Sentiment analysis
- Language detection
- UTF-8 encoding support
- Technical domain recognition

### AI/ML Capabilities
- OpenAI GPT integration
- Vector embeddings (ada-002)
- Semantic similarity search
- Intelligent node expansion
- RAG (Retrieval Augmented Generation)

## 🔧 Development Commands

```bash
# Development
npm run dev                  # Start frontend only
npm run dev:frontend        # Start frontend development server
npm run dev:backend         # Start backend development server

# Building
npm run build               # Build both frontend and backend
npm run build:frontend      # Build frontend for production
npm run build:backend       # Deploy backend functions

# Testing
npm run test                # Run all tests
npm run test:frontend       # Run frontend tests
npm run test:backend        # Run backend tests

# Linting
npm run lint                # Lint frontend code
```

## 🌐 API Endpoints

The backend provides 10 Edge Functions:

| Endpoint | Purpose | Features |
|----------|---------|----------|
| `/mindmap-api` | CRUD operations for mindmap nodes | Korean text support, UTF-8 encoding |
| `/parse-input` | Korean NLP processing | Morphological analysis, sentiment detection |
| `/fetch-enterprise-data` | Enterprise data integration | Multi-source aggregation, relevance scoring |
| `/generate-plan` | AI-powered strategic planning | OpenAI integration, fallback mechanisms |
| `/auto-expand` | Intelligent node expansion | Vector similarity search, LLM generation |
| `/rag-detail` | Content enrichment via RAG | Retrieval augmented generation |
| `/save-session` | Session state persistence | Complete mindmap state, UI preferences |
| `/load-session` | Session restoration | Data integrity checks, related content |
| `/manage-embeddings` | Vector embedding operations | Batch processing, similarity search |
| `/hello-world` | Health check and testing | Basic functionality verification |

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **TypeScript 5.8.3** - Type-safe development
- **XYFlow 12.8.2** - Advanced mindmap visualization
- **Zustand 5.0.7** - Lightweight state management
- **Vite 7.1.0** - Fast build tooling
- **Jest 30.0.5** - Testing framework

### Backend
- **Supabase Edge Functions** - Serverless API endpoints
- **Deno** - Modern JavaScript runtime
- **PostgreSQL** - Relational database
- **pgvector** - Vector similarity search
- **OpenAI API** - AI/ML capabilities

## 📊 Database Schema

Key tables:
- `mindmap_nodes` - Mindmap node data
- `user_inputs` - Raw user input processing
- `enterprise_data` - Enterprise data integration
- `plans` - AI-generated strategic plans
- `embeddings` - Vector embeddings for similarity search
- `user_sessions` - Session state management

## 🚀 Deployment

### Production Deployment

1. **Backend (Supabase)**:
```bash
cd backend
supabase link --project-ref your-project-ref
supabase db push
supabase functions deploy
```

2. **Frontend (Vercel/Netlify)**:
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

### Environment Configuration

Set production environment variables:
- `VITE_API_BASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key (backend)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](docs/)
- Contact the development team

---

**Happy mindmapping! 🧠✨**