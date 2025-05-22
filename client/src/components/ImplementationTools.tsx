import { useState } from "react";
import { WorkflowModule } from "@/lib/auditTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Download,
  CheckSquare,
  Bell,
  ExternalLink,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ImplementationToolsProps {
  auditId: number;
  module: WorkflowModule;
}

export default function ImplementationTools({ auditId, module }: ImplementationToolsProps) {
  const [activeTab, setActiveTab] = useState("progress");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("weekly");
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [notes, setNotes] = useState("");
  const moduleId = module.name.toLowerCase().replace(/\s+/g, '-');
  
  // Mock step data based on module
  const steps = [
    {
      id: 1,
      title: module.name === "OmniBot" ? "Define Your Customer Journey" : 
             module.name === "OmniAgent" ? "Build Your Knowledge Base" :
             module.name === "OmniAI" ? "Data Assessment and Preparation" :
             module.name === "OmniForge" ? "Process Mapping and Analysis" :
             module.name === "OmniConnect" ? "System Audit and Integration Planning" :
             "Define Your Implementation Goals",
      completed: false
    },
    {
      id: 2,
      title: module.name === "OmniBot" ? "Set Up Automated Email Sequences" : 
             module.name === "OmniAgent" ? "Train Your Virtual Assistant" :
             module.name === "OmniAI" ? "Model Development and Training" :
             module.name === "OmniForge" ? "Workflow Design and Configuration" :
             module.name === "OmniConnect" ? "Data Mapping and Transformation" :
             "Configure and Customize",
      completed: false
    },
    {
      id: 3,
      title: module.name === "OmniBot" ? "Integrate with Your CRM" : 
             module.name === "OmniAgent" ? "Deploy Customer-Facing Channels" :
             module.name === "OmniAI" ? "Insight Dashboard Creation" :
             module.name === "OmniForge" ? "Testing and Deployment" :
             module.name === "OmniConnect" ? "Connection Setup and Testing" :
             "Testing and Launch",
      completed: false
    }
  ];
  
  const [implementationSteps, setImplementationSteps] = useState(steps);
  
  // Fetch implementation progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/progress/${auditId}/${moduleId}`],
    enabled: activeTab === "progress",
    // Progress data is fetched from server, but for demo we'll use the state
    onSuccess: (data) => {
      if (data?.progress?.steps) {
        const updatedSteps = implementationSteps.map(step => {
          const serverStep = data.progress.steps.find((s: any) => s.id === step.id);
          return serverStep ? { ...step, completed: serverStep.completed } : step;
        });
        setImplementationSteps(updatedSteps);
        if (data.progress.notes) {
          setNotes(data.progress.notes);
        }
      }
    }
  });
  
  // Save progress mutation
  const progressMutation = useMutation({
    mutationFn: async () => {
      setLoading({...loading, saveProgress: true});
      const response = await apiRequest(`/api/progress/${auditId}`, {
        method: "POST",
        body: JSON.stringify({
          moduleId,
          steps: implementationSteps,
          notes
        })
      });
      setLoading({...loading, saveProgress: false});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your implementation progress has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Implementation guide download
  const handleDownloadGuide = async () => {
    try {
      setLoading({...loading, downloadGuide: true});
      const response = await apiRequest(`/api/guides/${moduleId}?auditId=${auditId}`, {
        method: "GET"
      });
      
      // In a real implementation, we would redirect to the PDF
      // For now, just show a success message
      toast({
        title: "Implementation Guide Ready",
        description: "Your guide has been generated and is ready for download.",
      });
      
      // Simulate download delay
      setTimeout(() => {
        setLoading({...loading, downloadGuide: false});
        // In a real app, we would trigger download here
        window.open('/guide-placeholder.pdf', '_blank');
      }, 1500);
      
    } catch (error) {
      setLoading({...loading, downloadGuide: false});
      toast({
        title: "Error",
        description: "Failed to generate implementation guide. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Set up email reminders
  const setupReminders = async () => {
    // Simple email validation
    if (!email.includes('@') || !email.includes('.')) {
      setEmailValid(false);
      return;
    }
    
    setEmailValid(true);
    setLoading({...loading, setupReminders: true});
    
    try {
      await apiRequest('/api/reminders', {
        method: "POST",
        body: JSON.stringify({
          auditId,
          moduleId,
          email,
          frequency: reminderFrequency
        })
      });
      
      setReminderSuccess(true);
      toast({
        title: "Reminders Set Up",
        description: `You'll receive ${reminderFrequency} implementation reminders at ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set up reminders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading({...loading, setupReminders: false});
    }
  };
  
  // Export to task management tool
  const exportToTaskManager = async (platform: string) => {
    setLoading({...loading, [platform]: true});
    
    try {
      const response = await apiRequest(`/api/tasks/${auditId}/${moduleId}?platform=${platform}`, {
        method: "GET"
      });
      
      toast({
        title: `Tasks Ready for ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: "Tasks have been generated and are ready to import.",
      });
      
      // Simulate export delay
      setTimeout(() => {
        setLoading({...loading, [platform]: false});
      }, 1500);
      
    } catch (error) {
      setLoading({...loading, [platform]: false});
      toast({
        title: "Error",
        description: `Failed to export tasks to ${platform}. Please try again.`,
        variant: "destructive"
      });
    }
  };
  
  // Calculate progress percentage
  const completedSteps = implementationSteps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / implementationSteps.length) * 100);
  
  // Toggle step completion
  const toggleStep = (id: number) => {
    setImplementationSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Tools</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="progress">Track Progress</TabsTrigger>
            <TabsTrigger value="guide">Implementation Guide</TabsTrigger>
            <TabsTrigger value="reminders">Email Reminders</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
          </TabsList>
          
          {/* FEATURE 2: Implementation Progress Tracking */}
          <TabsContent value="progress" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Implementation Progress</h4>
              <Badge variant={progressPercentage === 100 ? "default" : "outline"}>
                {progressPercentage}% Complete
              </Badge>
            </div>
            
            <Progress value={progressPercentage} className="h-2 mb-6" />
            
            <div className="space-y-4">
              {implementationSteps.map(step => (
                <div 
                  key={step.id}
                  className={`p-3 border rounded-md flex items-start gap-3 ${
                    step.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                >
                  <Checkbox 
                    checked={step.completed}
                    onCheckedChange={() => toggleStep(step.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`step-${step.id}`}
                      className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-700'}`}
                    >
                      {step.title}
                    </Label>
                    {step.completed && (
                      <p className="text-xs text-green-600 mt-1">Completed</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Label htmlFor="implementation-notes" className="text-sm font-medium mb-2 block">
                Implementation Notes
              </Label>
              <Textarea 
                id="implementation-notes"
                placeholder="Add notes about your implementation progress..."
                className="resize-none"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button 
              className="mt-4 w-full" 
              onClick={() => progressMutation.mutate()}
              disabled={loading.saveProgress}
            >
              {loading.saveProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Progress...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Save Progress
                </>
              )}
            </Button>
          </TabsContent>
          
          {/* FEATURE 1: Downloadable Implementation Guide */}
          <TabsContent value="guide" className="space-y-4">
            <div className="rounded-md border p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Implementation Guide for {module.name}</h4>
              <p className="text-sm text-gray-600 mb-4">
                Download a comprehensive step-by-step guide for implementing {module.name} in your business.
                This guide includes detailed instructions, resources, and best practices.
              </p>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                  <span className="text-sm">Customized for your business context</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                  <span className="text-sm">Includes time estimates and resource requirements</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                  <span className="text-sm">Prioritized implementation steps</span>
                </div>
              </div>
              
              <Button 
                onClick={handleDownloadGuide}
                className="mt-6 w-full"
                disabled={loading.downloadGuide}
              >
                {loading.downloadGuide ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Implementation Guide
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* FEATURE 3: Email Reminders */}
          <TabsContent value="reminders" className="space-y-4">
            {reminderSuccess ? (
              <div className="rounded-md border border-green-200 p-4 bg-green-50">
                <div className="flex items-center">
                  <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                  <h4 className="font-medium text-green-700">Reminders Set Up Successfully</h4>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  You'll receive {reminderFrequency} email reminders at {email} to help you stay on track with your implementation.
                </p>
                
                <Button 
                  className="mt-4 bg-white text-green-700 border-green-200 hover:bg-green-100"
                  variant="outline" 
                  onClick={() => setReminderSuccess(false)}
                >
                  Modify Settings
                </Button>
              </div>
            ) : (
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-3">Set Up Implementation Reminders</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Receive step-by-step guidance and reminders to help you stay on track with your {module.name} implementation.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reminder-email" className="text-sm font-medium mb-1.5 block">
                      Email Address
                    </Label>
                    <Input
                      id="reminder-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={!emailValid ? "border-red-300" : ""}
                    />
                    {!emailValid && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="reminder-frequency" className="text-sm font-medium mb-1.5 block">
                      Frequency
                    </Label>
                    <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                      <SelectTrigger id="reminder-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  className="mt-6 w-full"
                  onClick={setupReminders}
                  disabled={loading.setupReminders || !email}
                >
                  {loading.setupReminders ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up Reminders...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Set Up Reminders
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* FEATURE 4: Task Management Integration */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="rounded-md border p-4">
              <h4 className="font-medium mb-2">Export Implementation Tasks</h4>
              <p className="text-sm text-gray-600 mb-4">
                Export your implementation plan to your preferred task management platform to track progress and assign tasks to team members.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex justify-between items-center"
                  onClick={() => exportToTaskManager('trello')}
                  disabled={loading.trello}
                >
                  <div className="flex items-center">
                    {loading.trello ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <img src="https://cdn.worldvectorlogo.com/logos/trello.svg" className="h-4 w-4 mr-2" alt="Trello" />
                    )}
                    <span>Export to Trello</span>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex justify-between items-center"
                  onClick={() => exportToTaskManager('asana')}
                  disabled={loading.asana}
                >
                  <div className="flex items-center">
                    {loading.asana ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <img src="https://cdn.worldvectorlogo.com/logos/asana-logo.svg" className="h-4 w-4 mr-2" alt="Asana" />
                    )}
                    <span>Export to Asana</span>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex justify-between items-center"
                  onClick={() => exportToTaskManager('jira')}
                  disabled={loading.jira}
                >
                  <div className="flex items-center">
                    {loading.jira ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <img src="https://cdn.worldvectorlogo.com/logos/jira-1.svg" className="h-4 w-4 mr-2" alt="Jira" />
                    )}
                    <span>Export to Jira</span>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex justify-between items-center"
                  onClick={() => exportToTaskManager('clickup')}
                  disabled={loading.clickup}
                >
                  <div className="flex items-center">
                    {loading.clickup ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <img src="https://cdn.worldvectorlogo.com/logos/clickup-symbol.svg" className="h-4 w-4 mr-2" alt="ClickUp" />
                    )}
                    <span>Export to ClickUp</span>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full" onClick={() => window.open('data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
                name: `${module.name} Implementation`,
                tasks: implementationSteps.map(step => ({
                  title: step.title,
                  completed: step.completed
                }))
              })), '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Download JSON File
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}