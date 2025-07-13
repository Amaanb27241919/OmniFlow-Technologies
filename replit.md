# OmniFlow Platform - Replit Configuration

## Overview

OmniFlow is a comprehensive dual-vertical AI-powered platform that combines personalized consulting services (OmniFlow Advisory) with scalable SaaS automation solutions (OmniCore). The platform is designed to serve startups, SMBs, and solopreneurs with a complete service-to-SaaS transition pipeline.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Dual-Vertical Business Model
- **OmniFlow Advisory**: Fixed-fee consulting services ($2,500 audits, $5,000/month retainers, $10,000 pilot projects)
- **OmniCore SaaS Platform**: Subscription tiers (Starter $97, Professional $297, Enterprise $997)
- **Service-to-SaaS Pipeline**: Intelligent routing system to transition consulting clients to self-serve platform

### Tech Stack
- **Frontend**: React with TypeScript, Vite build system, shadcn/ui components, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless hosting
- **AI Integration**: Multi-model routing (OpenAI GPT-4o, Anthropic Claude, Perplexity)
- **Build & Deployment**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### 1. Intelligent Agent Router
- **Purpose**: Cost-optimized AI model selection based on query complexity and user tier
- **Models**: OpenAI GPT-4o (primary), Claude-3 Sonnet, Perplexity Sonar
- **Routing Logic**: Balances cost efficiency with response quality based on user subscription level

### 2. Persistent Memory Layer
- **Implementation**: User context storage across sessions for personalized experiences
- **Use Case**: Maintains conversation history and business profile data for continuous consulting relationship

### 3. Automation Pipeline Engine
- **Workflow**: Intake → Audit → AI Analysis → Report → Action
- **Modularity**: Plug-and-play automation templates with 15+ pre-built blueprints
- **Scalability**: Designed to handle both one-off consulting projects and recurring SaaS automations

### 4. Business Audit System
- **Form Processing**: Comprehensive business assessment with industry-specific questions
- **AI Analysis**: Automated generation of strengths, opportunities, and recommendations
- **Integration**: Direct connection to Notion CRM for lead management

### 5. Client Portal & Dashboard
- **Features**: Project tracking, real-time notifications, collaboration tools
- **Tiered Access**: Feature flags based on subscription level (pro bono, starter, professional, enterprise)
- **Analytics**: Usage tracking, ROI calculations, and conversion metrics

## Data Flow

1. **Lead Generation**: Landing pages with assessment tools capture business information
2. **Qualification**: AI-powered lead scoring engine with 90%+ accuracy for conversion prediction
3. **Service Delivery**: Automated workflow execution with human oversight for quality assurance
4. **Transition Logic**: Intelligent evaluation system determines optimal client journey from advisory to SaaS
5. **Retention**: Ongoing automation management and optimization through platform interface

## External Dependencies

### Required Services
- **Database**: Neon PostgreSQL (configured via DATABASE_URL)
- **AI Models**: OpenAI API (GPT-4o), Anthropic API (Claude), Perplexity API
- **Email**: SendGrid for automated communications
- **Payments**: Stripe for subscription management (test mode implemented)

### Optional Integrations
- **CRM**: Notion integration for lead management
- **Analytics**: Custom analytics engine with business intelligence
- **Webhooks**: n8n integration for workflow automation
- **Third-party APIs**: Zapier, Airtable, Google Sheets connections

## Deployment Strategy

### Development Environment
- **Replit**: Primary development and testing platform
- **Hot Reload**: Vite dev server with HMR for rapid iteration
- **File-based Storage**: JSON files for development (tasks.json, users.json, logs.json)

### Production Considerations
- **Database Migration**: Drizzle Kit for schema management and migrations
- **Environment Variables**: Secure credential management for API keys
- **Monitoring**: Compliance logging system for GDPR/data protection requirements
- **Scalability**: Microservices architecture preparation for container deployment

### Build Process
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild compiles TypeScript to `dist/index.js`
- **Static Assets**: Public directory serves marketing pages and assessments

## Security & Compliance

### Data Protection
- **GDPR Compliance**: Automated retention policies and data processing logs
- **Role-based Access**: JWT authentication with user tier management
- **Audit Trails**: Comprehensive logging for all user interactions and AI processing

### Business Continuity
- **Redundant Tools**: Multiple AI providers prevent single points of failure
- **Modular Architecture**: Independent service components for easier maintenance
- **Backup Systems**: File-based fallbacks for critical business functions