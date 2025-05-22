import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Clock,
  Save,
  Download,
  Info
} from "lucide-react";
import { AuditResults, WorkflowModule } from "@/lib/auditTypes";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ROICalculatorProps {
  auditData: AuditResults;
}

export default function ROICalculator({ auditData }: ROICalculatorProps) {
  // Business size and current metrics
  const [monthlyRevenue, setMonthlyRevenue] = useState(getDefaultRevenue());
  const [employeeCount, setEmployeeCount] = useState(getDefaultEmployeeCount());
  const [hourlyRate, setHourlyRate] = useState(50);
  const [implementationTimeframe, setImplementationTimeframe] = useState(6); // months
  const [implementationCost, setImplementationCost] = useState(calculateImplementationCost());
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [calculationType, setCalculationType] = useState<'workflow' | 'all'>('all');
  
  // Expected improvements
  const [efficiencyImprovement, setEfficiencyImprovement] = useState(15); // percentage
  const [revenueIncrease, setRevenueIncrease] = useState(10); // percentage
  const [customerRetentionIncrease, setCustomerRetentionIncrease] = useState(12); // percentage
  const [timeframeMonths, setTimeframeMonths] = useState(12); // months for ROI calculation
  
  // Helper functions to get default values from audit data
  function getDefaultRevenue(): number {
    // Parse monthly revenue from the audit data
    const revenueRanges: Record<string, number> = {
      'Less than $10,000': 8000,
      '$10,000 - $25,000': 17500,
      '$25,000 - $50,000': 37500,
      '$50,000 - $100,000': 75000,
      '> $100,000': 150000
    };
    
    return revenueRanges[auditData.monthlyRevenue] || 25000;
  }
  
  function getDefaultEmployeeCount(): number {
    // Parse employee count from the audit data
    const employeeRanges: Record<string, number> = {
      '1': 1,
      '2-5': 3,
      '6-10': 8,
      '11-25': 18,
      '26-50': 38,
      '> 50': 75
    };
    
    return employeeRanges[auditData.employees] || 5;
  }
  
  function calculateImplementationCost() {
    // Base cost calculation based on business size
    let baseCost = 0;
    
    if (employeeCount <= 1) {
      baseCost = 5000;
    } else if (employeeCount <= 5) {
      baseCost = 7500;
    } else if (employeeCount <= 10) {
      baseCost = 12500;
    } else if (employeeCount <= 25) {
      baseCost = 25000;
    } else {
      baseCost = 40000;
    }
    
    return baseCost;
  }
  
  // Update implementation cost when employee count changes
  useEffect(() => {
    setImplementationCost(calculateImplementationCost());
  }, [employeeCount]);
  
  // Calculate ROI metrics
  const calculateROI = () => {
    // Monthly time savings (hours)
    const workingHoursPerMonth = employeeCount * 160; // 160 working hours per month per employee
    const monthlySavedHours = (workingHoursPerMonth * efficiencyImprovement) / 100;
    const monthlySavings = monthlySavedHours * hourlyRate;
    
    // Revenue improvement
    const additionalMonthlyRevenue = (monthlyRevenue * revenueIncrease) / 100;
    
    // Customer retention value (assuming 20% of revenue comes from improved retention)
    const retentionValue = (monthlyRevenue * 0.2 * customerRetentionIncrease) / 100;
    
    // Total monthly benefit
    const totalMonthlyBenefit = monthlySavings + additionalMonthlyRevenue + retentionValue;
    
    // Calculate ROI over the timeframe
    const totalBenefit = totalMonthlyBenefit * timeframeMonths;
    const netBenefit = totalBenefit - implementationCost;
    const roi = (netBenefit / implementationCost) * 100;
    
    // Calculate payback period (months)
    const paybackPeriod = implementationCost / totalMonthlyBenefit;
    
    // Calculate 5-year projected benefit
    const fiveYearBenefit = totalMonthlyBenefit * 60 - implementationCost; // 60 months = 5 years
    
    return {
      monthlySavedHours,
      monthlySavings,
      additionalMonthlyRevenue,
      retentionValue,
      totalMonthlyBenefit,
      totalBenefit,
      netBenefit,
      roi,
      paybackPeriod,
      fiveYearBenefit
    };
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate ROI
  const roi = calculateROI();
  
  // Generate ROI statement
  const generateROIStatement = () => {
    const { 
      roi, 
      paybackPeriod, 
      totalMonthlyBenefit, 
      netBenefit, 
      monthlySavedHours 
    } = calculateROI();
    
    return `Based on your business metrics, implementing ${calculationType === 'workflow' && selectedWorkflow ? selectedWorkflow : 'our recommendations'} can deliver an estimated ROI of ${roi.toFixed(0)}% over ${timeframeMonths} months. You'll likely recover your investment in approximately ${paybackPeriod.toFixed(1)} months, saving about ${monthlySavedHours.toFixed(0)} work hours monthly and generating ${formatCurrency(totalMonthlyBenefit)} in additional value per month. Over the analysis period, this translates to a net benefit of ${formatCurrency(netBenefit)}.`;
  };
  
  // Generate recommendations based on ROI
  const generateRecommendations = () => {
    const { roi, paybackPeriod } = calculateROI();
    
    if (roi > 200) {
      return "The projected ROI is excellent. We strongly recommend proceeding with implementation as soon as possible to realize these substantial benefits.";
    } else if (roi > 100) {
      return "The projected ROI is very good. We recommend proceeding with implementation, prioritizing the high-impact modules first.";
    } else if (roi > 50) {
      return "The projected ROI is good. Consider implementing the recommendations in phases, starting with those that require less effort but deliver high impact.";
    } else {
      return "The projected ROI is moderate. You might want to focus on specific high-impact areas first and reassess the complete implementation.";
    }
  };
  
  // Function to adjust efficiency improvement based on selected workflow
  const adjustEfficiencyByWorkflow = (workflowName: string) => {
    switch (workflowName) {
      case 'OmniBot':
        setEfficiencyImprovement(20);
        setRevenueIncrease(15);
        setCustomerRetentionIncrease(18);
        break;
      case 'OmniAgent':
        setEfficiencyImprovement(25);
        setRevenueIncrease(8);
        setCustomerRetentionIncrease(22);
        break;
      case 'OmniAI':
        setEfficiencyImprovement(18);
        setRevenueIncrease(12);
        setCustomerRetentionIncrease(10);
        break;
      case 'OmniForge':
        setEfficiencyImprovement(30);
        setRevenueIncrease(5);
        setCustomerRetentionIncrease(8);
        break;
      case 'OmniConnect':
        setEfficiencyImprovement(22);
        setRevenueIncrease(7);
        setCustomerRetentionIncrease(12);
        break;
      default:
        setEfficiencyImprovement(15);
        setRevenueIncrease(10);
        setCustomerRetentionIncrease(12);
    }
  };
  
  // Handle workflow selection change
  const handleWorkflowChange = (workflowName: string) => {
    setSelectedWorkflow(workflowName);
    adjustEfficiencyByWorkflow(workflowName);
  };
  
  // Handle calculation type change
  const handleCalculationTypeChange = (type: 'workflow' | 'all') => {
    setCalculationType(type);
    if (type === 'all') {
      setEfficiencyImprovement(15);
      setRevenueIncrease(10);
      setCustomerRetentionIncrease(12);
      setSelectedWorkflow(null);
    } else if (type === 'workflow' && auditData.workflowRecommendations && auditData.workflowRecommendations.length > 0) {
      const firstWorkflow = auditData.workflowRecommendations[0].name;
      setSelectedWorkflow(firstWorkflow);
      adjustEfficiencyByWorkflow(firstWorkflow);
    }
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">ROI Calculator</h3>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Calculate the potential return on investment from implementing the recommended changes in your business.
            Adjust the parameters below to see how different scenarios impact your ROI.
          </p>
        </div>
        
        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="inputs">Inputs & Assumptions</TabsTrigger>
            <TabsTrigger value="results">ROI Results</TabsTrigger>
            <TabsTrigger value="projections">Projections & Graphs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inputs">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-4">Calculation Type</h4>
                
                <RadioGroup 
                  value={calculationType} 
                  onValueChange={(value) => handleCalculationTypeChange(value as 'workflow' | 'all')}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal">
                      Calculate ROI for all recommendations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="workflow" id="workflow" />
                    <Label htmlFor="workflow" className="font-normal">
                      Calculate ROI for specific workflow module
                    </Label>
                  </div>
                </RadioGroup>
                
                {calculationType === 'workflow' && (
                  <div className="mt-4">
                    <Label className="text-sm mb-1.5 block">Select Workflow Module</Label>
                    <Select 
                      value={selectedWorkflow || ''} 
                      onValueChange={handleWorkflowChange}
                      disabled={!auditData.workflowRecommendations || auditData.workflowRecommendations.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workflow module" />
                      </SelectTrigger>
                      <SelectContent>
                        {auditData.workflowRecommendations?.map((workflow, index) => (
                          <SelectItem key={index} value={workflow.name}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly-revenue" className="text-sm mb-1.5 block">
                      Monthly Revenue
                    </Label>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="monthly-revenue"
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="employee-count" className="text-sm mb-1.5 block">
                      Number of Employees
                    </Label>
                    <Input
                      id="employee-count"
                      type="number"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hourly-rate" className="text-sm mb-1.5 block">
                      Average Hourly Cost per Employee
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 inline-block ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p className="text-xs">
                              This should include salary, benefits, and overhead costs.
                              The default of $50/hour is an average for small businesses.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="hourly-rate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="implementation-cost" className="text-sm mb-1.5 block">
                      Estimated Implementation Cost
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 inline-block ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p className="text-xs">
                              This includes software costs, consulting fees, training, and other expenses
                              associated with implementing the recommended changes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="implementation-cost"
                        type="number"
                        value={implementationCost}
                        onChange={(e) => setImplementationCost(Number(e.target.value))}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-4">Expected Improvements</h4>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="efficiency-improvement" className="text-sm">
                        Efficiency Improvement
                      </Label>
                      <span className="text-sm font-medium">{efficiencyImprovement}%</span>
                    </div>
                    <Slider
                      id="efficiency-improvement"
                      min={5}
                      max={50}
                      step={1}
                      value={[efficiencyImprovement]}
                      onValueChange={([value]) => setEfficiencyImprovement(value)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative (5%)</span>
                      <span>Moderate (25%)</span>
                      <span>Aggressive (50%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="revenue-increase" className="text-sm">
                        Revenue Increase
                      </Label>
                      <span className="text-sm font-medium">{revenueIncrease}%</span>
                    </div>
                    <Slider
                      id="revenue-increase"
                      min={0}
                      max={30}
                      step={1}
                      value={[revenueIncrease]}
                      onValueChange={([value]) => setRevenueIncrease(value)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>None (0%)</span>
                      <span>Moderate (15%)</span>
                      <span>Aggressive (30%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="retention-increase" className="text-sm">
                        Customer Retention Increase
                      </Label>
                      <span className="text-sm font-medium">{customerRetentionIncrease}%</span>
                    </div>
                    <Slider
                      id="retention-increase"
                      min={0}
                      max={25}
                      step={1}
                      value={[customerRetentionIncrease]}
                      onValueChange={([value]) => setCustomerRetentionIncrease(value)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>None (0%)</span>
                      <span>Moderate (12%)</span>
                      <span>Aggressive (25%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-4">ROI Timeframe</h4>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="timeframe" className="text-sm">
                    Analysis Period
                  </Label>
                  <span className="text-sm font-medium">{timeframeMonths} months</span>
                </div>
                <Slider
                  id="timeframe"
                  min={3}
                  max={36}
                  step={3}
                  value={[timeframeMonths]}
                  onValueChange={([value]) => setTimeframeMonths(value)}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Short (3 months)</span>
                  <span>Medium (18 months)</span>
                  <span>Long (36 months)</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">ROI Summary</h4>
                <p className="text-sm text-blue-700">
                  {generateROIStatement()}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">ROI Percentage</h5>
                    <div className="text-2xl font-bold text-blue-600">{roi.roi.toFixed(0)}%</div>
                    <p className="text-xs text-gray-500 mt-1">Over {timeframeMonths} months</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Payback Period</h5>
                    <div className="text-2xl font-bold text-green-600">{roi.paybackPeriod.toFixed(1)} months</div>
                    <p className="text-xs text-gray-500 mt-1">To recover investment</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Monthly Benefit</h5>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(roi.totalMonthlyBenefit)}</div>
                    <p className="text-xs text-gray-500 mt-1">Additional value per month</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Net Benefit</h5>
                    <div className="text-2xl font-bold text-indigo-600">{formatCurrency(roi.netBenefit)}</div>
                    <p className="text-xs text-gray-500 mt-1">Total value - investment</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-3">Benefit Breakdown</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Efficiency Savings</span>
                        <span className="font-medium">{formatCurrency(roi.monthlySavings)} / month</span>
                      </div>
                      <Progress value={(roi.monthlySavings / roi.totalMonthlyBenefit) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Based on {roi.monthlySavedHours.toFixed(0)} hours saved monthly</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Increase</span>
                        <span className="font-medium">{formatCurrency(roi.additionalMonthlyRevenue)} / month</span>
                      </div>
                      <Progress value={(roi.additionalMonthlyRevenue / roi.totalMonthlyBenefit) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Based on {revenueIncrease}% increased sales</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Retention Value</span>
                        <span className="font-medium">{formatCurrency(roi.retentionValue)} / month</span>
                      </div>
                      <Progress value={(roi.retentionValue / roi.totalMonthlyBenefit) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Based on {customerRetentionIncrease}% improved retention</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Recommendation</h4>
                  
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-green-800 mb-1">Strategic Recommendation</h5>
                        <p className="text-sm text-green-700">
                          {generateRecommendations()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Implementation Considerations</h5>
                    <ul className="text-sm space-y-2 list-disc pl-5 text-gray-700">
                      <li>Start with the highest ROI components first</li>
                      <li>Consider a phased implementation approach</li>
                      <li>Allocate resources for training and adoption</li>
                      <li>Measure and track results against your baseline</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projections">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-3">5-Year Projection</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(roi.fiveYearBenefit)}</div>
                    <p className="text-sm text-gray-600">
                      Estimated net benefit over 5 years, accounting for implementation costs.
                    </p>
                    
                    <div className="mt-4">
                      <div className="mb-2 text-sm font-medium">Cumulative Value Over Time</div>
                      <div className="h-40 bg-gray-100 rounded-md flex items-end p-2 space-x-1">
                        {/* Year 1 */}
                        <div className="h-[40%] bg-blue-400 rounded-t w-full" style={{ height: `${Math.min(100, (roi.totalMonthlyBenefit * 12 - implementationCost) / roi.fiveYearBenefit * 100)}%` }}>
                          <div className="text-xs text-center pt-1 text-white font-medium">Y1</div>
                        </div>
                        
                        {/* Year 2 */}
                        <div className="h-[60%] bg-blue-500 rounded-t w-full" style={{ height: `${Math.min(100, (roi.totalMonthlyBenefit * 24 - implementationCost) / roi.fiveYearBenefit * 100)}%` }}>
                          <div className="text-xs text-center pt-1 text-white font-medium">Y2</div>
                        </div>
                        
                        {/* Year 3 */}
                        <div className="h-[75%] bg-blue-600 rounded-t w-full" style={{ height: `${Math.min(100, (roi.totalMonthlyBenefit * 36 - implementationCost) / roi.fiveYearBenefit * 100)}%` }}>
                          <div className="text-xs text-center pt-1 text-white font-medium">Y3</div>
                        </div>
                        
                        {/* Year 4 */}
                        <div className="h-[88%] bg-blue-700 rounded-t w-full" style={{ height: `${Math.min(100, (roi.totalMonthlyBenefit * 48 - implementationCost) / roi.fiveYearBenefit * 100)}%` }}>
                          <div className="text-xs text-center pt-1 text-white font-medium">Y4</div>
                        </div>
                        
                        {/* Year 5 */}
                        <div className="h-[100%] bg-blue-800 rounded-t w-full">
                          <div className="text-xs text-center pt-1 text-white font-medium">Y5</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">Years from implementation</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-3">Payback Analysis</h4>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Initial Investment</span>
                        <span className="font-medium">{formatCurrency(implementationCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Monthly Return</span>
                        <span className="font-medium">{formatCurrency(roi.totalMonthlyBenefit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payback Period</span>
                        <span className="font-medium">{roi.paybackPeriod.toFixed(1)} months</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="mb-2 text-sm font-medium">Investment Recovery Timeline</div>
                      <div className="relative pt-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${Math.min(100, (roi.paybackPeriod / 24) * 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="absolute left-0 -bottom-6 transform -translate-x-1/2">
                          <div className="w-0.5 h-2 bg-gray-400 mb-1 mx-auto"></div>
                          <div className="text-xs text-gray-500">0</div>
                        </div>
                        
                        <div className="absolute left-1/4 -bottom-6 transform -translate-x-1/2">
                          <div className="w-0.5 h-2 bg-gray-400 mb-1 mx-auto"></div>
                          <div className="text-xs text-gray-500">6mo</div>
                        </div>
                        
                        <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2">
                          <div className="w-0.5 h-2 bg-gray-400 mb-1 mx-auto"></div>
                          <div className="text-xs text-gray-500">12mo</div>
                        </div>
                        
                        <div className="absolute left-3/4 -bottom-6 transform -translate-x-1/2">
                          <div className="w-0.5 h-2 bg-gray-400 mb-1 mx-auto"></div>
                          <div className="text-xs text-gray-500">18mo</div>
                        </div>
                        
                        <div className="absolute right-0 -bottom-6 transform translate-x-1/2">
                          <div className="w-0.5 h-2 bg-gray-400 mb-1 mx-auto"></div>
                          <div className="text-xs text-gray-500">24mo</div>
                        </div>
                        
                        {/* Payback marker */}
                        <div 
                          className="absolute -top-1 transform -translate-x-1/2"
                          style={{ left: `${Math.min(100, (roi.paybackPeriod / 24) * 100)}%` }}
                        >
                          <div className="w-1 h-4 bg-green-600"></div>
                          <div className="text-xs text-green-700 font-medium whitespace-nowrap mt-1">
                            Payback: {roi.paybackPeriod.toFixed(1)} months
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-14">
                      <div className="mb-2 text-sm font-medium">Benefit Breakdown</div>
                      <div className="h-16 flex items-stretch rounded-md overflow-hidden">
                        <div 
                          className="bg-blue-500 flex items-center justify-center" 
                          style={{ width: `${(roi.monthlySavings / roi.totalMonthlyBenefit) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium px-1">Efficiency</span>
                        </div>
                        <div 
                          className="bg-purple-500 flex items-center justify-center" 
                          style={{ width: `${(roi.additionalMonthlyRevenue / roi.totalMonthlyBenefit) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium px-1">Revenue</span>
                        </div>
                        <div 
                          className="bg-green-500 flex items-center justify-center" 
                          style={{ width: `${(roi.retentionValue / roi.totalMonthlyBenefit) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium px-1">Retention</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-3">Sensitivity Analysis</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This analysis shows how changes in key assumptions affect your ROI.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Efficiency Improvement</h5>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left py-1 px-2">Value</th>
                            <th className="text-right py-1 px-2">ROI</th>
                            <th className="text-right py-1 px-2">Payback</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 px-2">10%</td>
                            <td className="text-right py-1 px-2">{(((((employeeCount * 160 * 10) / 100 * hourlyRate) + 
                                   (monthlyRevenue * revenueIncrease / 100) + 
                                   (monthlyRevenue * 0.2 * customerRetentionIncrease / 100)) * timeframeMonths - implementationCost) / 
                                   implementationCost * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{(implementationCost / 
                                ((employeeCount * 160 * 10) / 100 * hourlyRate + 
                                 (monthlyRevenue * revenueIncrease / 100) + 
                                 (monthlyRevenue * 0.2 * customerRetentionIncrease / 100))).toFixed(1)} mo</td>
                          </tr>
                          <tr className="border-b bg-blue-50">
                            <td className="py-1 px-2 font-medium">{efficiencyImprovement}%</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.roi.toFixed(0)}%</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.paybackPeriod.toFixed(1)} mo</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2">30%</td>
                            <td className="text-right py-1 px-2">{(((((employeeCount * 160 * 30) / 100 * hourlyRate) + 
                                   (monthlyRevenue * revenueIncrease / 100) + 
                                   (monthlyRevenue * 0.2 * customerRetentionIncrease / 100)) * timeframeMonths - implementationCost) / 
                                   implementationCost * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{(implementationCost / 
                                ((employeeCount * 160 * 30) / 100 * hourlyRate + 
                                 (monthlyRevenue * revenueIncrease / 100) + 
                                 (monthlyRevenue * 0.2 * customerRetentionIncrease / 100))).toFixed(1)} mo</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-2">Revenue Increase</h5>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left py-1 px-2">Value</th>
                            <th className="text-right py-1 px-2">ROI</th>
                            <th className="text-right py-1 px-2">Payback</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 px-2">5%</td>
                            <td className="text-right py-1 px-2">{(((((employeeCount * 160 * efficiencyImprovement) / 100 * hourlyRate) + 
                                   (monthlyRevenue * 5 / 100) + 
                                   (monthlyRevenue * 0.2 * customerRetentionIncrease / 100)) * timeframeMonths - implementationCost) / 
                                   implementationCost * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{(implementationCost / 
                                ((employeeCount * 160 * efficiencyImprovement) / 100 * hourlyRate + 
                                 (monthlyRevenue * 5 / 100) + 
                                 (monthlyRevenue * 0.2 * customerRetentionIncrease / 100))).toFixed(1)} mo</td>
                          </tr>
                          <tr className="border-b bg-blue-50">
                            <td className="py-1 px-2 font-medium">{revenueIncrease}%</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.roi.toFixed(0)}%</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.paybackPeriod.toFixed(1)} mo</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2">20%</td>
                            <td className="text-right py-1 px-2">{(((((employeeCount * 160 * efficiencyImprovement) / 100 * hourlyRate) + 
                                   (monthlyRevenue * 20 / 100) + 
                                   (monthlyRevenue * 0.2 * customerRetentionIncrease / 100)) * timeframeMonths - implementationCost) / 
                                   implementationCost * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{(implementationCost / 
                                ((employeeCount * 160 * efficiencyImprovement) / 100 * hourlyRate + 
                                 (monthlyRevenue * 20 / 100) + 
                                 (monthlyRevenue * 0.2 * customerRetentionIncrease / 100))).toFixed(1)} mo</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-2">Implementation Cost</h5>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left py-1 px-2">Value</th>
                            <th className="text-right py-1 px-2">ROI</th>
                            <th className="text-right py-1 px-2">Payback</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 px-2">{formatCurrency(implementationCost * 0.75)}</td>
                            <td className="text-right py-1 px-2">{(((roi.totalMonthlyBenefit * timeframeMonths - implementationCost * 0.75) / 
                                   (implementationCost * 0.75)) * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{((implementationCost * 0.75) / roi.totalMonthlyBenefit).toFixed(1)} mo</td>
                          </tr>
                          <tr className="border-b bg-blue-50">
                            <td className="py-1 px-2 font-medium">{formatCurrency(implementationCost)}</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.roi.toFixed(0)}%</td>
                            <td className="text-right py-1 px-2 font-medium">{roi.paybackPeriod.toFixed(1)} mo</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2">{formatCurrency(implementationCost * 1.5)}</td>
                            <td className="text-right py-1 px-2">{(((roi.totalMonthlyBenefit * timeframeMonths - implementationCost * 1.5) / 
                                   (implementationCost * 1.5)) * 100).toFixed(0)}%</td>
                            <td className="text-right py-1 px-2">{((implementationCost * 1.5) / roi.totalMonthlyBenefit).toFixed(1)} mo</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Detailed ROI Report
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}