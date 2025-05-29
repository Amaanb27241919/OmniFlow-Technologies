// Email Automation Integration
// This module integrates with email services to send automated nurturing sequences

import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

export interface EmailConfig {
  provider: 'sendgrid' | 'mailchimp' | 'smtp';
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailAutomationService {
  private config: EmailConfig | null = null;
  private sentEmailsFile = './sent_emails.json';

  constructor() {
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    // Check for email service configuration
    if (process.env.SENDGRID_API_KEY) {
      this.config = {
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'hello@omniflow.com',
        fromName: process.env.FROM_NAME || 'OmniFlow Team'
      };
    } else if (process.env.SMTP_HOST) {
      this.config = {
        provider: 'smtp',
        fromEmail: process.env.FROM_EMAIL || 'hello@omniflow.com',
        fromName: process.env.FROM_NAME || 'OmniFlow Team',
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        }
      };
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    leadId?: string
  ): Promise<EmailSendResult> {
    if (!this.config) {
      // Log email for manual sending if no service configured
      await this.logEmailForManualSend(to, subject, content, leadId);
      return {
        success: true,
        messageId: `logged-${Date.now()}`
      };
    }

    try {
      let result: EmailSendResult;

      switch (this.config.provider) {
        case 'sendgrid':
          result = await this.sendViaSendGrid(to, subject, content);
          break;
        case 'smtp':
          result = await this.sendViaSmtp(to, subject, content);
          break;
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }

      // Log sent email
      await this.logSentEmail(to, subject, content, leadId, result);
      
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      
      // Fallback to logging for manual send
      await this.logEmailForManualSend(to, subject, content, leadId);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendViaSendGrid(
    to: string,
    subject: string,
    content: string
  ): Promise<EmailSendResult> {
    // Dynamic import to avoid dependency issues if SendGrid isn't installed
    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(this.config!.apiKey!);

      const msg = {
        to,
        from: {
          email: this.config!.fromEmail,
          name: this.config!.fromName
        },
        subject,
        html: this.formatEmailHtml(content),
        text: this.stripHtmlTags(content)
      };

      const response = await sgMail.default.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string
      };
    } catch (error) {
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  private async sendViaSmtp(
    to: string,
    subject: string,
    content: string
  ): Promise<EmailSendResult> {
    // Dynamic import for nodemailer
    try {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.default.createTransporter(this.config!.smtpConfig!);

      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to,
        subject,
        html: this.formatEmailHtml(content),
        text: this.stripHtmlTags(content)
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      throw new Error(`SMTP error: ${error}`);
    }
  }

  private formatEmailHtml(content: string): string {
    // Convert plain text to HTML format with OmniFlow branding
    const htmlContent = content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OmniFlow</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a202c; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #718096; }
          .btn { display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #e6f3ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OmniFlow</h1>
            <p>AI Ops & Automation Platform</p>
          </div>
          <div class="content">
            <p>${htmlContent}</p>
          </div>
          <div class="footer">
            <p>© 2024 OmniFlow. All rights reserved.</p>
            <p>You received this email because you requested information about our automation services.</p>
            <p><a href="#" style="color: #718096;">Unsubscribe</a> | <a href="#" style="color: #718096;">Update Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private async logEmailForManualSend(
    to: string,
    subject: string,
    content: string,
    leadId?: string
  ): Promise<void> {
    const emailLog = {
      timestamp: new Date().toISOString(),
      to,
      subject,
      content,
      leadId,
      status: 'pending_manual_send',
      type: 'nurturing_sequence'
    };

    try {
      const existingLogs = await this.readEmailLogs();
      existingLogs.push(emailLog);
      await writeFile('./emails_to_send.json', JSON.stringify(existingLogs, null, 2));
      
      console.log(`Email logged for manual sending to: ${to}`);
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  private async logSentEmail(
    to: string,
    subject: string,
    content: string,
    leadId: string | undefined,
    result: EmailSendResult
  ): Promise<void> {
    const emailLog = {
      timestamp: new Date().toISOString(),
      to,
      subject,
      content,
      leadId,
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error
    };

    try {
      const existingLogs = await this.readSentEmailLogs();
      existingLogs.push(emailLog);
      await writeFile(this.sentEmailsFile, JSON.stringify(existingLogs, null, 2));
    } catch (error) {
      console.error('Error logging sent email:', error);
    }
  }

  private async readEmailLogs(): Promise<any[]> {
    try {
      if (existsSync('./emails_to_send.json')) {
        const data = await readFile('./emails_to_send.json', 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading email logs:', error);
    }
    return [];
  }

  private async readSentEmailLogs(): Promise<any[]> {
    try {
      if (existsSync(this.sentEmailsFile)) {
        const data = await readFile(this.sentEmailsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading sent email logs:', error);
    }
    return [];
  }

  async getEmailStatus(): Promise<{
    configured: boolean;
    provider?: string;
    pendingEmails: number;
    sentToday: number;
  }> {
    const pendingLogs = await this.readEmailLogs();
    const sentLogs = await this.readSentEmailLogs();
    
    const today = new Date().toISOString().split('T')[0];
    const sentToday = sentLogs.filter(log => 
      log.timestamp.startsWith(today) && log.status === 'sent'
    ).length;

    return {
      configured: this.config !== null,
      provider: this.config?.provider,
      pendingEmails: pendingLogs.filter(log => log.status === 'pending_manual_send').length,
      sentToday
    };
  }

  // Get emails that need to be sent manually
  async getPendingEmails(): Promise<any[]> {
    const logs = await this.readEmailLogs();
    return logs.filter(log => log.status === 'pending_manual_send');
  }

  // Mark email as manually sent
  async markEmailAsSent(index: number): Promise<void> {
    try {
      const logs = await this.readEmailLogs();
      if (logs[index]) {
        logs[index].status = 'manually_sent';
        logs[index].sentAt = new Date().toISOString();
        await writeFile('./emails_to_send.json', JSON.stringify(logs, null, 2));
      }
    } catch (error) {
      console.error('Error marking email as sent:', error);
    }
  }
}

export const emailService = new EmailAutomationService();