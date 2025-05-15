import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Technology business audit template with industry-specific questions
 */
const technologyTemplate: AuditTemplate = {
  ...generalTemplate,
  id: 'technology-audit',
  name: 'Technology Business Audit',
  industry: 'technology',
  description: 'A comprehensive business audit for technology companies including software development, SaaS, IT services, and hardware businesses',
  icon: 'laptop-code',
  questions: [
    ...generalTemplate.questions,
    {
      id: 'techCategory',
      question: 'What category best describes your technology business?',
      type: 'select',
      options: [
        'SaaS/Cloud Services',
        'Custom Software Development',
        'Mobile App Development',
        'IT Services/Support',
        'Hardware/IoT',
        'Data Analytics/AI',
        'Cybersecurity',
        'EdTech',
        'HealthTech',
        'FinTech',
        'E-commerce Technology',
        'Other'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'revenueModel',
      question: 'What is your primary revenue model?',
      type: 'select',
      options: [
        'Subscription (SaaS)',
        'One-time licenses',
        'Consulting/Service fees',
        'Transaction fees',
        'Advertising',
        'Freemium + Premium',
        'Usage-based/Pay-as-you-go',
        'Hardware sales',
        'Marketplace/Commission',
        'Other'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'recurringRevenue',
      question: 'What percentage of your revenue is recurring (vs. one-time)?',
      type: 'select',
      options: [
        'Less than 10%',
        '10-25%',
        '26-50%',
        '51-75%',
        '76-90%',
        'More than 90%',
        'I don\'t track this'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'churnRate',
      question: 'What is your customer/subscriber churn rate (annual)?',
      type: 'select',
      options: [
        'Less than 5%',
        '5-10%',
        '11-15%',
        '16-25%',
        'More than 25%',
        'I don\'t track this',
        'Not applicable'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'salesCycle',
      question: 'How long is your typical sales cycle?',
      type: 'select',
      options: [
        'Less than 1 week',
        '1-4 weeks',
        '1-3 months',
        '3-6 months',
        'More than 6 months',
        'Self-service (no sales team involved)'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'techStack',
      question: 'Which technologies form the core of your tech stack? (Select all that apply)',
      type: 'multiselect',
      options: [
        'JavaScript/TypeScript',
        'Python',
        'Java',
        '.NET/C#',
        'PHP',
        'Ruby',
        'Go',
        'Swift/iOS',
        'Kotlin/Android',
        'React/React Native',
        'Angular',
        'Vue.js',
        'Node.js',
        'AWS',
        'Google Cloud',
        'Azure',
        'SQL databases',
        'NoSQL databases',
        'Blockchain',
        'AI/Machine Learning',
        'Other'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'developmentProcess',
      question: 'What development methodology do you primarily use?',
      type: 'select',
      options: [
        'Agile/Scrum',
        'Kanban',
        'Waterfall',
        'DevOps',
        'Lean',
        'Extreme Programming (XP)',
        'Hybrid approach',
        'No formal methodology'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'customerSegments',
      question: 'Who are your primary customers?',
      type: 'select',
      options: [
        'B2B - Enterprise',
        'B2B - Mid-market',
        'B2B - Small business',
        'B2C - Consumers',
        'B2G - Government',
        'Mixed B2B and B2C',
        'Other'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'productRelease',
      question: 'How frequently do you release new features or updates?',
      type: 'select',
      options: [
        'Multiple times per day (continuous deployment)',
        'Weekly',
        'Monthly',
        'Quarterly',
        'Less than quarterly',
        'No regular schedule'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'techChallenges',
      question: 'What are your biggest technical challenges? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Scaling infrastructure',
        'Technical debt',
        'Security/compliance',
        'Integration with other systems',
        'Quality assurance/testing',
        'Development velocity',
        'Legacy system modernization',
        'Cloud migration',
        'Data management',
        'Performance optimization',
        'Mobile adaptation',
        'Keeping up with new technologies'
      ],
      required: true,
      category: 'operations'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default technologyTemplate;