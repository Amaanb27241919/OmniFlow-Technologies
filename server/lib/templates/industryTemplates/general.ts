import { AuditTemplate } from '../templateTypes';

const generalTemplate: AuditTemplate = {
  id: 'general-business-audit',
  name: 'General Business Audit',
  industry: 'general',
  description: 'A general business audit for any type of business',
  icon: 'building',
  questions: [
    {
      id: 'businessName',
      question: 'What is your business name?',
      type: 'text',
      required: true,
      category: 'general'
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
      category: 'general'
    },
    {
      id: 'businessAge',
      question: 'How long has your business been operating?',
      type: 'select',
      options: [
        'Less than 1 year',
        '1-3 years',
        '3-5 years',
        '5-10 years',
        'More than 10 years'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'employees',
      question: 'How many employees does your business have?',
      type: 'select',
      options: [
        'Just me',
        '2-5',
        '6-10',
        '11-25',
        '26-50',
        '51-100',
        '101-500',
        'More than 500'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'monthlyRevenue',
      question: 'What is your average monthly revenue?',
      type: 'select',
      options: [
        'Less than $5,000',
        '$5,000 - $10,000',
        '$10,001 - $25,000',
        '$25,001 - $50,000',
        '$50,001 - $100,000',
        '$100,001 - $250,000',
        '$250,001 - $500,000',
        'More than $500,000'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'profitMargin',
      question: 'What is your approximate profit margin?',
      type: 'select',
      options: [
        'Negative (losing money)',
        '0-5%',
        '6-10%',
        '11-15%',
        '16-20%',
        '21-30%',
        'More than 30%',
        'I don\'t know'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'revenueIncreased',
      question: 'Has your revenue increased in the past year?',
      type: 'select',
      options: [
        'Yes, significantly (more than 20%)',
        'Yes, moderately (10-20%)',
        'Yes, slightly (less than 10%)',
        'Stayed about the same',
        'No, it decreased',
        'Business is less than a year old'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'primaryExpense',
      question: 'What is your biggest business expense category?',
      type: 'select',
      options: [
        'Payroll/Staff',
        'Rent/Facilities',
        'Inventory/Cost of Goods',
        'Marketing/Advertising',
        'Equipment/Technology',
        'Shipping/Logistics',
        'Professional Services',
        'Other'
      ],
      required: true,
      category: 'finance'
    },
    {
      id: 'usesAutomation',
      question: 'Does your business currently use any automation tools?',
      type: 'select',
      options: [
        'Yes, extensively',
        'Yes, for some processes',
        'Minimal automation',
        'No, but interested',
        'No, not interested'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'automationTools',
      question: 'Which areas of your business use software automation? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Customer service/support',
        'Marketing/email',
        'Sales/CRM',
        'Accounting/finance',
        'Project management',
        'Inventory/supply chain',
        'HR/employee management',
        'Scheduling/appointments',
        'Social media',
        'Website/e-commerce',
        'Production/manufacturing',
        'None'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'leadSource',
      question: 'What is your primary source of new customers/clients?',
      type: 'select',
      options: [
        'Referrals',
        'Social media',
        'Online advertising',
        'Content marketing/SEO',
        'Traditional advertising',
        'Events/trade shows',
        'Cold outreach/prospecting',
        'Partnerships',
        'Other'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'tracksCAC',
      question: 'Do you track your customer acquisition cost (CAC)?',
      type: 'select',
      options: [
        'Yes, consistently',
        'Sometimes/partially',
        'No, but I should',
        'No, I don\'t think it\'s necessary'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'businessGoals',
      question: 'What are your primary business goals for the next year? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Increase revenue',
        'Improve profitability',
        'Expand to new markets',
        'Launch new products/services',
        'Build brand awareness',
        'Improve customer retention',
        'Streamline operations',
        'Reduce costs',
        'Hire more employees',
        'Implement new technology',
        'Secure funding/investment',
        'Prepare for sale/exit'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'biggestChallenges',
      question: 'What are your biggest business challenges right now? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Finding new customers',
        'Cash flow management',
        'Time management',
        'Hiring qualified staff',
        'Managing staff',
        'Marketing effectively',
        'Keeping up with competition',
        'Operational inefficiencies',
        'Technology limitations',
        'Supply chain issues',
        'Adapting to market changes',
        'Scaling the business',
        'Compliance/regulations',
        'Customer service quality',
        'Product/service quality',
        'Other'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'additionalInfo',
      question: 'Is there anything else you\'d like to share about your business or specific challenges?',
      type: 'text',
      required: false,
      category: 'general'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default generalTemplate;