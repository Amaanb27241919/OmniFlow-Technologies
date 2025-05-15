import React from 'react';
import { AuditFormData } from '@/lib/auditTypes';

interface AuditReviewProps {
  formData: AuditFormData;
}

export default function AuditReview({ formData }: AuditReviewProps) {
  // Helper function to render array data
  const renderArray = (items: string[]) => {
    if (!items.length) return "None";
    return (
      <ul className="list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
        <p className="text-gray-500 mb-6">
          Please review all the information below before submitting your business audit.
          If you need to make changes, click the "Previous" button to go back to the relevant section.
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Business Name</p>
              <p className="text-gray-900">{formData.businessName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Industry</p>
              <p className="text-gray-900">{formData.industry}</p>
              {formData.subIndustry && (
                <p className="text-sm text-gray-600">Sub-industry: {formData.subIndustry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Business Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Business Age</p>
              <p className="text-gray-900">{formData.businessAge}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Team Size</p>
              <p className="text-gray-900">{formData.employees}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-gray-900">{formData.monthlyRevenue}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Profit Margin</p>
              <p className="text-gray-900">{formData.profitMargin}</p>
            </div>
          </div>
        </div>

        {/* Operations & Growth */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Operations & Growth</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue Increased in Last Year</p>
              <p className="text-gray-900">{formData.revenueIncreased}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Primary Expense</p>
              <p className="text-gray-900">{formData.primaryExpense}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Uses Automation Tools</p>
              <p className="text-gray-900">{formData.usesAutomation}</p>
            </div>
            {formData.usesAutomation === "Yes" && (
              <div>
                <p className="text-sm font-medium text-gray-500">Automation Tools</p>
                <div className="text-gray-900">{renderArray(formData.automationTools)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Business Strategy */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Business Strategy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Primary Lead Source</p>
              <p className="text-gray-900">{formData.leadSource}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tracks Customer Acquisition Cost</p>
              <p className="text-gray-900">{formData.tracksCAC}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Business Goals</p>
              <div className="text-gray-900">{renderArray(formData.businessGoals)}</div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Biggest Challenges</p>
              <div className="text-gray-900">{renderArray(formData.biggestChallenges)}</div>
            </div>
          </div>
        </div>

        {formData.additionalInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
            <p className="text-gray-900 whitespace-pre-line">{formData.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
}