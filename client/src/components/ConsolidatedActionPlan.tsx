import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AuditResults, Recommendation, WorkflowModule } from "@/lib/auditTypes";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download,
  ArrowUpDown,
  Filter,
  Layers,
  ListFilter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ConsolidatedActionPlanProps {
  auditData: AuditResults;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  source: 'recommendation' | 'workflow' | 'opportunity';
  sourceName: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'minimal' | 'moderate' | 'significant';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  estimatedTimeToComplete: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
}

export default function ConsolidatedActionPlan({ auditData }: ConsolidatedActionPlanProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [effortFilter, setEffortFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompletedItems, setShowCompletedItems] = useState(true);

  // Generate action items from all recommendations and workflow steps
  const generateActionItems = (): ActionItem[] => {
    const actionItems: ActionItem[] = [];
    
    // Add items from recommendations
    if (auditData.recommendations) {
      auditData.recommendations.forEach((rec, index) => {
        actionItems.push({
          id: `rec-${index}`,
          title: rec.title,
          description: rec.description,
          source: 'recommendation',
          sourceName: 'Strategic Recommendation',
          priority: getPriorityFromRec(rec),
          effort: getEffortFromRec(rec),
          timeframe: getTimeframeFromRec(rec),
          estimatedTimeToComplete: getTimeEstimateFromRec(rec),
          estimatedImpact: getImpactFromRec(rec),
          status: 'not-started'
        });
      });
    }
    
    // Add items from workflow recommendations
    if (auditData.workflowRecommendations) {
      auditData.workflowRecommendations.forEach(workflow => {
        // Add the main workflow as an action item
        actionItems.push({
          id: `wf-${workflow.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `Implement ${workflow.name}`,
          description: workflow.description,
          source: 'workflow',
          sourceName: workflow.name,
          priority: 'high',
          effort: 'significant',
          timeframe: 'medium-term',
          estimatedTimeToComplete: workflow.estimatedTimeToImplement || '4-8 weeks',
          estimatedImpact: 'high',
          status: 'not-started'
        });
        
        // If the workflow has implementation steps, add them as sub-items
        if (workflow.implementationSteps) {
          workflow.implementationSteps.forEach((step, stepIndex) => {
            actionItems.push({
              id: `wf-${workflow.name.toLowerCase().replace(/\s+/g, '-')}-step-${stepIndex}`,
              title: step.title,
              description: step.description,
              source: 'workflow',
              sourceName: workflow.name,
              priority: step.priority,
              effort: getEffortFromStep(step),
              timeframe: getTimeframeFromPriority(step.priority),
              estimatedTimeToComplete: getTimeEstimateFromStep(step),
              estimatedImpact: 'medium',
              status: 'not-started'
            });
          });
        }
      });
    }
    
    // Add items from opportunities
    if (auditData.opportunities) {
      auditData.opportunities.forEach((opp, index) => {
        actionItems.push({
          id: `opp-${index}`,
          title: opp,
          description: getDescriptionForOpportunity(opp),
          source: 'opportunity',
          sourceName: 'Growth Opportunity',
          priority: 'medium',
          effort: 'moderate',
          timeframe: 'short-term',
          estimatedTimeToComplete: '2-4 weeks',
          estimatedImpact: 'medium',
          status: 'not-started'
        });
      });
    }
    
    return actionItems;
  };
  
  // Helper functions to determine properties
  const getPriorityFromRec = (rec: Recommendation): 'high' | 'medium' | 'low' => {
    // Determine priority based on recommendation title keywords
    const title = rec.title.toLowerCase();
    if (title.includes('improve') || title.includes('optimize') || title.includes('enhance')) {
      return 'high';
    }
    if (title.includes('develop') || title.includes('create') || title.includes('implement')) {
      return 'medium';
    }
    return 'low';
  };
  
  const getEffortFromRec = (rec: Recommendation): 'minimal' | 'moderate' | 'significant' => {
    // Estimate effort based on recommendation description length and complexity
    const desc = rec.description.toLowerCase();
    if (desc.length > 150 || desc.includes('comprehensive') || desc.includes('strategy')) {
      return 'significant';
    }
    if (desc.length > 80 || desc.includes('develop') || desc.includes('implement')) {
      return 'moderate';
    }
    return 'minimal';
  };
  
  const getTimeframeFromRec = (rec: Recommendation): 'immediate' | 'short-term' | 'medium-term' | 'long-term' => {
    const priority = getPriorityFromRec(rec);
    return getTimeframeFromPriority(priority);
  };
  
  const getTimeframeFromPriority = (priority: string): 'immediate' | 'short-term' | 'medium-term' | 'long-term' => {
    switch (priority) {
      case 'high':
        return 'immediate';
      case 'medium':
        return 'short-term';
      default:
        return 'medium-term';
    }
  };
  
  const getTimeEstimateFromRec = (rec: Recommendation): string => {
    const effort = getEffortFromRec(rec);
    switch (effort) {
      case 'minimal':
        return '1-2 weeks';
      case 'moderate':
        return '2-4 weeks';
      case 'significant':
        return '4-8 weeks';
      default:
        return '2-4 weeks';
    }
  };
  
  const getImpactFromRec = (rec: Recommendation): 'high' | 'medium' | 'low' => {
    // Determine impact based on recommendation description
    const desc = rec.description.toLowerCase();
    if (desc.includes('significant') || desc.includes('substantial') || desc.includes('dramatically')) {
      return 'high';
    }
    if (desc.includes('improve') || desc.includes('increase') || desc.includes('enhance')) {
      return 'medium';
    }
    return 'low';
  };
  
  const getEffortFromStep = (step: any): 'minimal' | 'moderate' | 'significant' => {
    if (!step.actions || step.actions.length === 0) {
      return 'moderate';
    }
    
    // Calculate based on number of actions and their difficulty
    const hardActions = step.actions.filter((a: any) => a.difficulty === 'hard').length;
    const mediumActions = step.actions.filter((a: any) => a.difficulty === 'medium').length;
    
    if (hardActions > 0 || step.actions.length >= 4) {
      return 'significant';
    }
    if (mediumActions > 0 || step.actions.length >= 2) {
      return 'moderate';
    }
    return 'minimal';
  };
  
  const getTimeEstimateFromStep = (step: any): string => {
    if (!step.actions || step.actions.length === 0) {
      return '1-2 weeks';
    }
    
    // Sum up time estimates from actions
    let totalHoursMin = 0;
    let totalHoursMax = 0;
    
    step.actions.forEach((action: any) => {
      if (action.timeEstimate) {
        const match = action.timeEstimate.match(/(\d+)-(\d+)/);
        if (match) {
          totalHoursMin += parseInt(match[1]);
          totalHoursMax += parseInt(match[2]);
        }
      }
    });
    
    // Convert hours to weeks if significant
    if (totalHoursMax > 40) {
      return `${Math.ceil(totalHoursMin / 40)}-${Math.ceil(totalHoursMax / 40)} weeks`;
    }
    
    return `${totalHoursMin}-${totalHoursMax} hours`;
  };
  
  const getDescriptionForOpportunity = (opportunity: string): string => {
    // Generate a description based on the opportunity text
    if (opportunity.includes('automation')) {
      return 'Implementing automation tools can significantly reduce manual work and increase operational efficiency.';
    }
    if (opportunity.includes('marketing')) {
      return 'Developing a more robust marketing strategy will help attract new customers and retain existing ones.';
    }
    if (opportunity.includes('financial')) {
      return 'Improving financial tracking and forecasting will lead to better business decisions and resource allocation.';
    }
    if (opportunity.includes('process')) {
      return 'Streamlining business processes will reduce wasted time and resources, leading to improved productivity.';
    }
    return 'This opportunity represents a significant area for business growth and improvement.';
  };
  
  // Generate all action items
  const allActionItems = generateActionItems();
  
  // Apply filters and sorting
  const filteredItems = allActionItems.filter(item => {
    // Apply priority filter
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
      return false;
    }
    
    // Apply effort filter
    if (effortFilter !== 'all' && item.effort !== effortFilter) {
      return false;
    }
    
    // Apply timeframe filter
    if (timeframeFilter !== 'all' && item.timeframe !== timeframeFilter) {
      return false;
    }
    
    // Apply completed filter
    if (!showCompletedItems && item.status === 'completed') {
      return false;
    }
    
    return true;
  });
  
  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    const priorityValue = { high: 3, medium: 2, low: 1 };
    const effortValue = { minimal: 1, moderate: 2, significant: 3 };
    const timeframeValue = { immediate: 1, 'short-term': 2, 'medium-term': 3, 'long-term': 4 };
    const impactValue = { high: 3, medium: 2, low: 1 };
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority':
        comparison = priorityValue[b.priority] - priorityValue[a.priority];
        break;
      case 'effort':
        comparison = effortValue[a.effort] - effortValue[b.effort];
        break;
      case 'timeframe':
        comparison = timeframeValue[a.timeframe] - timeframeValue[b.timeframe];
        break;
      case 'impact':
        comparison = impactValue[b.estimatedImpact] - impactValue[a.estimatedImpact];
        break;
      case 'source':
        comparison = a.sourceName.localeCompare(b.sourceName);
        break;
      default:
        comparison = priorityValue[b.priority] - priorityValue[a.priority];
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Function to handle sort column click
  const handleSortClick = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Function to get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return '';
    }
  };
  
  // Function to get effort badge color
  const getEffortBadgeColor = (effort: string) => {
    switch (effort) {
      case 'minimal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'significant':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };
  
  // Function to get timeframe badge color
  const getTimeframeBadgeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'short-term':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium-term':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'long-term':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return '';
    }
  };
  
  // Function to get impact badge color
  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return '';
    }
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Consolidated Action Plan</h3>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Plan
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-600 mb-4">
            This action plan consolidates all recommendations and workflow steps into a prioritized timeline. 
            Use this as your roadmap to implement improvements and track your progress.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs mb-1.5 block">Filter by Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs mb-1.5 block">Filter by Effort</Label>
              <Select value={effortFilter} onValueChange={setEffortFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Effort Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Effort Levels</SelectItem>
                  <SelectItem value="minimal">Minimal Effort</SelectItem>
                  <SelectItem value="moderate">Moderate Effort</SelectItem>
                  <SelectItem value="significant">Significant Effort</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs mb-1.5 block">Filter by Timeframe</Label>
              <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Timeframes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timeframes</SelectItem>
                  <SelectItem value="immediate">Immediate (0-30 days)</SelectItem>
                  <SelectItem value="short-term">Short Term (1-3 months)</SelectItem>
                  <SelectItem value="medium-term">Medium Term (3-6 months)</SelectItem>
                  <SelectItem value="long-term">Long Term (6+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-1">
            <Switch
              id="show-completed"
              checked={showCompletedItems}
              onCheckedChange={setShowCompletedItems}
            />
            <Label htmlFor="show-completed" className="text-sm">
              Show completed items
            </Label>
          </div>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('priority')}
                    className="font-semibold -ml-3"
                  >
                    Action Item
                    {sortBy === 'priority' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('priority')}
                    className="font-semibold -ml-3"
                  >
                    Priority
                    {sortBy === 'priority' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('effort')}
                    className="font-semibold -ml-3"
                  >
                    Effort
                    {sortBy === 'effort' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('timeframe')}
                    className="font-semibold -ml-3"
                  >
                    Timeframe
                    {sortBy === 'timeframe' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('impact')}
                    className="font-semibold -ml-3"
                  >
                    Impact
                    {sortBy === 'impact' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSortClick('source')}
                    className="font-semibold -ml-3"
                  >
                    Source
                    {sortBy === 'source' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No action items match your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow key={item.id} className={item.status === 'completed' ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-2">
                        <div className="pt-0.5">
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                          )}
                        </div>
                        <div>
                          <div className={item.status === 'completed' ? 'text-gray-500 line-through' : ''}>
                            {item.title}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.estimatedTimeToComplete}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityBadgeColor(item.priority)}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getEffortBadgeColor(item.effort)}>
                        {item.effort.charAt(0).toUpperCase() + item.effort.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTimeframeBadgeColor(item.timeframe)}>
                        {item.timeframe.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getImpactBadgeColor(item.estimatedImpact)}>
                        {item.estimatedImpact.charAt(0).toUpperCase() + item.estimatedImpact.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.source === 'workflow' && (
                          <Layers className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                        )}
                        {item.source === 'recommendation' && (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                        )}
                        {item.source === 'opportunity' && (
                          <Layers className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        )}
                        <span className="text-sm">{item.sourceName}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          {sortedItems.length} action items displayed (out of {allActionItems.length} total)
        </div>
      </CardContent>
    </Card>
  );
}