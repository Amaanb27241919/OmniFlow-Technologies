import { type Audit } from "@shared/schema";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

interface ShareableReport {
  id: string;
  auditId: number;
  shareToken: string;
  businessName: string;
  reportData: any;
  createdAt: Date;
  expiresAt: Date;
  viewCount: number;
  isPublic: boolean;
}

// File-based storage for shared reports
const SHARES_FILE = path.join(process.cwd(), 'shared-reports.json');

class ShareService {
  async createShareableReport(audit: Audit): Promise<{ shareToken: string; shareUrl: string }> {
    const shareToken = crypto.randomBytes(32).toString('hex');
    const shareId = crypto.randomBytes(16).toString('hex');
    
    // Create shareable report data
    const shareableReport: ShareableReport = {
      id: shareId,
      auditId: audit.id,
      shareToken,
      businessName: audit.businessName,
      reportData: {
        businessName: audit.businessName,
        industry: audit.industry,
        employeeCount: audit.employeeCount,
        currentChallenges: audit.currentChallenges,
        mainGoals: audit.mainGoals,
        results: audit.results,
        recommendations: audit.recommendations,
        createdAt: audit.createdAt,
        // Remove sensitive data like contact info
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      viewCount: 0,
      isPublic: false
    };

    // Save to file-based storage
    await this.saveShareableReport(shareableReport);

    const shareUrl = `${process.env.REPL_SLUG || 'localhost:5000'}/shared-report/${shareToken}`;
    return { shareToken, shareUrl };
  }

  async getSharedReport(shareToken: string): Promise<ShareableReport | null> {
    const reports = await this.loadSharedReports();
    const report = reports.find(r => r.shareToken === shareToken);
    
    if (!report || report.expiresAt < new Date()) {
      return null;
    }

    // Increment view count
    report.viewCount += 1;
    await this.saveAllReports(reports);

    return report;
  }

  async generateShareableHTML(report: ShareableReport): Promise<string> {
    const { reportData } = report;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Automation Report - ${reportData.businessName}</title>
    <meta name="description" content="Business automation assessment results and recommendations for ${reportData.businessName}">
    <meta property="og:title" content="Business Automation Report - ${reportData.businessName}">
    <meta property="og:description" content="AI-powered business automation assessment and recommendations">
    <meta property="og:type" content="article">
    <link rel="stylesheet" href="/omniflow-styles.css">
    <style>
        .shared-report {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }
        .report-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .report-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
            border-left: 4px solid var(--primary-blue);
        }
        .recommendation-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 3px solid #10b981;
        }
        .share-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #666;
        }
        .branding {
            margin-top: 30px;
            text-align: center;
        }
        .print-button {
            background: var(--primary-blue);
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin: 10px;
        }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="shared-report">
        <div class="report-header">
            <h1>Business Automation Assessment</h1>
            <h2>${reportData.businessName}</h2>
            <p>Generated on ${new Date(reportData.createdAt).toLocaleDateString()}</p>
            <div class="no-print">
                <button onclick="window.print()" class="print-button">📄 Print Report</button>
                <button onclick="downloadPDF()" class="print-button">📥 Download PDF</button>
            </div>
        </div>

        <div class="report-section">
            <h3>📊 Business Overview</h3>
            <p><strong>Industry:</strong> ${reportData.industry}</p>
            <p><strong>Team Size:</strong> ${reportData.employeeCount}</p>
            <p><strong>Main Goals:</strong> ${reportData.mainGoals}</p>
            <p><strong>Current Challenges:</strong> ${reportData.currentChallenges}</p>
        </div>

        <div class="report-section">
            <h3>🎯 Assessment Results</h3>
            <div>${reportData.results || 'Assessment results pending...'}</div>
        </div>

        <div class="report-section">
            <h3>💡 AI Recommendations</h3>
            ${this.formatRecommendations(reportData.recommendations)}
        </div>

        <div class="share-footer no-print">
            <p>This report was generated by OmniFlow AI-powered business assessment.</p>
            <p>Views: ${report.viewCount} | Generated: ${new Date(report.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="branding">
            <h3>OmniFlow</h3>
            <p>Assessment-First Automation</p>
            <p>Get your own assessment at: <a href="/">omni-flow.net</a></p>
        </div>
    </div>

    <script>
        function downloadPDF() {
            window.print();
        }
    </script>
</body>
</html>`;
  }

  private formatRecommendations(recommendations: any): string {
    if (!recommendations) return '<p>Recommendations are being generated...</p>';
    
    if (typeof recommendations === 'string') {
      return `<div class="recommendation-item">${recommendations}</div>`;
    }
    
    if (Array.isArray(recommendations)) {
      return recommendations
        .map(rec => `<div class="recommendation-item">${rec}</div>`)
        .join('');
    }
    
    return '<div class="recommendation-item">Custom automation recommendations based on your assessment.</div>';
  }

  private async loadSharedReports(): Promise<ShareableReport[]> {
    try {
      const data = await fs.readFile(SHARES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveShareableReport(report: ShareableReport): Promise<void> {
    const reports = await this.loadSharedReports();
    reports.push(report);
    await this.saveAllReports(reports);
  }

  private async saveAllReports(reports: ShareableReport[]): Promise<void> {
    await fs.writeFile(SHARES_FILE, JSON.stringify(reports, null, 2));
  }

  async generateShareButtons(shareUrl: string, businessName: string): Promise<string> {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`Check out the business automation assessment for ${businessName}`);
    
    return `
      <div class="share-buttons">
        <button onclick="copyToClipboard('${shareUrl}')" class="share-btn">
          📋 Copy Link
        </button>
        <a href="mailto:?subject=Business Automation Report&body=${encodedText}%0A%0A${encodedUrl}" 
           class="share-btn">
          📧 Email
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" 
           target="_blank" class="share-btn">
          💼 LinkedIn
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" 
           target="_blank" class="share-btn">
          🐦 Twitter
        </a>
      </div>
      
      <script>
        function copyToClipboard(text) {
          navigator.clipboard.writeText(text).then(() => {
            alert('Link copied to clipboard!');
          });
        }
      </script>
    `;
  }
}

export const shareService = new ShareService();