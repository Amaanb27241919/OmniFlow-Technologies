import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuditFormData } from "@/lib/auditTypes";
import { useTemplates } from "@/hooks/useTemplates";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InsightTooltip from "@/components/ui/tooltip-insight";
import { Combobox } from "@/components/ui/combobox";

export default function AuditForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
  
  // Pre-load common tooltips when the form loads to reduce API calls and improve UX
  const { data: preloadedTooltips } = useQuery({
    queryKey: ['/api/tooltips'],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnWindowFocus: false,
  });
  
  const [formData, setFormData] = useState<AuditFormData>({
    businessName: "",
    industry: "",
    subIndustry: "",
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
    additionalInfo: "",
    // Track form metadata
    formType: "standard", // Add a field to track what type of form was used (standard or industry-specific)
    templateId: "" // Track which template was used if industry-specific
  });

  const mutation = useMutation({
    mutationFn: async (data: AuditFormData) => {
      const response = await apiRequest("POST", "/api/audits", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Audit completed!",
        description: "Your business audit has been processed successfully.",
      });
      navigate(`/results/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error submitting audit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "industry" && value) {
      // Update templateId when industry changes and reset subIndustry
      const matchingTemplate = templates?.find(t => t.industry === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subIndustry: "", // Reset sub-industry when industry changes
        templateId: matchingTemplate?.id || "",
        formType: "industry"
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
  
  // Sub-industry options based on selected industry
  const subIndustryOptions: Record<string, string[]> = {
    retail: [
      'Fashion & Apparel', 
      'Electronics', 
      'Home Goods', 
      'Grocery', 
      'Specialty Retail',
      'Online Marketplace',
      'Direct-to-Consumer Brand'
    ],
    professional_services: [
      'Legal Services', 
      'Accounting', 
      'Consulting', 
      'Marketing Agency',
      'Design Services',
      'Business Coaching'
    ],
    healthcare: [
      'Medical Practice', 
      'Dentistry', 
      'Wellness & Fitness', 
      'Mental Health',
      'Telemedicine',
      'Medical Device',
      'Health Tech'
    ],
    manufacturing: [
      'Food & Beverage', 
      'Electronics', 
      'Automotive', 
      'Furniture',
      'Pharmaceuticals',
      'Custom Fabrication',
      'Industrial Equipment'
    ],
    technology: [
      'Software Development', 
      'IT Services', 
      'Web Development', 
      'Mobile Apps',
      'SaaS',
      'Cybersecurity',
      'AI & Machine Learning',
      'Cloud Services'
    ],
    finance: [
      'Banking', 
      'Insurance', 
      'Financial Planning', 
      'Tax Services',
      'Investment Management',
      'Cryptocurrency',
      'Payment Processing'
    ],
    education: [
      'K-12 School', 
      'Higher Education', 
      'Professional Training', 
      'Online Education',
      'Language Learning',
      'Educational Technology',
      'Tutoring Services'
    ],
    hospitality: [
      'Restaurant', 
      'Hotel', 
      'Travel Agency', 
      'Event Planning',
      'Food Service',
      'Short-term Rental',
      'Tour Operator'
    ],
    construction: [
      'Residential Building', 
      'Commercial Construction', 
      'Remodeling', 
      'Specialty Contractor',
      'Architecture',
      'Interior Design',
      'Green Building',
      'Engineering Services'
    ],
    other: [
      'Arts & Entertainment',
      'Agriculture',
      'Transportation & Logistics',
      'Energy',
      'Environmental Services',
      'Real Estate',
      'Non-profit',
      'Other Services'
    ]
  };

  return (
    <div className="container-custom">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Business Audit Tool</h1>
        <p className="text-gray-600">
          Complete this form to receive a personalized business analysis with AI-powered recommendations.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <span className="ml-1">
                      <InsightTooltip field="businessName" industry={formData.industry}>
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Tip: A strong business name is memorable and reflects your brand values.</p>
                        </div>
                      </InsightTooltip>
                    </span>
                  </div>
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
                  <div className="flex items-center">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <span className="ml-1">
                      <InsightTooltip field="industry" industry={formData.industry}>
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Tip: Understanding industry benchmarks helps position your business competitively.</p>
                        </div>
                      </InsightTooltip>
                    </span>
                  </div>
                  <Combobox
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    options={industryOptions}
                    placeholder="Select an industry"
                    className="w-full"
                    required
                  />
                </div>
              </div>
              
              {formData.industry && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <label htmlFor="subIndustry" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Industry
                    </label>
                    <span className="ml-1">
                      <InsightTooltip field="subIndustry" industry={formData.industry}>
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Tip: Specifying your sub-industry helps tailor recommendations to your specific business context.</p>
                        </div>
                      </InsightTooltip>
                    </span>
                  </div>
                  <Combobox
                    id="subIndustry"
                    name="subIndustry"
                    value={formData.subIndustry}
                    onChange={handleChange}
                    options={formData.industry && subIndustryOptions[formData.industry] ? 
                            subIndustryOptions[formData.industry] : []}
                    placeholder="Select a sub-industry"
                    className="w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="businessAge" className="block text-sm font-medium text-gray-700 mb-1">
                    How long have you been in business?
                  </label>
                  <Combobox
                    id="businessAge"
                    name="businessAge"
                    value={formData.businessAge}
                    onChange={handleChange}
                    options={[
                      "Less than 1 year",
                      "1-3 years",
                      "3-5 years",
                      "5-10 years",
                      "More than 10 years"
                    ]}
                    placeholder="Select business age"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees
                  </label>
                  <Combobox
                    id="employees"
                    name="employees"
                    value={formData.employees}
                    onChange={handleChange}
                    options={[
                      "1-5",
                      "6-15",
                      "16-50",
                      "51-200",
                      "201+"
                    ]}
                    placeholder="Select employee count"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center">
                    <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Revenue
                    </label>
                    <span className="ml-1">
                      <InsightTooltip field="monthlyRevenue" industry={formData.industry}>
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Tip: Monthly revenue patterns reveal business seasonality and growth opportunities.</p>
                        </div>
                      </InsightTooltip>
                    </span>
                  </div>
                  <Combobox
                    id="monthlyRevenue"
                    name="monthlyRevenue"
                    value={formData.monthlyRevenue}
                    onChange={handleChange}
                    options={[
                      "Less than $10,000",
                      "$10,000 - $50,000",
                      "$50,000 - $100,000",
                      "$100,000 - $500,000",
                      "More than $500,000"
                    ]}
                    placeholder="Select monthly revenue"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center">
                    <label htmlFor="profitMargin" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Profit Margin
                    </label>
                    <span className="ml-1">
                      <InsightTooltip field="profitMargin" industry={formData.industry}>
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Tip: Profit margins indicate business efficiency and pricing strategy effectiveness.</p>
                        </div>
                      </InsightTooltip>
                    </span>
                  </div>
                  <Combobox
                    id="profitMargin"
                    name="profitMargin"
                    value={formData.profitMargin}
                    onChange={handleChange}
                    options={[
                      "Less than 10%",
                      "10-20%",
                      "21-30%",
                      "31-40%",
                      "More than 40%"
                    ]}
                    placeholder="Select profit margin"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="revenueIncreased" className="block text-sm font-medium text-gray-700 mb-1">
                    Has your revenue increased in the last year?
                  </label>
                  <select
                    id="revenueIncreased"
                    name="revenueIncreased"
                    value={formData.revenueIncreased}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Same">Stayed the same</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="primaryExpense" className="block text-sm font-medium text-gray-700 mb-1">
                    What is your primary expense?
                  </label>
                  <select
                    id="primaryExpense"
                    name="primaryExpense"
                    value={formData.primaryExpense}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Select primary expense</option>
                    <option value="Labor">Labor</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Rent">Rent/Facilities</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="usesAutomation" className="block text-sm font-medium text-gray-700 mb-1">
                    Do you use automation tools for your business?
                  </label>
                  <select
                    id="usesAutomation"
                    name="usesAutomation"
                    value={formData.usesAutomation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700 mb-1">
                    What is your primary source of leads/customers?
                  </label>
                  <select
                    id="leadSource"
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Select lead source</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Paid Ads">Paid Advertising</option>
                    <option value="SEO">Search Engine/SEO</option>
                    <option value="Events">Events/Tradeshows</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What are your primary business goals? (Select all that apply)
                  </label>
                  <span className="ml-1">
                    <InsightTooltip field="businessGoals" industry={formData.industry}>
                      <div className="p-2 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">Tip: Prioritizing business goals helps focus resources on activities with the highest impact.</p>
                      </div>
                    </InsightTooltip>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["Increase Revenue", "Reduce Costs", "Improve Customer Satisfaction", 
                    "Expand to New Markets", "Streamline Operations", "Increase Profit Margins",
                    "Grow Customer Base"].map(goal => (
                    <div key={goal} className="flex items-center">
                      <input
                        id={`goal-${goal}`}
                        name="businessGoals"
                        type="checkbox"
                        value={goal}
                        checked={formData.businessGoals.includes(goal)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`goal-${goal}`} className="ml-2 text-sm text-gray-700">
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What are your biggest business challenges? (Select all that apply)
                  </label>
                  <span className="ml-1">
                    <InsightTooltip field="biggestChallenges" industry={formData.industry}>
                      <div className="p-2 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">Tip: Identifying your biggest challenges is the first step toward developing strategic solutions.</p>
                      </div>
                    </InsightTooltip>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["Finding New Customers", "Managing Cash Flow", "Hiring/Retaining Talent", 
                    "Managing Time", "Staying Competitive", "Using Technology Effectively",
                    "Marketing Effectively", "Scaling Operations"].map(challenge => (
                    <div key={challenge} className="flex items-center">
                      <input
                        id={`challenge-${challenge}`}
                        name="biggestChallenges"
                        type="checkbox"
                        value={challenge}
                        checked={formData.biggestChallenges.includes(challenge)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`challenge-${challenge}`} className="ml-2 text-sm text-gray-700">
                        {challenge}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us about your specific business challenges or goals
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
            
            <div className="mt-6">
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Submitting..." : "Submit for Analysis"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}