import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuditFormData } from "@/lib/auditTypes";

interface Props {
  onSubmit: (data: AuditFormData) => void;
  isLoading?: boolean;
}

export default function SimpleAuditForm({ onSubmit, isLoading = false }: Props) {
  const [formData, setFormData] = useState<AuditFormData>({
    businessName: "",
    industry: "",
    businessAge: "",
    employees: "",
    monthlyRevenue: "",
    profitMargin: "",
    revenueIncreased: "",
    primaryExpense: "",
    usesAutomation: "",
    automationTools: [],
    leadSource: "",
    tracksCAC: "",
    businessGoals: [],
    biggestChallenges: [],
    additionalInfo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'automationTools' || name === 'businessGoals' || name === 'biggestChallenges') {
      setFormData(prev => {
        const currentArray = [...(prev[name] as string[])];
        
        if (checked) {
          return { ...prev, [name]: [...currentArray, value] };
        } else {
          return { 
            ...prev, 
            [name]: currentArray.filter(item => item !== value) 
          };
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const industryOptions = [
    { value: "retail", label: "Retail" },
    { value: "professional_services", label: "Professional Services" },
    { value: "healthcare", label: "Healthcare" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "hospitality", label: "Hospitality" },
    { value: "construction", label: "Construction" },
    { value: "other", label: "Other" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Industry-Specific Audit</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select your industry to get tailored questions and recommendations
              </p>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select an industry</option>
                  {industryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="businessAge" className="block text-sm font-medium text-gray-700 mb-1">
                  How long have you been in business?
                </label>
                <select
                  id="businessAge"
                  name="businessAge"
                  value={formData.businessAge}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select business age</option>
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="More than 10 years">More than 10 years</option>
                </select>
              </div>
              
              <div className="mt-4">
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us about your specific business challenges
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit for Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}