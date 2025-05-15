import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Professional services business audit template with industry-specific questions
 */
const professionalServicesTemplate: AuditTemplate = {
  id: 'professional-services-audit',
  name: 'Professional Services Audit',
  industry: 'professional_services',
  description: 'A specialized business audit template for professional services firms',
  icon: 'briefcase',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Start with the general questions as a base
  questions: [
    ...generalTemplate.questions,
    
    // Add professional services-specific questions
    {
      id: 'services-type',
      question: 'What type of professional services does your firm provide?',
      type: 'multiselect',
      options: [
        'Legal',
        'Accounting',
        'Consulting',
        'Marketing/Advertising',
        'Design',
        'IT/Development',
        'Architecture',
        'Engineering',
        'Financial Services',
        'HR/Recruiting',
        'Other'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'billing-model',
      question: 'What billing model do you primarily use?',
      type: 'select',
      options: [
        'Hourly rates',
        'Fixed project fees',
        'Retainer/subscription',
        'Value-based pricing',
        'Hybrid/multiple approaches',
        'Other'
      ],
      required: true,
      category: 'finance',
    },
    {
      id: 'time-tracking',
      question: 'How do you track billable time?',
      type: 'select',
      options: [
        'Manual tracking',
        'Dedicated time tracking software',
        'Practice management system',
        'We don\'t track time',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'client-management',
      question: 'What client management/CRM system do you use?',
      type: 'select',
      options: [
        'No dedicated system',
        'Spreadsheets/manual',
        'HubSpot',
        'Salesforce',
        'Industry-specific CRM',
        'Custom-built system',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'document-management',
      question: 'How do you manage client documents and deliverables?',
      type: 'select',
      options: [
        'Cloud storage (Google Drive, Dropbox, etc.)',
        'Dedicated document management system',
        'Practice management software',
        'Primarily email',
        'Physical/paper filing',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'project-management',
      question: 'What project management tool(s) do you use?',
      type: 'multiselect',
      options: [
        'None',
        'Asana',
        'Trello',
        'Monday.com',
        'ClickUp',
        'Jira',
        'Microsoft Project',
        'Custom/proprietary system',
        'Other'
      ],
      category: 'operations',
    },
    {
      id: 'client-acquisition',
      question: 'How do you primarily acquire new clients?',
      type: 'multiselect',
      options: [
        'Referrals/word of mouth',
        'Content marketing',
        'Speaking engagements',
        'Digital advertising',
        'Networking events',
        'Strategic partnerships',
        'RFPs/formal proposals',
        'Social media',
        'Other'
      ],
      required: true,
      category: 'marketing',
    },
    {
      id: 'service-delivery-challenges',
      question: 'What are your biggest challenges in service delivery?',
      type: 'multiselect',
      options: [
        'Meeting deadlines',
        'Quality control',
        'Resource allocation',
        'Client communication',
        'Scope creep',
        'Knowledge management',
        'Process standardization',
        'Scaling operations',
        'Finding qualified talent'
      ],
      required: true,
      category: 'operations',
    },
    {
      id: 'professional-services-automation',
      question: 'Which areas of your business would benefit most from automation?',
      type: 'multiselect',
      options: [
        'Client intake/onboarding',
        'Time tracking/billing',
        'Document generation',
        'Project management',
        'Client communication',
        'Reporting/analytics',
        'Marketing/lead generation',
        'Knowledge management'
      ],
      required: true,
      category: 'operations',
    }
  ]
};

export default professionalServicesTemplate;