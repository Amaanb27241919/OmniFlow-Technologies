import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Technology business audit template with industry-specific questions
 */
const technologyTemplate: AuditTemplate = {
  id: 'technology-business-audit',
  name: 'Technology Business Audit',
  industry: 'technology',
  description: 'A specialized business audit template for technology companies',
  icon: 'cpu',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Start with the general questions as a base
  questions: [
    ...generalTemplate.questions,
    
    // Add technology-specific questions
    {
      id: 'tech-business-type',
      question: 'What type of technology business do you operate?',
      type: 'select',
      options: [
        'SaaS/Cloud Services',
        'Custom Software Development',
        'IT Services/Consulting',
        'Hardware/Manufacturing',
        'Mobile App Development',
        'E-commerce Technology',
        'AI/Machine Learning',
        'Cybersecurity',
        'Blockchain/Web3',
        'Other'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'revenue-model',
      question: 'What is your primary revenue model?',
      type: 'select',
      options: [
        'Subscription (SaaS)',
        'One-time licenses',
        'Service contracts',
        'Project-based',
        'Freemium',
        'Usage-based',
        'Commission/Marketplace',
        'Hardware sales',
        'Advertising',
        'Other'
      ],
      required: true,
      category: 'finance',
    },
    {
      id: 'development-methodology',
      question: 'What development methodology do you primarily use?',
      type: 'select',
      options: [
        'Agile/Scrum',
        'Kanban',
        'DevOps',
        'Waterfall',
        'Hybrid approach',
        'No formal methodology',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'tech-stack',
      question: 'What are the main technologies in your tech stack?',
      type: 'multiselect',
      options: [
        'JavaScript/TypeScript',
        'Python',
        'Java',
        'C#/.NET',
        'Ruby',
        'PHP',
        'Go',
        'Rust',
        'Mobile (iOS/Android)',
        'Cloud (AWS/Azure/GCP)',
        'Containers/Kubernetes',
        'Blockchain',
        'AI/ML frameworks'
      ],
      category: 'operations',
    },
    {
      id: 'project-management-tool',
      question: 'What project/product management tools do you use?',
      type: 'multiselect',
      options: [
        'Jira',
        'GitHub/GitLab Issues',
        'Asana',
        'Trello',
        'Monday.com',
        'ClickUp',
        'Linear',
        'Notion',
        'Azure DevOps',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'cloud-platforms',
      question: 'Which cloud platforms do you use?',
      type: 'multiselect',
      options: [
        'AWS',
        'Microsoft Azure',
        'Google Cloud Platform',
        'DigitalOcean',
        'Heroku',
        'Netlify/Vercel',
        'IBM Cloud',
        'Oracle Cloud',
        'None/Self-hosted',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'customer-success',
      question: 'How do you manage customer success and retention?',
      type: 'select',
      options: [
        'Dedicated success team',
        'Regular check-ins',
        'Usage analytics',
        'Product-led approach',
        'No formal process',
        'Other'
      ],
      category: 'sales',
    },
    {
      id: 'product-roadmap',
      question: 'How do you manage your product roadmap?',
      type: 'select',
      options: [
        'Formal process with regular reviews',
        'Based on customer feedback',
        'Market-driven',
        'Investor/board driven',
        'Informal/ad-hoc',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'tech-challenges',
      question: 'What are your biggest technology business challenges?',
      type: 'multiselect',
      options: [
        'Talent acquisition/retention',
        'Feature prioritization',
        'Technical debt',
        'Scaling infrastructure',
        'Security/compliance',
        'Customer acquisition',
        'Funding/investment',
        'Market competition',
        'Product-market fit',
        'User adoption'
      ],
      required: true,
      category: 'operations',
    },
    {
      id: 'tech-automation-needs',
      question: 'Which areas of your tech business need the most automation?',
      type: 'multiselect',
      options: [
        'Development workflows (CI/CD)',
        'Testing/QA',
        'Customer onboarding',
        'Support processes',
        'Sales/lead generation',
        'Internal communication',
        'Documentation',
        'Monitoring/alerting',
        'Analytics/reporting'
      ],
      required: true,
      category: 'operations',
    }
  ]
};

export default technologyTemplate;