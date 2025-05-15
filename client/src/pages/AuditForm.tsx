import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuditFormData } from "@/lib/auditTypes";
import { useIndustries, useTemplates } from "@/hooks/useTemplates";
import SimpleAuditForm from "@/components/SimpleAuditForm";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Template-related state and hooks
  const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
  const [formType, setFormType] = useState<'classic' | 'template'>('classic');

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

  // Industry options
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
    { value: "other", label: "Other" },
  ];

  // Handle template form submission using the same mutation
  const handleTemplateFormSubmit = (data: AuditFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container-custom">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Business Audit Tool</h1>
        <p className="text-gray-600">
          Complete this form to receive a personalized business analysis with AI-powered recommendations.
        </p>
      </div>

      <Tabs
        defaultValue="classic"
        value={formType}
        onValueChange={(value) => setFormType(value as 'classic' | 'template')}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="classic">Classic Form</TabsTrigger>
          <TabsTrigger value="template">Industry Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="template">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Industry-Specific Audit</h3>
                <p className="text-gray-600">
                  Our industry-specific templates provide tailored questions for your business type.
                  Get more relevant insights and recommendations!
                </p>
              </div>
              {isTemplatesLoading ? (
                <div className="flex justify-center p-4">Loading templates...</div>
              ) : (
                <SimpleAuditForm 
                  onSubmit={handleTemplateFormSubmit} 
                  isLoading={mutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classic">
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

          {formType === 'classic' && (
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
                        
                        {/* More fields for step 1 would go here */}
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

                {/* Step 2+ would be implemented here */}

                {step === 4 && (
                  <Card className="form-card">
                    <CardContent className="p-6 md:p-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Final Step</h2>
                      
                      {/* Step 4 fields would go here */}
                      
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}