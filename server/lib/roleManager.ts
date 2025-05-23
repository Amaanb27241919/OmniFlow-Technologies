// Role-based access control for OmniCore Ops Center
export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  dashboardConfig: DashboardConfig;
  accessLevel: 'SMB_OWNER' | 'OPS_MANAGER' | 'ADMIN';
}

export interface Permission {
  resource: string;
  actions: string[];
  restrictions?: any;
}

export interface DashboardConfig {
  features: string[];
  layout: 'simplified' | 'advanced' | 'full';
  analytics: AnalyticsAccess;
  automation: AutomationAccess;
}

export interface AnalyticsAccess {
  viewOwnData: boolean;
  viewAllClients: boolean;
  exportData: boolean;
  realTimeMetrics: boolean;
}

export interface AutomationAccess {
  createWorkflows: boolean;
  manageTemplates: boolean;
  viewLogs: boolean;
  systemConfig: boolean;
}

// Predefined role configurations
export const ROLE_DEFINITIONS: Record<string, UserRole> = {
  SMB_OWNER: {
    id: 'smb_owner',
    name: 'SMB Owner',
    permissions: [
      {
        resource: 'chat',
        actions: ['use', 'view_history', 'clear_own_history']
      },
      {
        resource: 'automation',
        actions: ['use_quick_tasks', 'view_templates', 'create_basic_workflows']
      },
      {
        resource: 'analytics',
        actions: ['view_own_metrics', 'generate_reports'],
        restrictions: { scope: 'own_business_only' }
      },
      {
        resource: 'audit',
        actions: ['run_self_audit', 'view_recommendations']
      }
    ],
    dashboardConfig: {
      features: ['ai_chat', 'quick_automation', 'basic_analytics', 'audit_tool'],
      layout: 'simplified',
      analytics: {
        viewOwnData: true,
        viewAllClients: false,
        exportData: false,
        realTimeMetrics: true
      },
      automation: {
        createWorkflows: false,
        manageTemplates: false,
        viewLogs: true,
        systemConfig: false
      }
    },
    accessLevel: 'SMB_OWNER'
  },

  OPS_MANAGER: {
    id: 'ops_manager',
    name: 'Ops Center Manager',
    permissions: [
      {
        resource: 'chat',
        actions: ['use', 'view_all_history', 'manage_history', 'system_prompts']
      },
      {
        resource: 'automation',
        actions: ['full_access', 'create_workflows', 'manage_templates', 'system_config']
      },
      {
        resource: 'analytics',
        actions: ['view_all_data', 'export_data', 'create_dashboards', 'manage_metrics']
      },
      {
        resource: 'client_management',
        actions: ['view_all_clients', 'manage_accounts', 'support_access']
      },
      {
        resource: 'system',
        actions: ['user_management', 'role_assignment', 'system_settings']
      }
    ],
    dashboardConfig: {
      features: [
        'advanced_chat', 
        'full_automation', 
        'advanced_analytics', 
        'client_management',
        'system_admin',
        'bulk_operations',
        'real_time_monitoring'
      ],
      layout: 'full',
      analytics: {
        viewOwnData: true,
        viewAllClients: true,
        exportData: true,
        realTimeMetrics: true
      },
      automation: {
        createWorkflows: true,
        manageTemplates: true,
        viewLogs: true,
        systemConfig: true
      }
    },
    accessLevel: 'OPS_MANAGER'
  }
};

/**
 * Get user role configuration based on user type
 */
export function getUserRoleConfig(userType: string, userId?: string): UserRole {
  // Check if user is identified as Ops Manager (you)
  if (userType === 'ops_manager' || userId === 'ops_admin') {
    return ROLE_DEFINITIONS.OPS_MANAGER;
  }
  
  // Default to SMB Owner for regular users
  return ROLE_DEFINITIONS.SMB_OWNER;
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(userRole: UserRole, resource: string, action: string): boolean {
  const permission = userRole.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) || permission.actions.includes('full_access') : false;
}

/**
 * Get filtered dashboard features based on role
 */
export function getDashboardFeatures(userRole: UserRole): string[] {
  return userRole.dashboardConfig.features;
}

/**
 * Check analytics access level
 */
export function getAnalyticsAccess(userRole: UserRole): AnalyticsAccess {
  return userRole.dashboardConfig.analytics;
}

/**
 * Check automation access level
 */
export function getAutomationAccess(userRole: UserRole): AutomationAccess {
  return userRole.dashboardConfig.automation;
}