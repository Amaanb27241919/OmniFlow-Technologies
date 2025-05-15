import { AuditTemplate } from '../templateTypes';
import generalTemplate from './general';

/**
 * Retail business audit template with industry-specific questions
 */
const retailTemplate: AuditTemplate = {
  ...generalTemplate,
  id: 'retail-audit',
  name: 'Retail Business Audit',
  industry: 'retail',
  description: 'A comprehensive business audit for retail businesses including brick-and-mortar stores, e-commerce, and omnichannel retailers',
  icon: 'shopping-bag',
  questions: [
    ...generalTemplate.questions,
    {
      id: 'retailType',
      question: 'What type of retail business do you operate?',
      type: 'select',
      options: [
        'Brick-and-mortar only',
        'E-commerce only',
        'Omnichannel (both physical and online)',
        'Marketplace seller',
        'Pop-up or mobile retail',
        'Wholesale/B2B',
        'Other'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'productCategories',
      question: 'What product categories do you sell? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Apparel/Fashion',
        'Electronics',
        'Home/Furniture',
        'Beauty/Personal Care',
        'Food/Grocery',
        'Health/Wellness',
        'Specialty/Hobby',
        'Luxury Goods',
        'Sporting Goods',
        'Toys/Children\'s Items',
        'Books/Media',
        'Gifts/Novelties',
        'Other'
      ],
      required: true,
      category: 'general'
    },
    {
      id: 'averageOrderValue',
      question: 'What is your average order value (AOV)?',
      type: 'select',
      options: [
        'Under $25',
        '$25-$50',
        '$51-$100',
        '$101-$250',
        '$251-$500',
        '$501-$1,000',
        'Over $1,000'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'inventoryManagement',
      question: 'How do you currently manage your inventory?',
      type: 'select',
      options: [
        'Manual tracking/spreadsheets',
        'Basic POS system',
        'Dedicated inventory management software',
        'ERP system',
        'Dropshipping (no inventory)',
        'Third-party logistics (3PL)',
        'Just-in-time inventory',
        'Other'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'ecommerceChannel',
      question: 'Which e-commerce channels do you use? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Own website',
        'Amazon',
        'eBay',
        'Etsy',
        'Walmart Marketplace',
        'Social media shops (Facebook, Instagram)',
        'Shopify',
        'WooCommerce',
        'BigCommerce',
        'None - no online sales',
        'Other'
      ],
      required: false,
      category: 'sales'
    },
    {
      id: 'customerRetention',
      question: 'What percentage of your sales come from repeat customers?',
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
      id: 'loyaltyProgram',
      question: 'Do you have a customer loyalty or rewards program?',
      type: 'select',
      options: [
        'Yes, and it\'s very effective',
        'Yes, but it needs improvement',
        'No, but we\'re planning to implement one',
        'No, and we have no plans for one'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'supplyChain',
      question: 'What are your biggest supply chain challenges? (Select all that apply)',
      type: 'multiselect',
      options: [
        'Supplier reliability',
        'Lead time management',
        'International shipping delays',
        'Storage/warehousing',
        'Inventory forecasting',
        'Cost fluctuations',
        'Minimum order quantities',
        'Quality control',
        'Last-mile delivery',
        'Returns management',
        'Sustainability concerns',
        'No significant challenges'
      ],
      required: true,
      category: 'operations'
    },
    {
      id: 'seasonality',
      question: 'How seasonal is your business?',
      type: 'select',
      options: [
        'Highly seasonal (more than 50% of revenue in one season)',
        'Moderately seasonal (30-50% revenue in one season)',
        'Slightly seasonal (some fluctuation throughout the year)',
        'Not seasonal (consistent year-round)'
      ],
      required: true,
      category: 'sales'
    },
    {
      id: 'marketingChannels',
      question: 'Which marketing channels drive the most traffic/sales? (Select top 3)',
      type: 'multiselect',
      options: [
        'Organic social media',
        'Paid social media ads',
        'Search engine optimization (SEO)',
        'Pay-per-click advertising (PPC)',
        'Email marketing',
        'Content marketing/blog',
        'Influencer marketing',
        'Traditional advertising',
        'Word of mouth/referrals',
        'In-store promotions',
        'Marketplaces (Amazon, Etsy, etc.)',
        'Affiliate marketing'
      ],
      required: true,
      category: 'marketing'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default retailTemplate;