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
import FormProgress from "@/components/FormProgress";
import AuditReview from "@/components/AuditReview";

export default function AuditForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
  
  // Track form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // 4 content steps + 1 review step
  
  // Step titles and information
  const stepTitles = [
    "Business Information",
    "Business Metrics",
    "Operations & Growth",
    "Business Strategy",
    "Review Your Submission"
  ];
  
  // Validation logic for each step before moving to next
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Business Information
        return !!formData.businessName && !!formData.industry;
      case 2: // Business Metrics
        return !!formData.businessAge && !!formData.employees && 
               !!formData.monthlyRevenue && !!formData.profitMargin;
      case 3: // Operations & Growth
        return !!formData.revenueIncreased && !!formData.primaryExpense && 
               !!formData.usesAutomation;
      case 4: // Business Strategy
        return !!formData.leadSource && formData.businessGoals.length > 0 && 
               formData.biggestChallenges.length > 0;
      case 5: // Review step - no validation needed
        return true;
      default:
        return true;
    }
  };
  
  // Pre-load common tooltips when the form loads to reduce API calls and improve UX
  const { data: preloadedTooltips } = useQuery({
    queryKey: ['/api/tooltips'],
    enabled: true, // Always fetch when component mounts
  });

  // Default form state
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
    formType: "standard"
  });

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (data: AuditFormData) => {
      // Create a new object to avoid modifying the original data
      const submissionData = { ...data };
      
      // Ensure array fields are properly handled
      // Make sure automationTools is an array
      if (!Array.isArray(submissionData.automationTools)) {
        submissionData.automationTools = submissionData.automationTools ? [submissionData.automationTools] : [];
      }
      
      // Make sure businessGoals is an array
      if (!Array.isArray(submissionData.businessGoals)) {
        submissionData.businessGoals = submissionData.businessGoals ? [submissionData.businessGoals] : [];
      }
      
      // Make sure biggestChallenges is an array
      if (!Array.isArray(submissionData.biggestChallenges)) {
        submissionData.biggestChallenges = submissionData.biggestChallenges ? [submissionData.biggestChallenges] : [];
      }
      
      console.log("Submitting form data:", submissionData);
      
      // Use the updated apiRequest function
      return await apiRequest("/api/audits", {
        method: "POST",
        body: JSON.stringify(submissionData)
      });
    },
    onSuccess: (data) => {
      navigate(`/results/${data.id}`);
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your audit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === "businessGoals" || name === "biggestChallenges" || name === "automationTools") {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...prev[name], value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: prev[name].filter((item: string) => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  // Step navigation functions with validation
  const goToNextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0); // Scroll to top when moving to next step
    } else if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all the required information before proceeding.",
        variant: "destructive",
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0); // Scroll to top when moving to previous step
    }
  };

  // Final submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      goToNextStep();
    } else {
      mutation.mutate(formData);
    }
  };
  
  // Render different content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Business Information
        return (
          <div className="space-y-6">
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
              <div>
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
          </div>
        );
      
      case 2: // Business Metrics
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        );
      
      case 3: // Operations & Growth
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="revenueIncreased" className="block text-sm font-medium text-gray-700 mb-1">
                  Has your revenue increased in the last year?
                </label>
                <Combobox
                  id="revenueIncreased"
                  name="revenueIncreased"
                  value={formData.revenueIncreased}
                  onChange={handleChange}
                  options={[
                    "Yes",
                    "No",
                    "Stayed the same"
                  ]}
                  placeholder="Select an option"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="primaryExpense" className="block text-sm font-medium text-gray-700 mb-1">
                  What is your primary expense?
                </label>
                <Combobox
                  id="primaryExpense"
                  name="primaryExpense"
                  value={formData.primaryExpense}
                  onChange={handleChange}
                  options={[
                    "Labor",
                    "Inventory",
                    "Marketing",
                    "Rent/Facilities",
                    "Technology",
                    "Other"
                  ]}
                  placeholder="Select primary expense"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="usesAutomation" className="block text-sm font-medium text-gray-700 mb-1">
                Do you use automation tools for your business?
              </label>
              <Combobox
                id="usesAutomation"
                name="usesAutomation"
                value={formData.usesAutomation}
                onChange={handleChange}
                options={[
                  "Yes",
                  "No",
                  "Not sure"
                ]}
                placeholder="Select an option"
                className="w-full"
                required
              />
            </div>

            {formData.usesAutomation === "Yes" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Which automation tools do you use? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["CRM", "Email Marketing", "Social Media", "Accounting", 
                    "Project Management", "Inventory", "Customer Support",
                    "Payment Processing"].map(tool => (
                    <div key={tool} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tool-${tool}`}
                        name="automationTools"
                        value={tool}
                        checked={formData.automationTools.includes(tool)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`tool-${tool}`} className="ml-2 block text-sm text-gray-700">
                        {tool}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 4: // Business Strategy
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700 mb-1">
                What is your primary source of leads/customers?
              </label>
              <Combobox
                id="leadSource"
                name="leadSource"
                value={formData.leadSource}
                onChange={handleChange}
                options={[
                  "Referrals",
                  "Social Media",
                  "Paid Advertising",
                  "Search Engine/SEO",
                  "Events/Tradeshows",
                  "Other"
                ]}
                placeholder="Select lead source"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="tracksCAC" className="block text-sm font-medium text-gray-700 mb-1">
                Do you track your customer acquisition cost (CAC)?
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id="tracksCAC-yes"
                    name="tracksCAC"
                    type="radio"
                    value="Yes"
                    checked={formData.tracksCAC === "Yes"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="tracksCAC-yes" className="ml-2 block text-sm text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tracksCAC-no"
                    name="tracksCAC"
                    type="radio"
                    value="No"
                    checked={formData.tracksCAC === "No"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="tracksCAC-no" className="ml-2 block text-sm text-gray-700">
                    No
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tracksCAC-not-sure"
                    name="tracksCAC"
                    type="radio"
                    value="Not sure"
                    checked={formData.tracksCAC === "Not sure"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="tracksCAC-not-sure" className="ml-2 block text-sm text-gray-700">
                    Not sure
                  </label>
                </div>
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
                      type="checkbox"
                      id={`goal-${goal}`}
                      name="businessGoals"
                      value={goal}
                      checked={formData.businessGoals.includes(goal)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`goal-${goal}`} className="ml-2 block text-sm text-gray-700">
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
                      type="checkbox"
                      id={`challenge-${challenge}`}
                      name="biggestChallenges"
                      value={challenge}
                      checked={formData.biggestChallenges.includes(challenge)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`challenge-${challenge}`} className="ml-2 block text-sm text-gray-700">
                      {challenge}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Any additional information you'd like to share?
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please share any other details you think would help us provide better recommendations..."
              ></textarea>
            </div>
          </div>
        );
      
      case 5: // Review step
        return <AuditReview formData={formData} />;
      
      default:
        return null;
    }
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
      'Marketing & PR', 
      'Consulting', 
      'IT Services',
      'Design Services',
      'Business Strategy'
    ],
    healthcare: [
      'Medical Practice', 
      'Mental Health', 
      'Fitness & Wellness', 
      'Home Healthcare', 
      'Telehealth',
      'Medical Supplies',
      'Healthcare Technology'
    ],
    manufacturing: [
      'Food & Beverage', 
      'Textiles', 
      'Electronics', 
      'Machinery', 
      'Custom Manufacturing',
      'Consumer Goods',
      'Industrial Products'
    ],
    technology: [
      'Software Development', 
      'Web Development', 
      'App Development', 
      'Cybersecurity', 
      'Cloud Services',
      'Data Analytics',
      'AI Solutions'
    ],
    finance: [
      'Financial Advising', 
      'Bookkeeping', 
      'Tax Services', 
      'Insurance', 
      'Lending',
      'Investing',
      'Financial Technology'
    ],
    education: [
      'Tutoring', 
      'Online Courses', 
      'Continuing Education', 
      'Test Preparation', 
      'Early Childhood',
      'K-12 Education',
      'Educational Technology'
    ],
    hospitality: [
      'Restaurant', 
      'Cafe', 
      'Bar', 
      'Hotel/Lodging', 
      'Event Planning',
      'Travel Services',
      'Tourism'
    ],
    construction: [
      'General Contracting', 
      'Electrical', 
      'Plumbing', 
      'Residential', 
      'Commercial',
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
        <h2 className="text-2xl font-bold text-gray-900">Business Audit Form</h2>
        <p className="text-gray-500 mt-1">
          Fill out this form to receive a comprehensive audit of your business
        </p>
      </div>

      {/* Progress indicator */}
      <FormProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitles={stepTitles} 
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dynamically rendered form content based on current step */}
            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="pt-6 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                >
                  Previous
                </Button>
              ) : (
                <div></div> // Empty div to maintain layout with flexbox
              )}

              <Button
                type={currentStep === totalSteps ? "submit" : "button"}
                onClick={currentStep === totalSteps ? undefined : goToNextStep}
                disabled={mutation.isPending}
              >
                {currentStep === totalSteps 
                  ? (mutation.isPending ? "Submitting..." : "Submit Audit") 
                  : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}