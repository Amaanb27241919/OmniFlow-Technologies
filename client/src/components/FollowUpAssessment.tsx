import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  ArrowRight,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuditResults } from "@/lib/auditTypes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FollowUpAssessmentProps {
  auditData: AuditResults;
}

interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'rating' | 'yesno' | 'percentage' | 'text';
  category: 'efficiency' | 'revenue' | 'customer' | 'implementation';
  description?: string;
  answered: boolean;
  answer?: string | number;
}

export default function FollowUpAssessment({ auditData }: FollowUpAssessmentProps) {
  const [formStep, setFormStep] = useState<'start' | 'assessment' | 'results'>('start');
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSinceAudit, setTimeSinceAudit] = useState<string>('3 months');
  const [successScores, setSuccessScores] = useState({
    efficiency: 0,
    revenue: 0,
    customer: 0,
    implementation: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>(generateFollowUpQuestions());
  
  // Generate follow-up questions based on the original audit data
  function generateFollowUpQuestions(): FollowUpQuestion[] {
    const questions: FollowUpQuestion[] = [
      // Efficiency questions
      {
        id: 'efficiency-1',
        question: 'How much time are you saving weekly after implementing the recommended process improvements?',
        type: 'rating',
        category: 'efficiency',
        description: 'Rate from 1 (no change) to 10 (significant time savings)',
        answered: false
      },
      {
        id: 'efficiency-2',
        question: 'What percentage of your previously manual tasks have you automated?',
        type: 'percentage',
        category: 'efficiency',
        answered: false
      },
      {
        id: 'efficiency-3',
        question: 'Have you implemented workflow automation tools as recommended?',
        type: 'yesno',
        category: 'efficiency',
        answered: false
      },
      
      // Revenue questions
      {
        id: 'revenue-1',
        question: 'Has your monthly revenue increased since implementing our recommendations?',
        type: 'yesno',
        category: 'revenue',
        answered: false
      },
      {
        id: 'revenue-2',
        question: 'By what percentage has your profit margin improved?',
        type: 'percentage',
        category: 'revenue',
        answered: false
      },
      {
        id: 'revenue-3',
        question: 'Rate the impact of our recommendations on your overall business growth',
        type: 'rating',
        category: 'revenue',
        description: 'Rate from 1 (minimal impact) to 10 (transformative impact)',
        answered: false
      },
      
      // Customer questions
      {
        id: 'customer-1',
        question: 'Has your customer retention rate improved?',
        type: 'yesno',
        category: 'customer',
        answered: false
      },
      {
        id: 'customer-2',
        question: 'By what percentage has your customer acquisition cost decreased?',
        type: 'percentage',
        category: 'customer',
        answered: false
      },
      {
        id: 'customer-3',
        question: 'Rate the improvement in your customer satisfaction levels',
        type: 'rating',
        category: 'customer',
        description: 'Rate from 1 (no change) to 10 (significant improvement)',
        answered: false
      },
      
      // Implementation questions
      {
        id: 'implementation-1',
        question: 'What percentage of our recommendations have you implemented?',
        type: 'percentage',
        category: 'implementation',
        answered: false
      },
      {
        id: 'implementation-2',
        question: 'Rate the ease of implementing our recommendations',
        type: 'rating',
        category: 'implementation',
        description: 'Rate from 1 (very difficult) to 10 (very easy)',
        answered: false
      },
      {
        id: 'implementation-3',
        question: 'What challenges did you face during implementation?',
        type: 'text',
        category: 'implementation',
        answered: false
      }
    ];
    
    // Add workflow-specific questions if the user received workflow recommendations
    if (auditData.workflowRecommendations && auditData.workflowRecommendations.length > 0) {
      auditData.workflowRecommendations.forEach((workflow, index) => {
        questions.push({
          id: `workflow-${index}`,
          question: `Have you implemented the ${workflow.name} module as recommended?`,
          type: 'yesno',
          category: 'implementation',
          answered: false
        });
      });
    }
    
    return questions;
  }
  
  // Track progress through the assessment
  const answeredQuestions = questions.filter(q => q.answered).length;
  const totalQuestions = questions.length;
  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  
  // Start the assessment
  const handleStartAssessment = () => {
    setFormStep('assessment');
  };
  
  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string | number) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, answer: value, answered: true } : q
      )
    );
  };
  
  // Calculate success scores based on answers
  const calculateSuccessScores = () => {
    const categoryScores: Record<string, number[]> = {
      efficiency: [],
      revenue: [],
      customer: [],
      implementation: []
    };
    
    questions.forEach(q => {
      if (!q.answered) return;
      
      let score = 0;
      
      if (q.type === 'rating' && typeof q.answer === 'number') {
        // Convert 1-10 rating to 0-100 score
        score = (q.answer as number) * 10;
      } else if (q.type === 'percentage' && typeof q.answer === 'number') {
        // Use percentage directly as score
        score = Math.min(q.answer as number, 100);
      } else if (q.type === 'yesno') {
        // Yes = 100, No = 0
        score = q.answer === 'yes' ? 100 : 0;
      }
      
      if (score > 0 && q.category in categoryScores) {
        categoryScores[q.category].push(score);
      }
    });
    
    // Calculate average scores for each category
    const calculatedScores = {
      efficiency: calculateAverage(categoryScores.efficiency),
      revenue: calculateAverage(categoryScores.revenue),
      customer: calculateAverage(categoryScores.customer),
      implementation: calculateAverage(categoryScores.implementation)
    };
    
    setSuccessScores(calculatedScores);
    return calculatedScores;
  };
  
  // Calculate average of an array of numbers
  const calculateAverage = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((total, score) => total + score, 0);
    return Math.round(sum / scores.length);
  };
  
  // Submit the assessment
  const handleSubmitAssessment = async () => {
    // Ensure all questions are answered
    const unansweredQuestions = questions.filter(q => !q.answered && q.type !== 'text');
    
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Incomplete Assessment",
        description: `Please answer all required questions (${unansweredQuestions.length} remaining).`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate final scores
      const finalScores = calculateSuccessScores();
      
      // In a real implementation, this would send the data to the server
      // For demo purposes, we'll just simulate an API call
      setTimeout(() => {
        setFormStep('results');
        setIsSubmitting(false);
        
        toast({
          title: "Assessment Submitted",
          description: "Your follow-up assessment has been submitted successfully.",
        });
      }, 1500);
      
    } catch (error) {
      setIsSubmitting(false);
      
      toast({
        title: "Submission Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get assessment summary text
  const getAssessmentSummary = () => {
    const overallScore = Math.round(
      (successScores.efficiency + successScores.revenue + successScores.customer + successScores.implementation) / 4
    );
    
    if (overallScore >= 80) {
      return "Excellent progress! You've successfully implemented most recommendations and are seeing significant benefits across your business.";
    } else if (overallScore >= 60) {
      return "Good progress! You've implemented many of our recommendations and are beginning to see positive results in your business metrics.";
    } else if (overallScore >= 40) {
      return "Moderate progress. You've started implementing some recommendations, but there's still room for further improvements to realize the full benefits.";
    } else {
      return "You're still in the early stages of implementation. Continue focusing on the high-priority recommendations to start seeing more significant benefits.";
    }
  };
  
  // Generate recommendations based on assessment results
  const getNextStepRecommendations = () => {
    const recommendations = [];
    
    // Implementation recommendations
    if (successScores.implementation < 60) {
      recommendations.push(
        "Focus on completing the implementation of the highest-priority recommendations from your original audit."
      );
    }
    
    // Efficiency recommendations
    if (successScores.efficiency < 60) {
      recommendations.push(
        "Review the automation opportunities identified in your audit and prioritize implementing workflow automation tools."
      );
    }
    
    // Revenue recommendations
    if (successScores.revenue < 60) {
      recommendations.push(
        "Consider scheduling a consultation to identify additional revenue growth opportunities based on your progress so far."
      );
    }
    
    // Customer recommendations
    if (successScores.customer < 60) {
      recommendations.push(
        "Focus on implementing the customer retention strategies outlined in your audit to improve customer satisfaction and loyalty."
      );
    }
    
    // If all scores are good
    if (recommendations.length === 0) {
      recommendations.push(
        "You're on the right track! Consider scheduling a new comprehensive audit to identify the next level of optimization opportunities for your business."
      );
    }
    
    return recommendations;
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Get improvement status for a category
  const getImprovementStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Fair', color: 'bg-orange-500' };
    return { label: 'Needs Work', color: 'bg-red-500' };
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Follow-Up Assessment</h3>
          </div>
          {formStep === 'results' && (
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
        
        {formStep === 'start' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Track Your Progress</h4>
              <p className="text-sm text-blue-700 mb-4">
                This follow-up assessment will help you measure the improvements achieved since implementing
                our recommendations from your initial business audit on {formatDate(auditData.createdAt)}.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Assessment Date</Label>
                  <Input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm mb-1.5 block">Time Since Initial Audit</Label>
                  <Select defaultValue={timeSinceAudit} onValueChange={setTimeSinceAudit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">What We'll Assess</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Efficiency Improvements</h5>
                    <p className="text-xs text-gray-600">Time savings, automation, and process optimization</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Revenue Impact</h5>
                    <p className="text-xs text-gray-600">Revenue growth, profit margins, and ROI</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Customer Outcomes</h5>
                    <p className="text-xs text-gray-600">Customer satisfaction, retention, and acquisition</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Implementation Progress</h5>
                    <p className="text-xs text-gray-600">Status of recommendation implementation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleStartAssessment} className="w-full">
              Start Assessment
            </Button>
          </div>
        )}
        
        {formStep === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Assessment Progress</h4>
                <span className="text-sm font-medium">
                  {answeredQuestions} of {totalQuestions} questions answered
                </span>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className={`p-4 border rounded-md ${question.answered ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {question.answered ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium mb-2">{question.question}</h5>
                      {question.description && (
                        <p className="text-sm text-gray-500 mb-3">{question.description}</p>
                      )}
                      
                      {/* Rating input */}
                      {question.type === 'rating' && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1</span>
                            <span>10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={question.answer || '1'}
                            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-center font-medium text-blue-600">
                            {question.answer || 1}
                          </div>
                        </div>
                      )}
                      
                      {/* Yes/No input */}
                      {question.type === 'yesno' && (
                        <RadioGroup
                          value={question.answer?.toString() || ''}
                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`}>No</Label>
                          </div>
                        </RadioGroup>
                      )}
                      
                      {/* Percentage input */}
                      {question.type === 'percentage' && (
                        <div className="space-y-3">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={question.answer || ''}
                            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                            className="w-full"
                            placeholder="Enter percentage (0-100)"
                          />
                          {question.answer && (
                            <Progress value={Number(question.answer)} className="h-2" />
                          )}
                        </div>
                      )}
                      
                      {/* Text input */}
                      {question.type === 'text' && (
                        <Textarea
                          value={question.answer?.toString() || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full"
                          placeholder="Enter your answer here..."
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setFormStep('start')}>
                Back
              </Button>
              <Button 
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {formStep === 'results' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Assessment Complete</h4>
                  <p className="text-sm text-green-700">
                    {getAssessmentSummary()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Improvement Areas</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1.5 text-green-600" />
                        <span className="text-sm font-medium">Efficiency</span>
                      </div>
                      <span className="text-sm font-medium">{successScores.efficiency}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getImprovementStatus(successScores.efficiency).color}`}
                        style={{ width: `${successScores.efficiency}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Badge variant="outline" className={`text-xs ${successScores.efficiency >= 60 ? 'border-green-200 text-green-800 bg-green-50' : 'border-orange-200 text-orange-800 bg-orange-50'}`}>
                        {getImprovementStatus(successScores.efficiency).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span className="text-sm font-medium">Revenue Impact</span>
                      </div>
                      <span className="text-sm font-medium">{successScores.revenue}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getImprovementStatus(successScores.revenue).color}`}
                        style={{ width: `${successScores.revenue}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Badge variant="outline" className={`text-xs ${successScores.revenue >= 60 ? 'border-green-200 text-green-800 bg-green-50' : 'border-orange-200 text-orange-800 bg-orange-50'}`}>
                        {getImprovementStatus(successScores.revenue).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5 text-purple-600" />
                        <span className="text-sm font-medium">Customer Outcomes</span>
                      </div>
                      <span className="text-sm font-medium">{successScores.customer}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getImprovementStatus(successScores.customer).color}`}
                        style={{ width: `${successScores.customer}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Badge variant="outline" className={`text-xs ${successScores.customer >= 60 ? 'border-green-200 text-green-800 bg-green-50' : 'border-orange-200 text-orange-800 bg-orange-50'}`}>
                        {getImprovementStatus(successScores.customer).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-orange-600" />
                        <span className="text-sm font-medium">Implementation Progress</span>
                      </div>
                      <span className="text-sm font-medium">{successScores.implementation}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getImprovementStatus(successScores.implementation).color}`}
                        style={{ width: `${successScores.implementation}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Badge variant="outline" className={`text-xs ${successScores.implementation >= 60 ? 'border-green-200 text-green-800 bg-green-50' : 'border-orange-200 text-orange-800 bg-orange-50'}`}>
                        {getImprovementStatus(successScores.implementation).label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Next Steps</h4>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h5 className="font-medium text-blue-800 mb-3">Recommendations</h5>
                  
                  <ul className="space-y-3">
                    {getNextStepRecommendations().map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" className="text-xs" size="sm">
                      Schedule Consultation
                    </Button>
                    <Button className="text-xs" size="sm">
                      Get Detailed Report
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="font-medium mb-3">Assessment Timeline</h5>
                  
                  <div className="relative pl-6 border-l-2 border-dashed border-gray-300 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-gray-100 p-1 rounded-full border border-gray-300">
                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h6 className="text-sm font-medium">Initial Audit</h6>
                        <p className="text-xs text-gray-500">{formatDate(auditData.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-blue-100 p-1 rounded-full border border-blue-300">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h6 className="text-sm font-medium">Follow-up Assessment</h6>
                        <p className="text-xs text-gray-500">{formatDate(assessmentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-green-100 p-1 rounded-full border border-green-300">
                        <Calendar className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h6 className="text-sm font-medium">Recommended Next Assessment</h6>
                        <p className="text-xs text-gray-500">{formatDate(new Date(new Date(assessmentDate).setMonth(new Date(assessmentDate).getMonth() + 3)).toISOString())}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setFormStep('assessment')}>
                Review Answers
              </Button>
              <Button>
                Schedule Next Assessment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}