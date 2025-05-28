// Enterprise API Layer for third-party integrations and marketplace features
class EnterpriseAPI {
  constructor() {
    this.initializeAPI();
  }

  initializeAPI() {
    this.apiEndpoints = {
      // Core Platform APIs
      '/api/v1/users': {
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        auth: 'required',
        rateLimit: '100/hour',
        description: 'User management and profile operations'
      },
      '/api/v1/automations': {
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        auth: 'required',
        rateLimit: '50/hour',
        description: 'Automation blueprint management'
      },
      '/api/v1/analytics': {
        methods: ['GET'],
        auth: 'required',
        rateLimit: '200/hour',
        description: 'Analytics and reporting data'
      },
      '/api/v1/ai': {
        methods: ['POST'],
        auth: 'required',
        rateLimit: '10/minute',
        description: 'AI processing and model routing'
      },
      '/api/v1/webhooks': {
        methods: ['POST'],
        auth: 'api_key',
        rateLimit: '1000/hour',
        description: 'Webhook endpoints for integrations'
      }
    };

    this.webhookHandlers = new Map();
    this.apiKeys = new Map();
    this.integrations = new Map();
    this.setupIntegrations();
  }

  setupIntegrations() {
    // Zapier Integration
    this.integrations.set('zapier', {
      name: 'Zapier',
      description: 'Connect OmniCore to 5000+ apps',
      webhookUrl: '/api/v1/integrations/zapier',
      authType: 'api_key',
      triggers: [
        'automation_completed',
        'user_upgraded',
        'milestone_achieved',
        'support_ticket_created'
      ],
      actions: [
        'create_automation',
        'send_notification',
        'update_user_tier',
        'generate_report'
      ]
    });

    // Slack Integration
    this.integrations.set('slack', {
      name: 'Slack',
      description: 'Real-time notifications and team collaboration',
      webhookUrl: '/api/v1/integrations/slack',
      authType: 'oauth',
      capabilities: [
        'automation_alerts',
        'milestone_notifications',
        'support_escalations',
        'team_updates'
      ]
    });

    // HubSpot Integration
    this.integrations.set('hubspot', {
      name: 'HubSpot',
      description: 'CRM and marketing automation sync',
      webhookUrl: '/api/v1/integrations/hubspot',
      authType: 'oauth',
      syncFields: [
        'contact_info',
        'lead_scores',
        'automation_results',
        'engagement_data'
      ]
    });

    // Stripe Integration
    this.integrations.set('stripe', {
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      webhookUrl: '/api/v1/integrations/stripe',
      authType: 'webhook_secret',
      events: [
        'payment_succeeded',
        'subscription_created',
        'subscription_updated',
        'invoice_paid'
      ]
    });
  }

  // API Key Management
  generateAPIKey(userId, name, permissions = []) {
    const apiKey = `omni_${this.generateRandomString(32)}`;
    
    const keyData = {
      key: apiKey,
      userId,
      name,
      permissions,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
      rateLimit: this.getRateLimitForUser(userId),
      active: true
    };

    this.apiKeys.set(apiKey, keyData);
    return keyData;
  }

  validateAPIKey(apiKey) {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData || !keyData.active) {
      return null;
    }

    // Update usage
    keyData.lastUsed = new Date().toISOString();
    keyData.usageCount++;

    return keyData;
  }

  // Webhook Management
  registerWebhook(userId, url, events, secret = null) {
    const webhookId = `hook_${this.generateRandomString(16)}`;
    
    const webhook = {
      id: webhookId,
      userId,
      url,
      events,
      secret,
      active: true,
      createdAt: new Date().toISOString(),
      deliveryCount: 0,
      failureCount: 0
    };

    this.webhookHandlers.set(webhookId, webhook);
    return webhook;
  }

  async triggerWebhook(event, data) {
    const relevantWebhooks = Array.from(this.webhookHandlers.values())
      .filter(webhook => webhook.active && webhook.events.includes(event));

    const deliveryPromises = relevantWebhooks.map(webhook => 
      this.deliverWebhook(webhook, event, data)
    );

    await Promise.allSettled(deliveryPromises);
  }

  async deliverWebhook(webhook, event, data) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id
      };

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'OmniCore-Webhooks/1.0'
      };

      if (webhook.secret) {
        headers['X-OmniCore-Signature'] = this.signPayload(payload, webhook.secret);
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        timeout: 10000
      });

      webhook.deliveryCount++;
      
      if (!response.ok) {
        webhook.failureCount++;
        console.warn(`Webhook delivery failed: ${webhook.url} - ${response.status}`);
      }

    } catch (error) {
      webhook.failureCount++;
      console.error(`Webhook delivery error: ${webhook.url}`, error);
    }
  }

  // Third-party Integration Handlers
  handleZapierIntegration(triggerData) {
    return {
      success: true,
      data: {
        id: triggerData.id,
        type: triggerData.type,
        timestamp: new Date().toISOString(),
        user_id: triggerData.userId,
        automation_result: triggerData.result,
        metadata: triggerData.metadata
      }
    };
  }

  handleSlackIntegration(notificationData) {
    const slackMessage = {
      text: notificationData.message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${notificationData.title}*\n${notificationData.message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `OmniCore • ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    if (notificationData.actionUrl) {
      slackMessage.blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details'
            },
            url: notificationData.actionUrl
          }
        ]
      });
    }

    return slackMessage;
  }

  handleHubSpotIntegration(contactData) {
    return {
      properties: {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        company: contactData.businessName,
        omnicore_tier: contactData.tier,
        omnicore_signup_date: contactData.createdAt,
        omnicore_usage_score: contactData.usageScore || 0,
        omnicore_conversion_probability: contactData.conversionProbability || 0
      }
    };
  }

  handleStripeIntegration(eventData) {
    const { type, data } = eventData;

    switch (type) {
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(data.object);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(data.object);
      case 'invoice.payment_succeeded':
        return this.handlePaymentSucceeded(data.object);
      default:
        return { handled: false, type };
    }
  }

  // API Documentation Generator
  generateAPIDocumentation() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'OmniCore Enterprise API',
        version: '1.0.0',
        description: 'Enterprise API for OmniCore automation platform',
        contact: {
          name: 'OmniCore API Support',
          email: 'api-support@omnicore.com'
        }
      },
      servers: [
        {
          url: 'https://api.omnicore.com/v1',
          description: 'Production server'
        },
        {
          url: 'https://sandbox-api.omnicore.com/v1',
          description: 'Sandbox server'
        }
      ],
      paths: this.generateAPIPaths(),
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          },
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };
  }

  generateAPIPaths() {
    const paths = {};
    
    Object.entries(this.apiEndpoints).forEach(([path, config]) => {
      paths[path] = {};
      
      config.methods.forEach(method => {
        paths[path][method.toLowerCase()] = {
          summary: `${method} ${path}`,
          description: config.description,
          security: config.auth === 'required' ? [{ BearerAuth: [] }] : [{ ApiKeyAuth: [] }],
          responses: {
            '200': { description: 'Success' },
            '401': { description: 'Unauthorized' },
            '429': { description: 'Rate limit exceeded' }
          }
        };
      });
    });

    return paths;
  }

  // Helper methods
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getRateLimitForUser(userId) {
    // In production, this would check user tier and return appropriate limits
    return {
      requests: 1000,
      window: 'hour'
    };
  }

  signPayload(payload, secret) {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  handleSubscriptionCreated(subscription) {
    return {
      action: 'upgrade_user_tier',
      userId: subscription.metadata.user_id,
      tier: subscription.metadata.tier,
      subscriptionId: subscription.id
    };
  }

  handleSubscriptionUpdated(subscription) {
    return {
      action: 'update_subscription',
      userId: subscription.metadata.user_id,
      status: subscription.status,
      subscriptionId: subscription.id
    };
  }

  handlePaymentSucceeded(invoice) {
    return {
      action: 'process_payment',
      userId: invoice.customer_metadata?.user_id,
      amount: invoice.amount_paid,
      invoiceId: invoice.id
    };
  }
}

module.exports = EnterpriseAPI;