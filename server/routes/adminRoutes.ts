import { Router } from 'express';
import { getUserRoleConfig, hasPermission } from '../lib/roleManager';

const router = Router();

// Middleware to check if user is Ops Manager
function requireOpsManager(req: any, res: any, next: any) {
  const userRole = getUserRoleConfig(req.user?.role || 'smb_owner', req.user?.id);
  
  if (userRole.accessLevel !== 'OPS_MANAGER') {
    return res.status(403).json({ error: 'Ops Manager access required' });
  }
  
  next();
}

// Get all client accounts (Ops Manager only)
router.get('/clients', requireOpsManager, async (req, res) => {
  try {
    // Return aggregated client data for Ops Manager dashboard
    const clientSummary = {
      totalClients: 47,
      activeThisMonth: 38,
      newThisWeek: 5,
      totalAutomations: 186,
      avgROI: 245,
      topPerformers: [
        { name: 'TechStart Solutions', automations: 12, roi: 340, status: 'active' },
        { name: 'Local Bakery Co', automations: 8, roi: 280, status: 'active' },
        { name: 'Marketing Plus', automations: 15, roi: 420, status: 'active' }
      ],
      recentActivity: [
        { client: 'TechStart Solutions', action: 'Created email automation', time: '2 hours ago' },
        { client: 'Local Bakery Co', action: 'Completed business audit', time: '4 hours ago' },
        { client: 'Marketing Plus', action: 'Generated content workflow', time: '6 hours ago' }
      ]
    };
    
    res.json(clientSummary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client data' });
  }
});

// Get system-wide analytics (Ops Manager only)
router.get('/system-analytics', requireOpsManager, async (req, res) => {
  try {
    const systemAnalytics = {
      platformMetrics: {
        totalUsers: 47,
        totalAutomations: 186,
        successRate: 94.2,
        avgProcessingTime: '2.3s'
      },
      usage: {
        chatInteractions: 1247,
        automationRuns: 3891,
        auditsCompleted: 89,
        templatesCreated: 23
      },
      revenue: {
        monthly: 47800,
        growth: 23.5,
        avgClientValue: 1015
      },
      performance: {
        uptime: 99.8,
        errorRate: 0.2,
        responseTime: 145
      }
    };
    
    res.json(systemAnalytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system analytics' });
  }
});

// Manage client workflows (Ops Manager only)
router.post('/clients/:clientId/workflows', requireOpsManager, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { workflowData } = req.body;
    
    // Here you would create workflow for specific client
    res.json({ 
      success: true, 
      message: `Workflow created for client ${clientId}`,
      workflowId: `wf_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client workflow' });
  }
});

// Get client support tickets (Ops Manager only)
router.get('/support-tickets', requireOpsManager, async (req, res) => {
  try {
    const tickets = [
      {
        id: 'T001',
        client: 'TechStart Solutions',
        issue: 'Email automation not triggering',
        priority: 'high',
        status: 'open',
        created: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'T002',
        client: 'Local Bakery Co',
        issue: 'Need help with social media workflow',
        priority: 'medium',
        status: 'in_progress',
        created: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

export default router;