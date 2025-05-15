/**
 * Types for the template library
 */

// Base question interface
export interface AuditQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'number';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  category?: string;
}

// Template interface
export interface AuditTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: string;
  questions: AuditQuestion[];
  createdAt: string;
  updatedAt: string;
}

// Industry type
export type Industry = 
  | 'retail'
  | 'professional_services'
  | 'healthcare'
  | 'manufacturing'
  | 'technology'
  | 'finance'
  | 'education'
  | 'hospitality'
  | 'construction'
  | 'other';

// Template category
export type TemplateCategory = 
  | 'general'
  | 'operations'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'hr'
  | 'it'
  | 'customer_service';