import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { AuditResults, WorkflowModule } from "@/lib/auditTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Cloud,
  AlertCircle
} from "lucide-react";

// Type definition for Notion status response
interface NotionStatus {
  enabled: boolean;
  message: string;
}

export default function Results() {
  const [location] = useLocation();
  const id = location.split('/').pop() || '';
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);

  // Fetch Notion integration status
  const { data: notionStatus } = useQuery<NotionStatus>({
    queryKey: ['/api/notion/status'],
  });

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
              Workflow Automation Recommendations
            </h3>
            <p className="text-gray-600 mb-6">
              Based on your business profile, these OmniFlow modules could help automate your workflows and improve efficiency:
            </p>

            <div className="space-y-6">
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
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                        <ModuleIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900 mr-2">{module.name}</h4>
                          <Badge variant="outline" className="bg-blue-50 text-xs">OmniFlow Module</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                        
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-gray-500 mb-1">KEY INTEGRATION POINTS:</h5>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {module.integrationPoints.map((point, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-700">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1">BENEFITS:</h5>
                          <ul className="space-y-1 pl-5 list-disc text-sm text-gray-600">
                            {module.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button size="sm" className="mt-4" variant="outline">
                          <span>Learn More</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notion Integration Status */}
      <Card className="form-card mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Cloud size={20} className={notionStatus?.enabled ? "text-green-500" : "text-gray-400"} />
            <h3 className="text-lg font-semibold text-gray-900">Notion Integration</h3>
            <Badge variant={notionStatus?.enabled ? "secondary" : "outline"} className={notionStatus?.enabled ? "bg-green-100 text-green-800 border-green-200" : ""}>
              {notionStatus?.enabled ? "Active" : "Not Configured"}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm">
            {notionStatus?.enabled 
              ? "Your business audit data is automatically synced to your Notion workspace for easy tracking and collaboration."
              : "Configure Notion integration to automatically sync audit data to your Notion workspace for better tracking and team collaboration."}
          </p>

          {!notionStatus?.enabled && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-600">
              <p className="font-medium mb-1">To enable Notion integration:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Create a Notion integration at <span className="text-blue-600">notion.so/my-integrations</span></li>
                <li>Add <code className="bg-gray-100 px-1 py-0.5 rounded">NOTION_INTEGRATION_SECRET</code> from your integration</li>
                <li>Add <code className="bg-gray-100 px-1 py-0.5 rounded">NOTION_PAGE_URL</code> where audit data should be stored</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

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
