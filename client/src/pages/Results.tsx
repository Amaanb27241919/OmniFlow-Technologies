import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { AuditResults, WorkflowModule } from "@/lib/auditTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ImplementationTools from "@/components/ImplementationTools";
import ConsolidatedActionPlan from "@/components/ConsolidatedActionPlan";
import ROICalculator from "@/components/ROICalculator";
import BusinessMetricsDashboard from "@/components/BusinessMetricsDashboard";
import BusinessCommunity from "@/components/BusinessCommunity";
import FollowUpAssessment from "@/components/FollowUpAssessment";
import { 
  CheckCircle, 
  Zap, 
  Lightbulb, 
  Download, 
  RefreshCw, 
  ChevronRight,
  GitBranch,
  Layers,
  BrainCircuit,
  UserCheck,
  Bot,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function Results() {
  const [location] = useLocation();
  const id = location.split('/').pop() || '';
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);

  const { data, isLoading, isError, error } = useQuery<AuditResults>({
    queryKey: [`/api/audits/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container-custom">
        <LoadingResults />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-custom">
        <Card className="form-card">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Results</h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : "We couldn't load your audit results. Please try again."}
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented in a production environment');
  };

  const handleGenerateNewAIRecommendation = () => {
    setIsRefreshingAi(true);
    
    // Simulating API call delay
    setTimeout(() => {
      setIsRefreshingAi(false);
    }, 1500);
  };

  return (
    <div className="container-custom">
      {/* Results Header */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Business Audit Results</h2>
              <p className="text-gray-600">For {data?.businessName || 'Your Business'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-sm">
              <Download className="h-4 w-4 mr-1.5" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Business Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="metric-card">
              <div className="text-sm font-medium text-gray-500 mb-1">Monthly Revenue</div>
              <div className="text-lg font-semibold">{data?.monthlyRevenue || 'Not provided'}</div>
            </div>
            
            <div className="metric-card">
              <div className="text-sm font-medium text-gray-500 mb-1">Industry</div>
              <div className="text-lg font-semibold">{data?.industry || 'Not provided'}</div>
              {data?.subIndustry && (
                <div className="text-sm text-gray-500 mt-1">
                  Sub-industry: {data.subIndustry}
                </div>
              )}
            </div>
            
            <div className="metric-card">
              <div className="text-sm font-medium text-gray-500 mb-1">Business Age</div>
              <div className="text-lg font-semibold">{data?.businessAge || 'Not provided'}</div>
            </div>
            
            <div className="metric-card">
              <div className="text-sm font-medium text-gray-500 mb-1">Team Size</div>
              <div className="text-lg font-semibold">{data?.employees || 'Not provided'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <Card className="form-card mb-0">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-secondary mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Business Strengths</h3>
            </div>
            
            <ul className="space-y-3">
              {data?.strengths.map((strength, index) => (
                <li key={index} className="flex">
                  <span className="text-secondary mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Opportunities */}
        <Card className="form-card mb-0">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-accent mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Growth Opportunities</h3>
            </div>
            
            <ul className="space-y-3">
              {data?.opportunities.map((opportunity, index) => (
                <li key={index} className="flex">
                  <span className="text-accent mr-2">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          
          <div className="space-y-6">
            {data?.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{recommendation.title}</h4>
                    <p className="text-gray-600 text-sm">{recommendation.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      <div className="ai-insight-card mb-8">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">AI Strategic Insight</h3>
        </div>
        
        <p className="mb-4">{data?.aiRecommendation}</p>
        
        <Button 
          onClick={handleGenerateNewAIRecommendation} 
          disabled={isRefreshingAi}
          variant="secondary"
          className="mt-2 bg-white text-primary hover:bg-gray-100 flex items-center"
        >
          {isRefreshingAi ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
              Generating New Insight...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Generate New Insight
            </>
          )}
        </Button>
      </div>

      {/* OmniFlow Automation Recommendations */}
      {data?.workflowRecommendations && data.workflowRecommendations.length > 0 && (
        <Card className="form-card mb-8">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Smart Workflow Recommendations
            </h3>
            <p className="text-gray-600 mb-6">
              Based on your business profile, these OmniFlow modules could help automate your workflows and improve efficiency:
            </p>

            <div className="space-y-10">
              {data.workflowRecommendations.map((module, index) => {
                // Determine which icon to display
                let ModuleIcon;
                switch(module.icon) {
                  case 'bot': ModuleIcon = Bot; break;
                  case 'user-check': ModuleIcon = UserCheck; break;
                  case 'brain-circuit': ModuleIcon = BrainCircuit; break;
                  case 'layers': ModuleIcon = Layers; break;
                  case 'git-branch': ModuleIcon = GitBranch; break;
                  default: ModuleIcon = Zap;
                }
                
                // Generate some mock implementation data for the demo
                // In a real implementation, this would come from the backend
                const businessArea = module.businessArea || 'general';
                const timeToImplement = module.estimatedTimeToImplement || '3-6 weeks';
                const costSavings = module.estimatedCostSavings || '$2,000-$5,000 per month';
                const roi = module.estimatedRoi || '200% within 12 months';
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex flex-col">
                      {/* Module Header */}
                      <div className="flex items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                          <ModuleIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-medium text-gray-900 mr-2">{module.name}</h4>
                            <Badge variant="outline" className="bg-blue-50 text-xs">OmniFlow Module</Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{module.description}</p>
                        </div>
                      </div>
                      
                      {/* Business Value */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-gray-50 p-3 rounded-md">
                        <div>
                          <div className="text-xs font-medium text-gray-500">BUSINESS AREA</div>
                          <div className="text-sm font-medium text-gray-800 mt-1 capitalize">
                            {businessArea.replace('_', ' ')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">IMPLEMENTATION TIME</div>
                          <div className="text-sm font-medium text-gray-800 mt-1">{timeToImplement}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">COST SAVINGS</div>
                          <div className="text-sm font-medium text-gray-800 mt-1">{costSavings}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">ROI</div>
                          <div className="text-sm font-medium text-gray-800 mt-1">{roi}</div>
                        </div>
                      </div>
                      
                      {/* Integration Points & Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-2">INTEGRATION POINTS</h5>
                          <div className="flex flex-wrap gap-1">
                            {module.integrationPoints.map((point, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-700">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-2">KEY BENEFITS</h5>
                          <ul className="space-y-1 pl-5 list-disc text-sm text-gray-600">
                            {module.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Implementation Steps */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">Implementation Steps</h5>
                          <Badge variant="outline" className="text-xs font-normal text-gray-600">Step-by-step Guide</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Step 1 */}
                          <div className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-blue-50 px-3 py-2 border-b border-gray-200">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-blue-800">1</span>
                                </div>
                                <h6 className="text-sm font-medium text-gray-800">
                                  {module.name === "OmniBot" ? "Define Your Customer Journey" : 
                                   module.name === "OmniAgent" ? "Build Your Knowledge Base" :
                                   module.name === "OmniAI" ? "Data Assessment and Preparation" :
                                   module.name === "OmniForge" ? "Process Mapping and Analysis" :
                                   module.name === "OmniConnect" ? "System Audit and Integration Planning" :
                                   "Define Your Implementation Goals"
                                  }
                                </h6>
                                <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200 text-xs">High Priority</Badge>
                              </div>
                            </div>
                            <div className="px-3 py-2">
                              <p className="text-sm text-gray-700 mb-2">
                                {module.name === "OmniBot" ? "Map out your ideal customer journey from initial contact to conversion" : 
                                 module.name === "OmniAgent" ? "Compile frequently asked questions and common customer issues" :
                                 module.name === "OmniAI" ? "Evaluate your current data and prepare it for analysis" :
                                 module.name === "OmniForge" ? "Document and analyze current manual processes" :
                                 module.name === "OmniConnect" ? "Evaluate your current systems and plan integration strategy" :
                                 "Define clear goals and success metrics for implementation"
                                }
                              </p>
                              <div className="text-xs font-medium text-gray-500 mt-2">ESTIMATED TIME:</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {module.name === "OmniBot" ? "5-8 hours" : 
                                 module.name === "OmniAgent" ? "12-16 hours" :
                                 module.name === "OmniAI" ? "16-24 hours" :
                                 module.name === "OmniForge" ? "13-20 hours" :
                                 module.name === "OmniConnect" ? "13-18 hours" :
                                 "8-12 hours"
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Step 2 */}
                          <div className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-blue-50 px-3 py-2 border-b border-gray-200">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-blue-800">2</span>
                                </div>
                                <h6 className="text-sm font-medium text-gray-800">
                                  {module.name === "OmniBot" ? "Set Up Automated Email Sequences" : 
                                   module.name === "OmniAgent" ? "Train Your Virtual Assistant" :
                                   module.name === "OmniAI" ? "Model Development and Training" :
                                   module.name === "OmniForge" ? "Workflow Design and Configuration" :
                                   module.name === "OmniConnect" ? "Data Mapping and Transformation" :
                                   "Configure and Customize"
                                  }
                                </h6>
                                <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200 text-xs">High Priority</Badge>
                              </div>
                            </div>
                            <div className="px-3 py-2">
                              <p className="text-sm text-gray-700 mb-2">
                                {module.name === "OmniBot" ? "Create targeted email sequences for different customer segments" : 
                                 module.name === "OmniAgent" ? "Configure the AI assistant with your business-specific information" :
                                 module.name === "OmniAI" ? "Create predictive models based on your business objectives" :
                                 module.name === "OmniForge" ? "Build automated workflows in the OmniForge platform" :
                                 module.name === "OmniConnect" ? "Map data fields between systems and create transformation rules" :
                                 "Customize the solution to match your specific business needs"
                                }
                              </p>
                              <div className="text-xs font-medium text-gray-500 mt-2">ESTIMATED TIME:</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {module.name === "OmniBot" ? "9-13 hours" : 
                                 module.name === "OmniAgent" ? "8-12 hours" :
                                 module.name === "OmniAI" ? "13-22 hours" :
                                 module.name === "OmniForge" ? "18-28 hours" :
                                 module.name === "OmniConnect" ? "18-34 hours" :
                                 "14-20 hours"
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Step 3 */}
                          <div className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-blue-50 px-3 py-2 border-b border-gray-200">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-blue-800">3</span>
                                </div>
                                <h6 className="text-sm font-medium text-gray-800">
                                  {module.name === "OmniBot" ? "Integrate with Your CRM" : 
                                   module.name === "OmniAgent" ? "Deploy Customer-Facing Channels" :
                                   module.name === "OmniAI" ? "Insight Dashboard Creation" :
                                   module.name === "OmniForge" ? "Testing and Deployment" :
                                   module.name === "OmniConnect" ? "Connection Setup and Testing" :
                                   "Testing and Launch"
                                  }
                                </h6>
                                <Badge className="ml-auto bg-gray-100 text-gray-800 border-gray-200 text-xs">Medium Priority</Badge>
                              </div>
                            </div>
                            <div className="px-3 py-2">
                              <p className="text-sm text-gray-700 mb-2">
                                {module.name === "OmniBot" ? "Connect OmniBot with your existing customer database" : 
                                 module.name === "OmniAgent" ? "Implement the virtual assistant across customer communication channels" :
                                 module.name === "OmniAI" ? "Build actionable dashboards for business decision-makers" :
                                 module.name === "OmniForge" ? "Test and roll out automated workflows to your team" :
                                 module.name === "OmniConnect" ? "Establish connections between systems and validate data flow" :
                                 "Test thoroughly and launch the solution to your team"
                                }
                              </p>
                              <div className="text-xs font-medium text-gray-500 mt-2">ESTIMATED TIME:</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {module.name === "OmniBot" ? "5-9 hours" : 
                                 module.name === "OmniAgent" ? "8-12 hours" :
                                 module.name === "OmniAI" ? "13-18 hours" :
                                 module.name === "OmniForge" ? "18-28 hours" :
                                 module.name === "OmniConnect" ? "17-32 hours" :
                                 "16-24 hours"
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button size="sm" variant="outline">
                          <span>Request Demo</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                          <span>Implement Now</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Implementation Tools Component */}
                      {data && <ImplementationTools auditId={data.id} module={module} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OmniFlow Introduction */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">About OmniFlow Consulting</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            OmniFlow provides advanced automation solutions to help small and medium businesses implement AI-driven processes without requiring extensive technical resources or knowledge.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <BrainCircuit className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium">AI Implementation</h5>
                <p className="text-xs text-gray-600">Custom AI solutions tailored to your business needs</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-2">
                <Layers className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium">Process Automation</h5>
                <p className="text-xs text-gray-600">Streamline operations with intelligent automation</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-2">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium">Expert Guidance</h5>
                <p className="text-xs text-gray-600">Ongoing support for your business transformation</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-right">
            <a href="https://www.omni-flow.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center justify-end">
              Visit OmniFlow website
              <ArrowRight className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Enhancement 1: Consolidated Action Plan */}
      {data && <ConsolidatedActionPlan auditData={data} />}
      
      {/* Enhancement 2: ROI Calculator */}
      {data && <ROICalculator auditData={data} />}
      
      {/* Enhancement 3: Business Metrics Dashboard */}
      {data && <BusinessMetricsDashboard auditData={data} />}
      
      {/* Enhancement 4: Business Community */}
      {data && <BusinessCommunity auditData={data} />}
      
      {/* Enhancement 5: Follow-Up Assessment */}
      {data && <FollowUpAssessment auditData={data} />}
      
      {/* Next Steps */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          
          <div className="space-y-4">
            <p className="text-gray-600">Based on your audit results, we recommend the following next steps:</p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Prioritize Your Recommendations</h4>
                  <p className="text-gray-600 text-sm">Review the recommendations above and identify which would have the biggest impact on your business goals.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Create an Action Plan</h4>
                  <p className="text-gray-600 text-sm">Develop a 30-60-90 day plan to implement your highest priority recommendations.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Explore OmniFlow Integration</h4>
                  <p className="text-gray-600 text-sm">Consider which workflow automation tools could help you implement these recommendations more efficiently.</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center">
              <Link href="/">
                <Button variant="outline">Start New Audit</Button>
              </Link>
              <Button onClick={handleExportPDF} className="flex items-center">
                <Download className="h-5 w-5 mr-1.5" />
                Export Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingResults() {
  return (
    <>
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>

      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="metric-card">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <Card key={i} className="form-card mb-0">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <Skeleton className="h-6 w-56 mb-6" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="recommendation-card">
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                  <div className="w-full">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="ai-insight-card mb-8">
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-6 mr-2 bg-white/20" />
          <Skeleton className="h-6 w-40 bg-white/20" />
        </div>
        
        <Skeleton className="h-4 w-full bg-white/20 mb-2" />
        <Skeleton className="h-4 w-full bg-white/20 mb-2" />
        <Skeleton className="h-4 w-3/4 bg-white/20 mb-4" />
        
        <Skeleton className="h-9 w-48 bg-white/40 rounded-md" />
      </div>
    </>
  );
}
