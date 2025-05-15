import { AuditTemplate } from '../templateTypes';

/**
 * General business audit template with questions applicable to all industries
 */
const generalTemplate: AuditTemplate = {
  id: 'general-business-audit',
  name: 'General Business Audit',
  industry: 'general',
  description: 'A comprehensive business audit template with general questions suitable for any industry',
  icon: 'building',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  questions: [
    // Basic Business Information
    {
      id: 'business-name',
      question: 'What is your business name?',
      type: 'text',
      placeholder: 'Enter your business name',
      required: true,
      category: 'general',
    },
    {
      id: 'industry',
      question: 'What industry is your business in?',
      type: 'select',
      options: [
        'Retail',
        'Professional Services',
        'Healthcare',
        'Manufacturing',
        'Technology',
        'Finance',
        'Education',
        'Hospitality',
        'Construction',
        'Other'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'business-age',
      question: 'How long has your business been operating?',
      type: 'select',
      options: [
        'Less than 1 year',
        '1-3 years',
        '3-5 years',
        '5-10 years',
        '10+ years'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'employees',
      question: 'How many employees do you have?',
      type: 'select',
      options: [
        '1-5',
        '6-15',
        '16-50',
        '51-200',
        '200+'
      ],
      required: true,
      category: 'general',
    },
    
    // Financial Information
    {
      id: 'monthly-revenue',
      question: 'What is your average monthly revenue?',
      type: 'select',
      options: [
        'Less than $10,000',
        '$10,000 - $50,000',
        '$50,000 - $100,000',
        '$100,000 - $500,000',
        '$500,000+'
      ],
      required: true,
      category: 'finance',
    },
    {
      id: 'profit-margin',
      question: 'What is your current profit margin?',
      type: 'select',
      options: [
        'Less than 10%',
        '10% - 20%',
        '20% - 30%',
        '30% - 40%',
        '40%+'
      ],
      required: true,
      category: 'finance',
    },
    {
      id: 'revenue-increased',
      question: 'Has your revenue increased in the past year?',
      type: 'select',
      options: [
        'Yes',
        'No',
        'Stayed the same'
      ],
      required: true,
      category: 'finance',
    },
    {
      id: 'primary-expense',
      question: 'What is your primary business expense?',
      type: 'select',
      options: [
        'Staffing/Labor',
        'Inventory/Materials',
        'Marketing/Advertising',
        'Rent/Facilities',
        'Technology/Equipment',
        'Other'
      ],
      required: true,
      category: 'finance',
    },
    
    // Operations & Automation
    {
      id: 'uses-automation',
      question: 'Do you currently use any automation tools in your business?',
      type: 'select',
      options: [
        'Yes',
        'No',
        'Not sure'
      ],
      required: true,
      category: 'operations',
    },
    {
      id: 'automation-tools',
      question: 'Which automation tools do you currently use?',
      type: 'multiselect',
      options: [
        'CRM software',
        'Email marketing automation',
        'Social media scheduling',
        'Accounting software',
        'Inventory management',
        'Project management',
        'Customer service/helpdesk',
        'None'
      ],
      category: 'operations',
    },
    
    // Marketing & Sales
    {
      id: 'lead-source',
      question: 'What is your primary source of new customer leads?',
      type: 'select',
      options: [
        'Referrals',
        'Social media',
        'Google/search',
        'Paid advertising',
        'Events/tradeshows',
        'Content marketing',
        'Cold outreach',
        'Other'
      ],
      required: true,
      category: 'marketing',
    },
    {
      id: 'tracks-cac',
      question: 'Do you track your customer acquisition cost (CAC)?',
      type: 'select',
      options: [
        'Yes',
        'No',
        'Not sure what that is'
      ],
      required: true,
      category: 'marketing',
    },
    
    // Goals & Challenges
    {
      id: 'business-goals',
      question: 'What are your primary business goals for the next year?',
      type: 'multiselect',
      options: [
        'Increase revenue',
        'Reduce costs',
        'Improve efficiency',
        'Expand to new markets',
        'Launch new products/services',
        'Hire more staff',
        'Increase profit margins',
        'Improve customer retention',
        'Other'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'biggest-challenges',
      question: 'What are your biggest business challenges right now?',
      type: 'multiselect',
      options: [
        'Finding new customers',
        'Cash flow management',
        'Operational inefficiencies',
        'Staff recruitment/retention',
        'Competition',
        'Marketing effectiveness',
        'Technology limitations',
        'Time management',
        'Other'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'additional-info',
      question: 'Is there anything else you would like to share about your business needs?',
      type: 'text',
      placeholder: 'Enter any additional information here',
      category: 'general',
    }
  ]
};

export default generalTemplate;