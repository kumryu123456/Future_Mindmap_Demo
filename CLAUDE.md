# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered career roadmap generator built for the 2025 Unithon hackathon. The application helps developers create personalized career paths with interactive flow charts and AI-generated recommendations.

## Commands

### Development
```bash
# Start development server with Turbopack
pnpm dev

# Build production version
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Package Management
- This project uses **pnpm** exclusively (enforced by preinstall script)
- Never use npm or yarn - the preinstall script will block them

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components  
- **AI Integration**: AI SDK with OpenAI GPT-4
- **Flow Charts**: @xyflow/react for interactive career roadmaps
- **Authentication**: Not yet implemented (placeholder pages exist)
- **Database**: Supabase (configured but not fully integrated)
- **Vector Search**: LangChain for document embeddings and search

### App Router Structure
```
src/app/
├── page.tsx              # Landing page with hero, features, solutions
├── layout.tsx            # Root layout with Header
├── ai-career/page.tsx    # Main AI career roadmap with ReactFlow
├── login/page.tsx        # Login form (placeholder)
├── register/page.tsx     # Registration form (placeholder)
└── explore/page.tsx      # Exploration page (placeholder)
```

### Key Components
- **Header** (`src/components/header.tsx`): Navigation with logo and auth buttons
- **UI Components** (`src/components/ui/`): shadcn/ui components (Button, Input, Textarea)
- **Flow Nodes** (`src/nodes/`, `src/components/base-node.tsx`): Custom ReactFlow nodes for career paths

### State Management
- React state with hooks (useState, useCallback)
- ReactFlow state management for node/edge interactions
- No global state management library currently used

### Styling Approach
- Tailwind CSS with custom configuration
- shadcn/ui component system with "new-york" style
- Consistent color scheme: blue-800/900 primary, gray secondary
- Responsive design with proper spacing and typography

## Important Implementation Details

### Layout System
The root layout (`src/app/layout.tsx`) uses a fixed height approach with `h-screen` and `overflow-auto` for the main content area. Pages needing scrollable content should use `min-h-full` instead of `items-center` to prevent content clipping.

### AI Career Flow
The AI career page features a complex ReactFlow visualization with:
- Multiple career paths from current state to specialist roles
- Node types: input (current), default (steps), output (final goals)
- Edge connections representing progression paths
- Interactive dragging and connection capabilities

### Authentication Flow
Login and register pages exist but are not connected to backend services yet. Forms include validation and loading states but currently show placeholder alerts.

### Asset Management
- Static assets in `public/` directory
- Some components reference localhost URLs for images (should be updated for production)
- SVG icons from the public directory

## Development Patterns

### Component Structure
- Use client components ("use client") for interactive features
- Functional components with TypeScript interfaces
- Props destructuring and proper type definitions
- Consistent import ordering: React, Next.js, third-party, local

### Error Handling
- Form validation with error state management
- Loading states for async operations
- TypeScript strict mode enabled

### Code Style
- ESLint and Prettier configured
- Consistent naming: kebab-case for files, camelCase for variables
- Comprehensive type definitions for complex data structures

## Environment Setup

Required environment variables in `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Known Issues & TODOs

- Authentication system needs backend integration
- Image URLs are hardcoded to localhost (need production URLs)
- AI chat API endpoints were removed but dependencies remain
- Some pages are placeholder implementations
- Vector search functionality partially implemented but not connected