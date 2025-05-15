import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuditQuestion, AuditTemplate, AuditFormData } from "@/lib/auditTypes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIndustryTemplate } from "@/hooks/useTemplates";

interface Props {
  onSubmit: (data: AuditFormData) => void;
  defaultValues?: Partial<AuditFormData>;
  loading?: boolean;
}

export default function DynamicAuditForm({ onSubmit, defaultValues = {}, loading = false }: Props) {
  const [industry, setIndustry] = useState<string | null>(defaultValues.industry || null);
  const { data: template, isLoading: isTemplateLoading } = useIndustryTemplate(industry);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Build a dynamic Zod schema based on the template questions
  const buildValidationSchema = (questions: AuditQuestion[] = []) => {
    const schemaObj: Record<string, any> = {};
    
    questions.forEach(question => {
      if (question.required) {
        if (question.type === 'text' || question.type === 'textarea') {
          schemaObj[question.id] = z.string().min(1, "This field is required");
        } else if (question.type === 'select') {
          schemaObj[question.id] = z.string().min(1, "Please select an option");
        } else if (question.type === 'multiselect') {
          schemaObj[question.id] = z.array(z.string()).min(1, "Please select at least one option");
        } else if (question.type === 'checkbox') {
          schemaObj[question.id] = z.boolean().refine(val => val === true, "This field is required");
        } else if (question.type === 'number') {
          schemaObj[question.id] = z.number().min(0);
        }
      } else {
        if (question.type === 'text' || question.type === 'textarea') {
          schemaObj[question.id] = z.string().optional();
        } else if (question.type === 'select') {
          schemaObj[question.id] = z.string().optional();
        } else if (question.type === 'multiselect') {
          schemaObj[question.id] = z.array(z.string()).optional();
        } else if (question.type === 'checkbox') {
          schemaObj[question.id] = z.boolean().optional();
        } else if (question.type === 'number') {
          schemaObj[question.id] = z.number().optional();
        }
      }
    });
    
    return z.object(schemaObj);
  };
  
  // Group questions by category for multi-step form
  const getFormSteps = (questions: AuditQuestion[] = []) => {
    const categories = new Set(questions.map(q => q.category || 'general'));
    const steps = Array.from(categories).map(category => ({
      category,
      questions: questions.filter(q => (q.category || 'general') === category)
    }));
    return steps;
  };
  
  const steps = template ? getFormSteps(template.questions) : [];
  const currentQuestions = steps[currentStep]?.questions || [];
  const validationSchema = buildValidationSchema(currentQuestions);
  
  const form = useForm<AuditFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...defaultValues,
    },
  });
  
  const handleNext = async () => {
    const valid = await form.trigger();
    if (valid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = (data: AuditFormData) => {
    onSubmit(data);
  };
  
  // Handle industry change to load the correct template
  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    form.setValue('industry', value);
  };
  
  if (isTemplateLoading) {
    return <div className="text-center py-8">Loading audit template...</div>;
  }
  
  if (!template) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Select Industry</h2>
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What industry is your business in?</FormLabel>
              <Select 
                onValueChange={handleIndustryChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <p className="text-gray-600">{template.description}</p>
          
          {/* Progress indicator */}
          <div className="w-full mt-6 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm font-medium">{steps[currentStep]?.category}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {currentQuestions.map((question) => (
              <div key={question.id} className="mb-4">
                {renderFormField(question, form)}
              </div>
            ))}
            
            <div className="flex justify-between mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Audit"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

// Helper function to render the appropriate form field based on question type
function renderFormField(question: AuditQuestion, form: any) {
  const { id, type, options = [] } = question;
  
  switch (type) {
    case 'text':
      return (
        <FormField
          control={form.control}
          name={id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question.question}</FormLabel>
              <FormControl>
                <Input placeholder={question.placeholder} {...field} />
              </FormControl>
              {question.helpText && (
                <FormDescription>{question.helpText}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      
    case 'textarea':
      return (
        <FormField
          control={form.control}
          name={id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question.question}</FormLabel>
              <FormControl>
                <Textarea placeholder={question.placeholder} {...field} />
              </FormControl>
              {question.helpText && (
                <FormDescription>{question.helpText}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      
    case 'select':
      return (
        <FormField
          control={form.control}
          name={id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question.question}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {question.helpText && (
                <FormDescription>{question.helpText}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      
    case 'multiselect':
      return (
        <FormField
          control={form.control}
          name={id}
          render={() => (
            <FormItem>
              <FormLabel>{question.question}</FormLabel>
              <div className="space-y-2">
                {options.map((option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name={id}
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                return checked
                                  ? field.onChange([...currentValue, option])
                                  : field.onChange(
                                      currentValue.filter(
                                        (value: string) => value !== option
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {question.helpText && (
                <FormDescription>{question.helpText}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      
    case 'checkbox':
      return (
        <FormField
          control={form.control}
          name={id}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{question.question}</FormLabel>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );
      
    default:
      return null;
  }
}