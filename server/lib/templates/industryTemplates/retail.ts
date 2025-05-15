import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Retail business audit template with industry-specific questions
 */
const retailTemplate: AuditTemplate = {
  id: 'retail-business-audit',
  name: 'Retail Business Audit',
  industry: 'retail',
  description: 'A specialized business audit template for retail businesses',
  icon: 'shopping-bag',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Start with the general questions as a base
  questions: [
    ...generalTemplate.questions,
    
    // Add retail-specific questions
    {
      id: 'retail-type',
      question: 'What type of retail business do you operate?',
      type: 'select',
      options: [
        'Brick and mortar only',
        'E-commerce only',
        'Hybrid (physical and online)',
        'Pop-up or mobile retail',
        'Marketplace seller'
      ],
      required: true,
      category: 'general',
    },
    {
      id: 'pos-system',
      question: 'What point-of-sale (POS) system do you currently use?',
      type: 'select',
      options: [
        'Square',
        'Shopify POS',
        'Lightspeed',
        'Clover',
        'Vend',
        'Toast',
        'Revel',
        'Other',
        'None'
      ],
      category: 'operations',
    },
    {
      id: 'inventory-management',
      question: 'How do you currently manage your inventory?',
      type: 'select',
      options: [
        'Manual tracking (spreadsheets)',
        'Integrated with POS',
        'Dedicated inventory software',
        'ERP system',
        'No formal tracking'
      ],
      required: true,
      category: 'operations',
    },
    {
      id: 'e-commerce-platforms',
      question: 'Which e-commerce platforms do you sell on?',
      type: 'multiselect',
      options: [
        'Own website',
        'Amazon',
        'eBay',
        'Etsy',
        'Walmart Marketplace',
        'Shopify',
        'WooCommerce',
        'BigCommerce',
        'Social media shops',
        'None'
      ],
      category: 'sales',
    },
    {
      id: 'customer-loyalty',
      question: 'Do you have a customer loyalty or rewards program?',
      type: 'select',
      options: [
        'Yes, digital',
        'Yes, physical (punch cards, etc.)',
        'No, but planning to implement',
        'No'
      ],
      category: 'marketing',
    },
    {
      id: 'busiest-seasons',
      question: 'What are your busiest sales seasons?',
      type: 'multiselect',
      options: [
        'Winter holidays (Nov-Dec)',
        'Back to school',
        'Summer',
        'Spring',
        'Fall',
        'Special events/holidays',
        'Consistent year-round'
      ],
      category: 'sales',
    },
    {
      id: 'retail-challenges',
      question: 'What are your biggest retail-specific challenges?',
      type: 'multiselect',
      options: [
        'Inventory management',
        'Staffing/scheduling',
        'Customer experience',
        'Competitive pricing',
        'Omnichannel integration',
        'Returns management',
        'Supply chain issues',
        'Loss prevention/shrinkage',
        'Visual merchandising'
      ],
      required: true,
      category: 'operations',
    },
    {
      id: 'retail-automation-needs',
      question: 'Which areas of your retail business would benefit most from automation?',
      type: 'multiselect',
      options: [
        'Inventory management',
        'Customer communications',
        'Employee scheduling',
        'Marketing campaigns',
        'Pricing updates',
        'Reporting/analytics',
        'Order fulfillment',
        'Customer service'
      ],
      required: true,
      category: 'operations',
    }
  ]
};

export default retailTemplate;