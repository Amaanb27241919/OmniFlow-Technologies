import { AuditTemplate, Industry } from './templateTypes';
import generalTemplate from './industryTemplates/general';
import retailTemplate from './industryTemplates/retail';
import professionalServicesTemplate from './industryTemplates/professionalServices';
import technologyTemplate from './industryTemplates/technology';

// Import placeholders for the remaining templates
// These would be replaced with actual templates when created
const placeholderTemplates: Record<string, AuditTemplate> = {};

/**
 * Template manager class for handling industry-specific templates
 */
export class TemplateManager {
  private templates: Map<Industry | 'general', AuditTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize templates
   */
  private initializeTemplates(): void {
    // Add all industry templates to the map
    this.templates.set('general', generalTemplate);
    
    // Add implemented industry templates
    this.templates.set('retail', retailTemplate);
    this.templates.set('professional_services', professionalServicesTemplate);
    this.templates.set('technology', technologyTemplate);

    // For industries where we don't have specific templates yet,
    // we'll use the general template with the industry name
    const missingIndustries: Industry[] = [
      'healthcare',
      'manufacturing',
      'finance',
      'education',
      'hospitality',
      'construction',
      'other'
    ];

    // Create placeholder templates for missing industries
    for (const industry of missingIndustries) {
      const industryName = industry
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      this.templates.set(industry, {
        ...generalTemplate,
        id: `${industry}-business-audit`,
        name: `${industryName} Business Audit`,
        industry: industry,
        description: `A business audit template for ${industryName.toLowerCase()} companies`,
        icon: 'building'
      });
    }
  }

  /**
   * Get all available templates
   * @returns List of all templates
   */
  public getAllTemplates(): AuditTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by industry
   * @param industry Industry to get template for
   * @returns Template for the specified industry or general template if not found
   */
  public getTemplateByIndustry(industry: Industry | string): AuditTemplate {
    const normalizedIndustry = industry.toLowerCase().replace(/ /g, '_') as Industry;
    
    // Return the template for the specified industry or the general template
    return this.templates.get(normalizedIndustry) || this.templates.get('general') as AuditTemplate;
  }

  /**
   * Get template by ID
   * @param id Template ID
   * @returns Template with the specified ID or undefined if not found
   */
  public getTemplateById(id: string): AuditTemplate | undefined {
    for (const template of this.templates.values()) {
      if (template.id === id) {
        return template;
      }
    }
    return undefined;
  }

  /**
   * Get list of available industry templates
   * @returns List of available industry names
   */
  public getAvailableIndustries(): string[] {
    return Array.from(this.templates.keys())
      .filter(key => key !== 'general')
      .map(industry => {
        // Convert snake_case to Title Case
        return industry
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();