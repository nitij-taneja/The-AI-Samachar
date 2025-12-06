# AI Newsletter Agent - Complete Project Documentation

## Overview

**AI Newsletter Agent** is a production-ready web application that demonstrates modern **agentic AI frameworks** in action. It generates personalized newsletters while providing real-time visualization of how intelligent agents collaborate to research, analyze, and create content.

Video: 

This project is designed to showcase:
- Multi-agent orchestration patterns
- Real-time AI execution visualization
- Enterprise-grade web architecture
- Modern AI/ML integration
- Professional UI/UX design

## Key Features

### 1. **Multi-Agent Orchestration**
- **ResearchAgent** - Gathers relevant news and articles from multiple sources
- **AnalysisAgent** - Analyzes and summarizes gathered content
- **ContentGenerationAgent** - Generates personalized newsletter content
- **FormattingAgent** - Polishes and formats the newsletter
- **QualityAgent** - Performs quality checks and validation

### 2. **Real-time Visualization**
- Watch agents execute step-by-step
- Live progress monitoring
- Execution metrics and timing
- Error tracking and handling
- State transitions visualization

### 3. **Customization Controls**
- **Topics:** Select multiple topics for your newsletter
- **Tone:** Choose professional, casual, or technical tone
- **Content Length:** Select short, medium, or long format
- **News Source:** Pick preferred news sources
- **Personalization:** Adjust personalization level (1-10)

### 4. **API Integration**
- **GROQ Llama** - AI content generation and quality analysis
- **Tavily API** - Intelligent web search and news gathering
- **DuckDuckGo** - Free news search (no API key required)

### 5. **Professional UI**
- Dark theme with gradient backgrounds
- Responsive design (mobile, tablet, desktop)
- Real-time dashboard
- Newsletter history and management
- User authentication and preferences

### 6. **Custom Agent Templates**
- Create and manage reusable agent prompts and parameter sets
- Store templates for consistent newsletter generation

### 7. **Email Delivery**
- Send generated newsletters via SMTP from within the Dashboard
- Configurable SMTP integration with environment variables

## Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Wouter** - Lightweight routing
- **Lucide React** - Beautiful icons

### Backend
- **Express 4** - Lightweight web framework
- **tRPC 11** - Type-safe RPC framework
- **Node.js** - JavaScript runtime
- **WebSocket** - Real-time communication

### Database
- **SQLLITE** - Relational database
- **Drizzle ORM** - Type-safe database queries
- **Migrations** - Version-controlled schema

### AI/APIs
- **Groq Gemini API** - Content generation
- **Tavily API** - Web search and news
- **DuckDuckGo API** - Alternative news source

### Deployment
- **Global CDN** - Fast content delivery
- **Auto-scaling** - Handle traffic spikes
- **SSL/TLS** - Secure connections


## Project Structure

```
ai_newsletter_agent/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Dashboard.tsx       # Main application
│   │   │   └── NotFound.tsx        # 404 page
│   │   ├── components/
│   │   │   ├── NewsletterGenerator.tsx    # Customization form
│   │   │   ├── AgentVisualization.tsx     # Real-time monitoring
│   │   │   └── DashboardLayout.tsx       # Layout wrapper
│   │   ├── App.tsx                 # Route configuration
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── public/                     # Static assets
│   └── package.json
│
├── server/                          # Backend application
│   ├── agents/
│   │   ├── newsletterAgent.ts      # Agent orchestration
│   │   ├── newsSearchService.ts    # News gathering
│   │   ├── groqService.ts        # AI content generation
│   │   ├── enhancedContentGenerator.ts  # Content pipeline
│   │   └── wsManager.ts            # WebSocket management
│   ├── routers.ts                  # tRPC procedures
│   ├── db.ts                       # Database helpers
│   └── _core/                      # Framework internals
│
├── drizzle/                         # Database schema
│   ├── schema.ts                   # Table definitions
│   └── migrations/                 # Schema versions
│
├── shared/                          # Shared types
│   └── const.ts                    # Constants
│
└── PROJECT_README.md                # This file
```

## Database Schema

### Users Table
```sql
- id (INT, PK)
- openId (VARCHAR, UNIQUE)
- name (TEXT)
- email (VARCHAR)
- role (ENUM: user, admin)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- lastSignedIn (TIMESTAMP)
```

### User Preferences Table
```sql
- id (INT, PK)
- userId (INT, FK)
- topics (JSON)
- tone (ENUM: professional, casual, technical)
- contentLength (ENUM: short, medium, long)
- newsSourcePreference (VARCHAR)
- personalizationLevel (INT 1-10)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Newsletters Table
```sql
- id (INT, PK)
- userId (INT, FK)
- title (VARCHAR)
- content (LONGTEXT)
- summary (TEXT)
- topics (JSON)
- agentExecutionId (VARCHAR)
- generatedAt (TIMESTAMP)
- createdAt (TIMESTAMP)
```

### Agent Executions Table
```sql
- id (INT, PK)
- userId (INT, FK)
- executionId (VARCHAR, UNIQUE)
- status (ENUM: pending, running, completed, failed)
- goal (TEXT)
- constraints (JSON)
- result (LONGTEXT)
- error (TEXT)
- createdAt (TIMESTAMP)
- completedAt (TIMESTAMP)
```

### Agent Steps Table
```sql
- id (INT, PK)
- executionId (VARCHAR, FK)
- stepNumber (INT)
- agentName (VARCHAR)
- taskDescription (TEXT)
- status (ENUM: pending, running, completed, failed)
- input (JSON)
- output (JSON)
- error (TEXT)
- createdAt (TIMESTAMP)
- completedAt (TIMESTAMP)
```

## API Endpoints (tRPC)

### Newsletter Management
- `newsletter.generateNewsletter` - Start newsletter generation
- `newsletter.getExecutionStatus` - Get current execution status
- `newsletter.getNewsletters` - Get user's newsletters
- `newsletter.getNewsletter` - Get specific newsletter
- `newsletter.listTemplates` - List custom agent templates
- `newsletter.createTemplate` - Create a new agent template
- `newsletter.updateTemplate` - Update an existing agent template
- `newsletter.deleteTemplate` - Delete an agent template
- `newsletter.sendNewsletter` - Send a generated newsletter via email
- `newsletter.listTemplates` - List custom agent templates
- `newsletter.createTemplate` - Create a new agent template
- `newsletter.updateTemplate` - Update an existing agent template
- `newsletter.deleteTemplate` - Delete an agent template
- `newsletter.sendNewsletter` - Send a generated newsletter via email

### User Preferences
- `preferences.getPreferences` - Get user preferences
- `preferences.updatePreferences` - Update preferences

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Logout user

## Environment Variables

```bash
# Database
DATABASE_URL=SQLLITE./DB

# Authentication
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=owner_id
OWNER_NAME=owner_name

# AI/APIs
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key

# SMTP Email Delivery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass

# Application
VITE_APP_TITLE=AI Newsletter Agent
VITE_APP_LOGO=https://your-logo-url
BUILT_IN_FORGE_API_KEY=your_forge_key
BUILT_IN_FORGE_API_URL=https://forge.api.url
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm or npm
- MySQL database
- API keys (Gemini, Tavily)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev                # run both server and client concurrently
pnpm dev:server         # run backend only
pnpm dev:client         # run frontend only
```

### Development

```bash
# Start dev server (frontend + backend)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

## Usage Guide

### For Users

1. **Sign In** - Sign in the application
2. **Go to Dashboard** - Access the main application
3. **Generate Newsletter**:
   - Select topics
   - Choose tone and length
   - Set personalization level
   - Click "Generate"
4. **Monitor Execution** - Watch agents work in real-time
5. **View History** - Access previously generated newsletters

### For Developers

1. **Add New Agent**:
   - Create agent class in `server/agents/`
   - Implement execute() method
   - Add to orchestration in `newsletterAgent.ts`

2. **Add New API Integration**:
   - Create service in `server/agents/`
   - Implement API calls
   - Integrate with content pipeline

3. **Customize UI**:
   - Modify components in `client/src/components/`
   - Update styles in `client/src/index.css`
   - Add new pages in `client/src/pages/`

## Performance Optimization

- **Frontend**: Code splitting, lazy loading, optimized images
- **Backend**: Request caching, connection pooling, async processing
- **Database**: Indexed queries, optimized schema
- **APIs**: Rate limiting, fallback mechanisms, error handling

## Security

- **Authentication**: OAuth for secure login
- **API Keys**: Environment variables, never exposed to client
- **Database**: Parameterized queries (Drizzle ORM)
- **HTTPS**: All connections encrypted
- **CORS**: Properly configured for frontend

## Deployment

### To Production

1. **Create Checkpoint** - Save current state
2. **Click Publish** - Deploy via Management UI
3. **Configure Domain** - Set custom domain if needed
4. **Monitor** - Track performance and usage

### Scaling

- Application auto-scales based on traffic
- Database connections managed automatically
- CDN caches static assets globally
- WebSocket connections load-balanced

## Troubleshooting

### Newsletter Generation Fails
- Check API keys in Settings → Secrets
- Verify database connection
- Check browser console for errors
- Review server logs

### Real-time Updates Not Working
- Ensure WebSocket connection is stable
- Check browser network tab
- Verify server is running
- Clear browser cache

### Database Issues
- Verify DATABASE_URL is correct
- Run `pnpm db:push` to sync schema
- Check database user permissions
- Review database logs

## Contributing

To contribute improvements:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review
5. Deploy to production

## License

This project is provided as-is for educational and commercial use.

## Support

For questions or issues
- Contact support at tanejanitij4002@gmail.com
- Open an issue on GitHub (if applicable)

## Acknowledgments

Built with:
- React and TypeScript communities
- Tailwind CSS and shadcn/ui
- Express and tRPC frameworks
- Google Gemini and Tavily APIs
---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** Production Ready ✅

For the latest updates and documentation, visit the project repository.
