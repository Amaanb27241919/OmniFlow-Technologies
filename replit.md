# OmniFlow Platform - Replit Configuration

## Overview

OmniFlow Tech is a comprehensive dual-vertical AI-powered platform that combines personalized consulting services (OmniFlow Advisory) with scalable SaaS automation solutions (OmniCore). The platform is designed to serve startups, SMBs, and solopreneurs with a complete service-to-SaaS transition pipeline. The platform features assessment-first automation positioning with realistic, static data throughout.

## Recent Changes (January 2025)

### Pre-deployment Fixes Completed:
- ✅ Disabled all dynamic JavaScript random number generation that was destroying credibility
- ✅ Replaced all "$997" pricing with "FREE Assessment" emphasis throughout site
- ✅ Set all stats to static, realistic values (15 hours saved weekly, $5K-15K annually, 90% success rate)
- ✅ Added professional About section to homepage with company information and static metrics
- ✅ Updated all branding consistently to "OmniFlow Tech" across all pages
- ✅ Fixed navigation links and ensured cross-page consistency
- ✅ Removed Math.random() functions and setTimeout calls that caused changing numbers
- ✅ All pages tested and ready for production deployment to omni-flow.net

### Final Critical Issues Resolution (Latest Session):
- ✅ Updated About section with authentic content about business owner's automation expertise
- ✅ Replaced generic stats with SMB-focused messaging (FREE Assessment, 15 Hours Saved, SMB Focus)
- ✅ Removed all remaining "$997" pricing references from contact info and steps
- ✅ Added authentic personal voice emphasizing transparency and no-pressure approach
- ✅ Integrated n8n.io webhook for assessment data collection
- ✅ Enhanced assessment form to send complete data to https://n8n.omni-flow.net/webhook/assessment
- ✅ Fixed assessment page header positioning with proper 120px padding
- ✅ Resolved CSS display issue preventing assessment results from showing
- ✅ Updated all branding from "OmniFlow Tech - Assessment-First Automation" to "OmniFlow Technologies - AI Workflow Automation + Consulting"
- ✅ Fixed assessment results JavaScript to properly show/hide sections and display results
- ✅ Site ready for production deployment to omni-flow.net

### Smooth Transition Implementation Completed:
- ✅ Added comprehensive CSS animations and transitions for page elements
- ✅ Implemented smooth page loading animations with staggered timing
- ✅ Created JavaScript-powered smooth scrolling and navigation transitions
- ✅ Added hover effects and interactive animations for buttons and cards
- ✅ Implemented intersection observer for scroll-triggered animations
- ✅ Added animation classes to all pages (homepage, assessment, resources)
- ✅ Enhanced user experience with professional transitions and loading states

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Dual-Vertical Business Model
- **OmniFlow Tech Advisory**: Assessment-driven automation implementation starting at $997
- **OmniCore SaaS Platform**: Subscription tiers (Starter $97, Professional $297, Enterprise $997)
- **Service-to-SaaS Pipeline**: Intelligent routing system to transition consulting clients to self-serve platform
- **Assessment-First Positioning**: 5-minute assessment provides instant value before sales conversations

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