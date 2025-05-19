import { InsertAudit } from "@shared/schema";
import { WorkflowModule } from "@/lib/auditTypes";

/**
 * OmniFlow module details to recommend based on audit responses
 */
const omniFlowModules: Record<string, WorkflowModule> = {
  omniBot: {
    name: "OmniBot",
    description: "Automated lead nurturing and customer engagement solution",
    integrationPoints: [
      "Customer onboarding",
      "Lead qualification",
      "Follow-up sequences",
      "Appointment scheduling"
    ],
    benefits: [
      "Reduce manual follow-up by 80%",
      "Increase conversion rates by 25%",
      "Ensure consistent communication",
      "Scale outreach without additional staff"
    ],
    icon: "bot",
    businessArea: "marketing",
    estimatedTimeToImplement: "2-4 weeks",
    estimatedCostSavings: "$1,500-$3,000 per month",
    estimatedRoi: "250% within 6 months",
    implementationSteps: [
      {
        title: "Define Your Customer Journey",
        description: "Map out your ideal customer journey from initial contact to conversion",
        actions: [
          {
            description: "Document your current lead handling process",
            timeEstimate: "2-3 hours",
            difficulty: "easy"
          },
          {
            description: "Identify key conversion points and bottlenecks",
            timeEstimate: "2-3 hours",
            difficulty: "medium"
          },
          {
            description: "Define ideal communication frequency and touchpoints",
            timeEstimate: "1-2 hours",
            difficulty: "easy",
            resources: ["Customer journey template", "OmniFlow documentation"]
          }
        ],
        expectedOutcome: "Clear documentation of your customer journey and conversion points",
        priority: "high"
      },
      {
        title: "Set Up Automated Email Sequences",
        description: "Create targeted email sequences for different customer segments",
        actions: [
          {
            description: "Segment your customer list based on behavior and needs",
            timeEstimate: "3-4 hours",
            difficulty: "medium"
          },
          {
            description: "Write email templates for each segment and stage",
            timeEstimate: "4-6 hours",
            difficulty: "medium",
            resources: ["Email template library", "OmniBot email examples"]
          },
          {
            description: "Set up triggers and timing for each sequence",
            timeEstimate: "2-3 hours",
            difficulty: "easy"
          }
        ],
        expectedOutcome: "Fully automated email nurturing sequences for each customer segment",
        priority: "high"
      },
      {
        title: "Integrate with Your CRM",
        description: "Connect OmniBot with your existing customer database",
        actions: [
          {
            description: "Verify data structure compatibility",
            timeEstimate: "1-2 hours",
            difficulty: "medium"
          },
          {
            description: "Set up API connection between systems",
            timeEstimate: "2-4 hours",
            difficulty: "hard",
            resources: ["OmniFlow integration guides", "CRM documentation"]
          },
          {
            description: "Test data flow between systems",
            timeEstimate: "2-3 hours",
            difficulty: "medium"
          }
        ],
        expectedOutcome: "Seamless two-way data synchronization between OmniBot and your CRM",
        priority: "medium"
      }
    ]
  },
  omniAgent: {
    name: "OmniAgent",
    description: "AI-powered virtual assistant for customer support and task automation",
    integrationPoints: [
      "Customer support",
      "Frequently asked questions",
      "Basic troubleshooting",
      "Information gathering"
    ],
    benefits: [
      "24/7 customer support coverage",
      "Reduce support ticket volume by 40%",
      "Faster response times",
      "Consistent customer experience"
    ],
    icon: "user-check",
    businessArea: "customer_service",
    estimatedTimeToImplement: "3-6 weeks",
    estimatedCostSavings: "$2,000-$4,000 per month",
    estimatedRoi: "300% within 12 months",
    implementationSteps: [
      {
        title: "Build Your Knowledge Base",
        description: "Compile frequently asked questions and common customer issues",
        actions: [
          {
            description: "Analyze customer support tickets from the last 3 months",
            timeEstimate: "4-6 hours",
            difficulty: "medium"
          },
          {
            description: "Categorize issues by frequency and complexity",
            timeEstimate: "2-3 hours",
            difficulty: "easy"
          },
          {
            description: "Create standardized answers for common questions",
            timeEstimate: "6-8 hours",
            difficulty: "medium",
            resources: ["Knowledge base template", "Customer query database"]
          }
        ],
        expectedOutcome: "Comprehensive knowledge base covering 80% of common customer questions",
        priority: "high"
      },
      {
        title: "Train Your Virtual Assistant",
        description: "Configure the AI assistant with your business-specific information",
        actions: [
          {
            description: "Import your knowledge base into OmniAgent",
            timeEstimate: "1-2 hours",
            difficulty: "easy"
          },
          {
            description: "Configure business rules and escalation paths",
            timeEstimate: "3-4 hours",
            difficulty: "medium",
            resources: ["OmniAgent configuration guide"]
          },
          {
            description: "Train the AI on your specific terminology and products",
            timeEstimate: "4-6 hours",
            difficulty: "hard"
          }
        ],
        expectedOutcome: "AI assistant capable of handling basic customer inquiries without human intervention",
        priority: "high"
      },
      {
        title: "Deploy Customer-Facing Channels",
        description: "Implement the virtual assistant across customer communication channels",
        actions: [
          {
            description: "Set up website chat widget integration",
            timeEstimate: "2-3 hours",
            difficulty: "medium"
          },
          {
            description: "Configure email support integration",
            timeEstimate: "2-3 hours",
            difficulty: "medium"
          },
          {
            description: "Test across multiple scenarios and edge cases",
            timeEstimate: "4-6 hours",
            difficulty: "medium",
            resources: ["Test scenario templates", "OmniAgent testing guide"]
          }
        ],
        expectedOutcome: "Seamless customer experience across all support channels",
        priority: "medium"
      }
    ]
  },
  omniAI: {
    name: "OmniAI",
    description: "Predictive analytics and decision support system",
    integrationPoints: [
      "Sales forecasting",
      "Customer behavior prediction",
      "Inventory optimization",
      "Risk assessment"
    ],
    benefits: [
      "Improve decision accuracy by 35%",
      "Identify trends before competitors",
      "Optimize resource allocation",
      "Reduce operational costs"
    ],
    icon: "brain-circuit",
    businessArea: "sales",
    estimatedTimeToImplement: "6-12 weeks",
    estimatedCostSavings: "$5,000-$20,000 per quarter",
    estimatedRoi: "200% within 18 months",
    implementationSteps: [
      {
        title: "Data Assessment and Preparation",
        description: "Evaluate your current data and prepare it for analysis",
        actions: [
          {
            description: "Audit existing data sources and quality",
            timeEstimate: "5-8 hours",
            difficulty: "medium"
          },
          {
            description: "Standardize data formats across systems",
            timeEstimate: "8-16 hours",
            difficulty: "hard"
          },
          {
            description: "Define key metrics and KPIs for tracking",
            timeEstimate: "3-4 hours",
            difficulty: "medium",
            resources: ["Data preparation guide", "KPI definition template"]
          }
        ],
        expectedOutcome: "Clean, standardized data ready for predictive analysis",
        priority: "high"
      },
      {
        title: "Model Development and Training",
        description: "Create predictive models based on your business objectives",
        actions: [
          {
            description: "Select appropriate prediction models for your goals",
            timeEstimate: "3-4 hours",
            difficulty: "medium"
          },
          {
            description: "Train models with historical data",
            timeEstimate: "6-12 hours",
            difficulty: "hard",
            resources: ["OmniAI model selection guide"]
          },
          {
            description: "Validate model accuracy against known outcomes",
            timeEstimate: "4-6 hours",
            difficulty: "hard"
          }
        ],
        expectedOutcome: "Validated predictive models customized for your business",
        priority: "high"
      },
      {
        title: "Insight Dashboard Creation",
        description: "Build actionable dashboards for business decision-makers",
        actions: [
          {
            description: "Design custom dashboards for each department",
            timeEstimate: "6-8 hours",
            difficulty: "medium"
          },
          {
            description: "Set up automated alerts for significant changes",
            timeEstimate: "3-4 hours",
            difficulty: "medium"
          },
          {
            description: "Create documentation and training for users",
            timeEstimate: "4-6 hours",
            difficulty: "easy",
            resources: ["Dashboard template library", "User guide template"]
          }
        ],
        expectedOutcome: "User-friendly dashboards providing actionable business insights",
        priority: "medium"
      }
    ]
  },
  omniForge: {
    name: "OmniForge",
    description: "Customizable workflow automation builder",
    integrationPoints: [
      "Document processing",
      "Approval workflows",
      "Data entry and validation",
      "Cross-platform integrations"
    ],
    benefits: [
      "Reduce process completion time by 60%",
      "Eliminate manual data entry errors",
      "Create consistent business processes",
      "Integrate with existing tools"
    ],
    icon: "layers",
    businessArea: "operations",
    estimatedTimeToImplement: "4-8 weeks",
    estimatedCostSavings: "$3,000-$6,000 per month",
    estimatedRoi: "350% within 12 months",
    implementationSteps: [
      {
        title: "Process Mapping and Analysis",
        description: "Document and analyze current manual processes",
        actions: [
          {
            description: "Identify repetitive manual processes in your business",
            timeEstimate: "4-6 hours",
            difficulty: "medium"
          },
          {
            description: "Document current workflows with process maps",
            timeEstimate: "6-10 hours",
            difficulty: "medium"
          },
          {
            description: "Calculate time and cost of current processes",
            timeEstimate: "3-4 hours",
            difficulty: "easy",
            resources: ["Process mapping template", "ROI calculator"]
          }
        ],
        expectedOutcome: "Prioritized list of processes for automation with estimated ROI",
        priority: "high"
      },
      {
        title: "Workflow Design and Configuration",
        description: "Build automated workflows in the OmniForge platform",
        actions: [
          {
            description: "Design optimized process workflows",
            timeEstimate: "8-12 hours",
            difficulty: "medium"
          },
          {
            description: "Configure triggers, actions, and conditionals",
            timeEstimate: "6-10 hours",
            difficulty: "hard",
            resources: ["OmniForge workflow templates", "Configuration guide"]
          },
          {
            description: "Set up approval paths and exception handling",
            timeEstimate: "4-6 hours",
            difficulty: "medium"
          }
        ],
        expectedOutcome: "Fully configured automated workflows ready for testing",
        priority: "high"
      },
      {
        title: "Testing and Deployment",
        description: "Test and roll out automated workflows to your team",
        actions: [
          {
            description: "Conduct parallel testing with existing processes",
            timeEstimate: "8-12 hours",
            difficulty: "medium"
          },
          {
            description: "Train staff on new workflows",
            timeEstimate: "4-8 hours",
            difficulty: "easy"
          },
          {
            description: "Roll out to production with monitoring",
            timeEstimate: "6-8 hours",
            difficulty: "medium",
            resources: ["Training materials", "Testing protocol guide"]
          }
        ],
        expectedOutcome: "Smoothly operating automated workflows with trained staff",
        priority: "medium"
      }
    ]
  },
  omniConnect: {
    name: "OmniConnect",
    description: "Integration platform for connecting business systems",
    integrationPoints: [
      "CRM integration",
      "Accounting software",
      "Marketing platforms",
      "Project management tools"
    ],
    benefits: [
      "Centralize business data",
      "Eliminate data silos",
      "Reduce context switching",
      "Create a unified business ecosystem"
    ],
    icon: "git-branch",
    businessArea: "general",
    estimatedTimeToImplement: "4-10 weeks",
    estimatedCostSavings: "$4,000-$8,000 per month",
    estimatedRoi: "280% within 12 months",
    implementationSteps: [
      {
        title: "System Audit and Integration Planning",
        description: "Evaluate your current systems and plan integration strategy",
        actions: [
          {
            description: "Document all current software systems and data flows",
            timeEstimate: "6-8 hours",
            difficulty: "medium"
          },
          {
            description: "Identify integration priorities and dependencies",
            timeEstimate: "3-4 hours",
            difficulty: "medium"
          },
          {
            description: "Create a phased integration roadmap",
            timeEstimate: "4-6 hours",
            difficulty: "medium",
            resources: ["System inventory template", "Integration roadmap guide"]
          }
        ],
        expectedOutcome: "Comprehensive integration plan with clear priorities",
        priority: "high"
      },
      {
        title: "Data Mapping and Transformation",
        description: "Map data fields between systems and create transformation rules",
        actions: [
          {
            description: "Create detailed data field mapping between systems",
            timeEstimate: "8-16 hours",
            difficulty: "hard"
          },
          {
            description: "Define data transformation and normalization rules",
            timeEstimate: "6-10 hours",
            difficulty: "hard",
            resources: ["Data mapping template", "Transformation rule examples"]
          },
          {
            description: "Build sample data transformations and validate",
            timeEstimate: "4-8 hours",
            difficulty: "medium"
          }
        ],
        expectedOutcome: "Complete data mapping documentation with transformation rules",
        priority: "high"
      },
      {
        title: "Connection Setup and Testing",
        description: "Establish connections between systems and validate data flow",
        actions: [
          {
            description: "Configure API connections for each system",
            timeEstimate: "8-16 hours",
            difficulty: "hard"
          },
          {
            description: "Set up automated synchronization schedules",
            timeEstimate: "3-4 hours",
            difficulty: "medium"
          },
          {
            description: "Test end-to-end data flow across all systems",
            timeEstimate: "6-12 hours",
            difficulty: "medium",
            resources: ["API documentation", "Testing protocol guide"]
          }
        ],
        expectedOutcome: "Functioning integration with reliable data synchronization",
        priority: "medium"
      }
    ]
  }
};

/**
 * Generate workflow recommendations based on audit responses
 */
export function generateWorkflowRecommendations(formData: InsertAudit): WorkflowModule[] {
  const recommendations: WorkflowModule[] = [];
  
  // Lead management and customer acquisition recommendations
  if (formData.biggestChallenges?.includes('CustomerAcquisition') || 
      formData.leadSource === 'Referrals' || 
      (formData.tracksCAC === 'no' && formData.businessGoals?.includes('IncreaseRevenue'))) {
    const module = {...omniFlowModules.omniBot};
    
    // Customize business area based on specific business context
    if (formData.industry === 'retail' || formData.industry === 'ecommerce') {
      module.businessArea = 'sales';
      module.estimatedRoi = '300% within 5 months';
    } else if (formData.industry === 'professional_services') {
      module.businessArea = 'marketing';
      module.estimatedCostSavings = '$2,500-$4,500 per month';
    }
    
    recommendations.push(module);
  }
  
  // Customer support and operational efficiency
  if (formData.biggestChallenges?.includes('TimeManagement') || 
      formData.employees === '1' || 
      formData.employees === '2-5') {
    const module = {...omniFlowModules.omniAgent};
    
    // Customize based on team size
    if (formData.employees === '1') {
      module.estimatedTimeToImplement = '2-4 weeks';
      module.estimatedCostSavings = '$1,000-$2,500 per month';
    } else if (formData.employees === '10-25' || formData.employees === '> 25') {
      module.estimatedTimeToImplement = '5-8 weeks';
      module.estimatedCostSavings = '$4,000-$8,000 per month';
    }
    
    recommendations.push(module);
  }
  
  // Business intelligence and predictive analytics
  if (formData.businessGoals?.includes('EnterNewMarkets') || 
      formData.biggestChallenges?.includes('Competition') || 
      (formData.tracksCAC === 'yes' && 
       ['$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '> $100,000'].includes(formData.monthlyRevenue))) {
    const module = {...omniFlowModules.omniAI};
    
    // Customize based on business size and revenue
    if (formData.monthlyRevenue === '> $100,000') {
      module.estimatedCostSavings = '$8,000-$25,000 per quarter';
      module.estimatedRoi = '350% within 18 months';
    }
    
    recommendations.push(module);
  }
  
  // Process automation for administrative tasks
  if (formData.usesAutomation === 'no' || 
      formData.primaryExpense === 'Staff/Labor' || 
      formData.biggestChallenges?.includes('TimeManagement')) {
    const module = {...omniFlowModules.omniForge};
    
    // Customize based on current automation level
    if (formData.usesAutomation === 'no') {
      module.estimatedTimeToImplement = '3-6 weeks';
      module.estimatedRoi = '400% within 12 months';
    }
    
    recommendations.push(module);
  }
  
  // Integration between systems
  if (formData.automationTools && formData.automationTools.length >= 2 ||
      formData.biggestChallenges?.includes('Technology')) {
    const module = {...omniFlowModules.omniConnect};
    
    // Customize based on number of existing tools
    if (formData.automationTools && formData.automationTools.length >= 4) {
      module.estimatedTimeToImplement = '6-12 weeks';
      module.estimatedCostSavings = '$6,000-$12,000 per month';
      module.estimatedRoi = '320% within 12 months';
    }
    
    recommendations.push(module);
  }
  
  // If no specific recommendations, suggest the most applicable general solutions
  if (recommendations.length === 0) {
    // For small businesses with growth goals, suggest automation
    if (formData.businessGoals?.includes('IncreaseRevenue')) {
      recommendations.push(omniFlowModules.omniForge);
    }
    
    // For businesses with marketing challenges, suggest lead nurturing
    if (formData.leadSource || formData.tracksCAC === 'no') {
      recommendations.push(omniFlowModules.omniBot);
    }
  }
  
  // Limit to 3 most relevant recommendations
  return recommendations.slice(0, 3);
}