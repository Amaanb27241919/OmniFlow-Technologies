import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Professional services business audit template with industry-specific questions
 */
const professionalServicesTemplate: AuditTemplate = {
  ...generalTemplate,
  id: 'professional-services-audit',
  name: 'Professional Services Business Audit',
  industry: 'professional_services',
  description: 'A comprehensive business audit for professional services firms including consultants, agencies, law firms, and other service-based businesses',
  icon: 'briefcase',
  questions: [
    ...generalTemplate.questions,
    {
      id: 'serviceTypes',
      question: 'What types of professional services does your business offer? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Consulting',
        'Creative/Design',
        'Marketing/Advertising',
        'Legal',
        'Accounting/Bookkeeping',
        'IT/Technology',
        'HR/Recruiting',
        'Financial Services',
        'Coaching/Training',
        'Architecture/Engineering',
        'Other'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'clientRetention',
      question: 'What percentage of your revenue comes from repeat clients?',
      type: 'select',
      options: [
        'Less than 10%',
        '10-25%',
        '26-50%',
        '51-75%',
        'More than 75%',
        'I don\'t track this'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'pricingModel',
      question: 'What pricing model(s) do you use? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Hourly rates',
        'Project-based fees',
        'Retainer/subscription',
        'Value-based pricing',
        'Performance-based fees',
        'Tiered packages',
        'Other'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'utilization',
      question: 'What is your team\'s average utilization rate (billable hours vs. total hours)?',
      type: 'select',
      options: [
        'Less than 50%',
        '50-60%',
        '61-70%',
        '71-80%',
        '81-90%',
        'More than 90%',
        'I don\'t track this'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'clientManagement',
      question: 'How do you currently manage client relationships and projects?',
      type: 'multiselect',
      options: [
        'CRM software',
        'Project management software',
        'Spreadsheets',
        'Email/calendar',
        'Custom software',
        'Paper-based systems',
        'No formal system'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'capacityLimit',
      question: 'Are you currently at capacity with your current client load?',
      type: 'select',
      options: [
        'Yes, we\'re overextended',
        'Yes, we\'re at our optimal capacity',
        'No, we could handle 10-25% more',
        'No, we could handle 25-50% more',
        'No, we have significant unused capacity'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'talentAcquisition',
      question: 'What is your biggest challenge in acquiring or retaining talent?',
      type: 'select',
      options: [
        'Finding qualified candidates',
        'Competing with market salaries',
        'Training and onboarding',
        'Employee engagement/satisfaction',
        'High turnover',
        'Work-life balance issues',
        'Remote work challenges',
        'Not applicable/no challenges'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'serviceScalability',
      question: 'How scalable are your current service offerings?',
      type: 'select',
      options: [
        'Highly scalable without adding resources',
        'Moderately scalable with some additional resources',
        'Limited scalability, directly tied to staff hours',
        'Not very scalable with current model',
        'Unsure/haven\'t assessed'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'continuousLearning',
      question: 'How does your team stay current with industry knowledge and skills?',
      type: 'multiselect',
      options: [
        'Formal training programs',
        'Industry certifications',
        'Conferences/events',
        'Subscriptions to industry publications',
        'Online courses',
        'Mentorship programs',
        'Internal knowledge sharing',
        'No formal professional development'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'serviceDeliveryBottlenecks',
      question: 'What is the biggest bottleneck in your service delivery process?',
      type: 'select',
      options: [
        'Client onboarding',
        'Discovery/requirements gathering',
        'Project planning',
        'Execution/implementation',
        'Quality assurance/review',
        'Client approval/feedback',
        'Invoicing/payment',
        'No significant bottlenecks'
      ],
      required: true,
      category: 'operations'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default professionalServicesTemplate;