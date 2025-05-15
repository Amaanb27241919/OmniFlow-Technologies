import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuditFormData } from "@/lib/auditTypes";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// Form schema using zod
const auditFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Please select an industry"),
  businessAge: z.string().min(1, "Please select how long you've been in business"),
  employees: z.string().min(1, "Please select number of employees"),
  monthlyRevenue: z.string().min(1, "Please select your monthly revenue"),
  profitMargin: z.string().min(1, "Please select your profit margin"),
  revenueIncreased: z.string().min(1, "Please select if your revenue has increased"),
  primaryExpense: z.string().min(1, "Please select your primary expense"),
  usesAutomation: z.string().min(1, "Please indicate if you use automation tools"),
  automationTools: z.array(z.string()).optional(),
  leadSource: z.string().min(1, "Please select your primary lead source"),
  tracksCAC: z.string().min(1, "Please indicate if you track customer acquisition cost"),
  businessGoals: z.array(z.string()).min(1, "Please select at least one business goal"),
  biggestChallenges: z.array(z.string()).min(1, "Please select at least one business challenge"),
  additionalInfo: z.string().optional(),
});

export default function AuditForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
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
      additionalInfo: "",
    },
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

  const nextStep = () => {
    const fieldsToValidate = getFieldsForCurrentStep();
    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setStep((prev) => Math.min(prev + 1, totalSteps));
        window.scrollTo(0, 0);
      }
    });
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    } else {
      navigate("/");
    }
  };

  const onSubmit = (data: AuditFormData) => {
    mutation.mutate(data);
  };

  const getFieldsForCurrentStep = (): (keyof AuditFormData)[] => {
    switch (step) {
      case 1:
        return ["businessName", "industry", "businessAge", "employees"];
      case 2:
        return ["monthlyRevenue", "profitMargin", "revenueIncreased", "primaryExpense"];
      case 3:
        return ["usesAutomation", "leadSource", "tracksCAC"];
      case 4:
        return ["businessGoals", "biggestChallenges"];
      default:
        return [];
    }
  };

  const industryOptions = [
    { value: "retail", label: "Retail" },
    { value: "service", label: "Service" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "tech", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ];

  const businessAgeOptions = [
    { value: "< 1 year", label: "Less than 1 year" },
    { value: "1-3 years", label: "1-3 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "5-10 years", label: "5-10 years" },
    { value: "> 10 years", label: "More than 10 years" },
  ];

  const employeeCountOptions = [
    { value: "1", label: "Just me" },
    { value: "2-5", label: "2-5" },
    { value: "6-10", label: "6-10" },
    { value: "11-25", label: "11-25" },
    { value: "26-50", label: "26-50" },
    { value: "51-100", label: "51-100" },
    { value: "> 100", label: "More than 100" },
  ];

  const revenueOptions = [
    { value: "< $1,000", label: "Less than $1,000" },
    { value: "$1,000 - $5,000", label: "$1,000 - $5,000" },
    { value: "$5,000 - $10,000", label: "$5,000 - $10,000" },
    { value: "$10,000 - $25,000", label: "$10,000 - $25,000" },
    { value: "$25,000 - $50,000", label: "$25,000 - $50,000" },
    { value: "$50,000 - $100,000", label: "$50,000 - $100,000" },
    { value: "> $100,000", label: "More than $100,000" },
  ];

  const profitMarginOptions = [
    { value: "< 10%", label: "Less than 10%" },
    { value: "10% - 20%", label: "10% - 20%" },
    { value: "20% - 30%", label: "20% - 30%" },
    { value: "30% - 40%", label: "30% - 40%" },
    { value: "> 40%", label: "More than 40%" },
    { value: "Not sure", label: "I'm not sure" },
  ];

  const expenseOptions = [
    { value: "Staff/Labor", label: "Staff/Labor" },
    { value: "Inventory/COGS", label: "Inventory/COGS" },
    { value: "Marketing/Advertising", label: "Marketing/Advertising" },
    { value: "Office/Facilities", label: "Office/Facilities" },
    { value: "Software/Technology", label: "Software/Technology" },
    { value: "Other", label: "Other" },
  ];

  const leadSourceOptions = [
    { value: "Referrals", label: "Referrals/Word of Mouth" },
    { value: "Social Media", label: "Social Media" },
    { value: "Paid Advertising", label: "Paid Advertising" },
    { value: "SEO/Organic", label: "SEO/Organic Search" },
    { value: "Events", label: "Events/Networking" },
    { value: "Email Marketing", label: "Email Marketing" },
    { value: "Other", label: "Other" },
  ];

  const automationToolOptions = [
    { id: "CRM", label: "CRM (Salesforce, HubSpot, etc.)" },
    { id: "Marketing", label: "Marketing Automation" },
    { id: "Accounting", label: "Accounting Software" },
    { id: "ProjectManagement", label: "Project Management" },
    { id: "Ecommerce", label: "E-commerce Platform" },
    { id: "CustomerSupport", label: "Customer Support" },
    { id: "Other", label: "Other" }
  ];

  const businessGoalOptions = [
    { id: "IncreaseRevenue", label: "Increase Revenue" },
    { id: "ImproveEfficiency", label: "Improve Operational Efficiency" },
    { id: "ExpandTeam", label: "Expand Team" },
    { id: "EnterNewMarkets", label: "Enter New Markets" },
    { id: "LaunchProducts", label: "Launch New Products/Services" },
    { id: "ReduceCosts", label: "Reduce Costs" },
    { id: "ImproveCustomerRetention", label: "Improve Customer Retention" }
  ];

  const challengeOptions = [
    { id: "CustomerAcquisition", label: "Customer Acquisition" },
    { id: "Cashflow", label: "Cash Flow Management" },
    { id: "TimeManagement", label: "Time Management" },
    { id: "MarketingStrategy", label: "Marketing Strategy" },
    { id: "Hiring", label: "Hiring/Retention" },
    { id: "Competition", label: "Competition" },
    { id: "Technology", label: "Technology/Systems" }
  ];

  return (
    <div className="container-custom">
      {/* Progress Bar */}
      <Card className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Your progress</span>
          <span className="text-sm font-medium text-primary">{step}/{totalSteps}</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${(step/totalSteps)*100}%` }}></div>
        </div>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: General Business Info */}
          {step === 1 && (
            <Card className="form-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">General Business Information</h2>
                
                <div className="form-section">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long have you been in business?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Business Age" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessAgeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Employee Count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employeeCountOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Financial Info */}
          {step === 2 && (
            <Card className="form-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Information</h2>
                
                <div className="form-section">
                  <FormField
                    control={form.control}
                    name="monthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your monthly revenue?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Monthly Revenue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {revenueOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your approximate profit margin?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Profit Margin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {profitMarginOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="revenueIncreased"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Has your revenue increased in the past year?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">No</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="not sure" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Not Sure</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="primaryExpense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your primary business expense?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Primary Expense" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Operations & Technology */}
          {step === 3 && (
            <Card className="form-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Operations & Technology</h2>
                
                <div className="form-section">
                  <FormField
                    control={form.control}
                    name="usesAutomation"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you currently use any automation tools?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("usesAutomation") === "yes" && (
                    <FormField
                      control={form.control}
                      name="automationTools"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Which automation tools do you use? (Select all that apply)</FormLabel>
                          </div>
                          <div className="space-y-2">
                            {automationToolOptions.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="automationTools"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...(field.value || []), item.id]
                                              : field.value?.filter(
                                                  (value) => value !== item.id
                                                ) || [];
                                            field.onChange(updatedValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="leadSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where do most of your leads/customers come from?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Primary Lead Source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leadSourceOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tracksCAC"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you track your customer acquisition cost (CAC)?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">No</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="not sure" />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Not Sure</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Business Goals & Challenges */}
          {step === 4 && (
            <Card className="form-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Goals & Challenges</h2>
                
                <div className="form-section">
                  <FormField
                    control={form.control}
                    name="businessGoals"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What are your top business goals for the next 12 months? (Select up to 3)</FormLabel>
                        </div>
                        <div className="space-y-2">
                          {businessGoalOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="businessGoals"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          const currentGoals = field.value || [];
                                          if (checked && currentGoals.length < 3) {
                                            field.onChange([...currentGoals, item.id]);
                                          } else if (!checked) {
                                            field.onChange(
                                              currentGoals.filter((value) => value !== item.id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="biggestChallenges"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What are your biggest business challenges currently? (Select up to 3)</FormLabel>
                        </div>
                        <div className="space-y-2">
                          {challengeOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="biggestChallenges"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          const currentChallenges = field.value || [];
                                          if (checked && currentChallenges.length < 3) {
                                            field.onChange([...currentChallenges, item.id]);
                                          } else if (!checked) {
                                            field.onChange(
                                              currentChallenges.filter((value) => value !== item.id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any additional information you'd like to share about your business?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share any specific challenges or goals not covered above..."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Submit & Get Results"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
