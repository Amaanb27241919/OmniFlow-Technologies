import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuditResults } from "@/lib/auditTypes";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Users,
  Clock,
  PieChart,
  LineChart,
  Calendar,
  Download,
  RefreshCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BusinessMetricsDashboardProps {
  auditData: AuditResults;
}

interface DataPoint {
  date: string;
  value: number;
}

// Mapping of business size to default values
const sizeTierMap: Record<string, {
  monthlyRevenue: number,
  customerCount: number,
  employeeCount: number,
  operationalCost: number,
  profitMargin: number
}> = {
  'micro': {
    monthlyRevenue: 8000,
    customerCount: 20,
    employeeCount: 1,
    operationalCost: 6000,
    profitMargin: 25
  },
  'small': {
    monthlyRevenue: 25000,
    customerCount: 75,
    employeeCount: 5,
    operationalCost: 18000,
    profitMargin: 28
  },
  'medium': {
    monthlyRevenue: 70000,
    customerCount: 200,
    employeeCount: 15,
    operationalCost: 50000,
    profitMargin: 29
  },
  'large': {
    monthlyRevenue: 150000,
    customerCount: 500,
    employeeCount: 35,
    operationalCost: 100000,
    profitMargin: 33
  }
};

export default function BusinessMetricsDashboard({ auditData }: BusinessMetricsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'3m' | '6m' | '1y' | '2y'>('6m');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'customers' | 'efficiency'>('revenue');
  const [sizeTier, setSizeTier] = useState<'micro' | 'small' | 'medium' | 'large'>(determineSizeTier());
  const [showProjection, setShowProjection] = useState<boolean>(true);
  
  // Determine business size tier based on audit data
  function determineSizeTier(): 'micro' | 'small' | 'medium' | 'large' {
    const revenue = auditData.monthlyRevenue;
    const employees = auditData.employees;
    
    if (revenue === 'Less than $10,000' || employees === '1') {
      return 'micro';
    } else if ((revenue === '$10,000 - $25,000' || revenue === '$25,000 - $50,000') && 
               (employees === '2-5' || employees === '6-10')) {
      return 'small';
    } else if ((revenue === '$50,000 - $100,000') && 
               (employees === '11-25')) {
      return 'medium';
    } else {
      return 'large';
    }
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Generate historical data for the selected timeframe
  const generateHistoricalData = (metricType: string): DataPoint[] => {
    const now = new Date();
    const data: DataPoint[] = [];
    const numPoints = timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : timeframe === '1y' ? 12 : 24;
    const baseValue = getBaseValue(metricType);
    
    // Trend factors - how metrics have been trending before recommendations
    const trendFactors: Record<string, number> = {
      'revenue': auditData.revenueIncreased === 'yes' ? 1.02 : 1.0,
      'profit': auditData.profitMargin === '> 30%' ? 1.01 : 0.99,
      'customers': 1.01,
      'efficiency': 1.0
    };
    
    // Create historical data points with slight variations
    for (let i = numPoints; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // Apply trend and some randomness
      const trendFactor = Math.pow(trendFactors[metricType], i);
      const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
      const value = baseValue * trendFactor * randomFactor;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      });
    }
    
    return data;
  };
  
  // Generate projection data for the selected timeframe
  const generateProjectionData = (metricType: string, historicalData: DataPoint[]): DataPoint[] => {
    if (!showProjection) return [];
    
    const lastHistoricalPoint = historicalData[historicalData.length - 1];
    const lastDate = new Date(lastHistoricalPoint.date);
    const lastValue = lastHistoricalPoint.value;
    const data: DataPoint[] = [];
    const numPoints = 6; // 6 months of projection
    
    // Improvement factors based on implementing recommendations
    const improvementFactors: Record<string, number> = {
      'revenue': 1.03, // 3% monthly improvement
      'profit': 1.04,  // 4% monthly improvement
      'customers': 1.025, // 2.5% monthly improvement
      'efficiency': 1.05 // 5% monthly improvement
    };
    
    // Create projection data points
    for (let i = 1; i <= numPoints; i++) {
      const date = new Date(lastDate);
      date.setMonth(date.getMonth() + i);
      
      // Apply improvement and some randomness
      const improvementFactor = Math.pow(improvementFactors[metricType], i);
      const randomFactor = 0.98 + Math.random() * 0.04; // 0.98 to 1.02
      const value = lastValue * improvementFactor * randomFactor;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      });
    }
    
    return data;
  };
  
  // Get base value for the selected metric based on business size
  const getBaseValue = (metricType: string): number => {
    const sizeData = sizeTierMap[sizeTier];
    
    switch (metricType) {
      case 'revenue':
        return sizeData.monthlyRevenue;
      case 'profit':
        return sizeData.monthlyRevenue * (sizeData.profitMargin / 100);
      case 'customers':
        return sizeData.customerCount;
      case 'efficiency':
        // Efficiency score (0-100)
        return 65; // Starting efficiency score
      default:
        return 0;
    }
  };
  
  // Get the metric title and description
  const getMetricInfo = (metricType: string): { title: string; description: string; unit: string } => {
    switch (metricType) {
      case 'revenue':
        return { 
          title: 'Monthly Revenue', 
          description: 'Your business monthly revenue over time',
          unit: 'currency'
        };
      case 'profit':
        return { 
          title: 'Monthly Profit', 
          description: 'Your business monthly profit over time',
          unit: 'currency'
        };
      case 'customers':
        return { 
          title: 'Active Customers', 
          description: 'Number of active customers per month',
          unit: 'number'
        };
      case 'efficiency':
        return { 
          title: 'Operational Efficiency', 
          description: 'Operational efficiency score (higher is better)',
          unit: 'score'
        };
      default:
        return { title: '', description: '', unit: '' };
    }
  };
  
  // Generate data for the current metric
  const historicalData = generateHistoricalData(selectedMetric);
  const projectionData = generateProjectionData(selectedMetric, historicalData);
  const allData = [...historicalData, ...projectionData];
  const metricInfo = getMetricInfo(selectedMetric);
  
  // Calculate min and max values for the chart
  const values = allData.map(d => d.value);
  const minValue = Math.min(...values) * 0.9;
  const maxValue = Math.max(...values) * 1.1;
  
  // Calculate improvement percentage
  const startValue = historicalData[0].value;
  const currentValue = historicalData[historicalData.length - 1].value;
  const projectedValue = projectionData.length > 0 ? projectionData[projectionData.length - 1].value : currentValue;
  
  const historicalGrowth = ((currentValue - startValue) / startValue) * 100;
  const projectedGrowth = ((projectedValue - currentValue) / currentValue) * 100;
  
  // Get color based on growth
  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-600';
    if (growth > 0) return 'text-green-500';
    if (growth > -5) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Generate summary metrics
  const generateSummaryMetrics = () => {
    const sizeData = sizeTierMap[sizeTier];
    
    return [
      {
        title: 'Monthly Revenue',
        value: formatCurrency(sizeData.monthlyRevenue),
        change: auditData.revenueIncreased === 'yes' ? '+5.2%' : auditData.revenueIncreased === 'no' ? '-2.1%' : '+0.8%',
        icon: DollarSign,
        color: auditData.revenueIncreased === 'yes' ? 'text-green-500' : auditData.revenueIncreased === 'no' ? 'text-red-500' : 'text-orange-500'
      },
      {
        title: 'Profit Margin',
        value: `${sizeData.profitMargin}%`,
        change: sizeData.profitMargin > 25 ? '+1.5%' : '-0.8%',
        icon: TrendingUp,
        color: sizeData.profitMargin > 25 ? 'text-green-500' : 'text-orange-500'
      },
      {
        title: 'Active Customers',
        value: sizeData.customerCount.toString(),
        change: '+3.7%',
        icon: Users,
        color: 'text-green-500'
      },
      {
        title: 'Operational Costs',
        value: formatCurrency(sizeData.operationalCost),
        change: auditData.primaryExpense === 'Staff/Labor' ? '+4.2%' : '+1.7%',
        icon: DollarSign,
        color: auditData.primaryExpense === 'Staff/Labor' ? 'text-red-500' : 'text-orange-500'
      }
    ];
  };
  
  const summaryMetrics = generateSummaryMetrics();
  
  // Calculate improvement opportunity
  const calculateOpportunityValue = () => {
    const sizeData = sizeTierMap[sizeTier];
    
    // Opportunity calculations based on business metrics and recommendations
    const revenueOpportunity = sizeData.monthlyRevenue * 0.15; // 15% revenue increase opportunity
    const efficiencyOpportunity = sizeData.operationalCost * 0.12; // 12% cost reduction opportunity
    const retentionOpportunity = sizeData.monthlyRevenue * 0.05; // 5% revenue from improved retention
    
    return {
      revenueOpportunity,
      efficiencyOpportunity,
      retentionOpportunity,
      totalOpportunity: revenueOpportunity + efficiencyOpportunity + retentionOpportunity
    };
  };
  
  const opportunityValue = calculateOpportunityValue();
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Business Metrics Dashboard</h3>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {summaryMetrics.map((metric, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <h5 className="text-sm font-medium text-gray-500">{metric.title}</h5>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="text-2xl font-bold mt-2">{metric.value}</div>
                <div className={`text-xs mt-1 ${metric.color} flex items-center`}>
                  {metric.change.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                  {metric.change} from previous period
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Metric</Label>
                <Select value={selectedMetric} onValueChange={(value: 'revenue' | 'profit' | 'customers' | 'efficiency') => setSelectedMetric(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="profit">Profit</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs mb-1.5 block">Timeframe</Label>
                <Select value={timeframe} onValueChange={(value: '3m' | '6m' | '1y' | '2y') => setTimeframe(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="2y">Last 2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProjection}
                  onChange={(e) => setShowProjection(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Show projection</span>
              </label>
              
              <Button variant="outline" size="sm" className="ml-4">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium">{metricInfo.title}</h4>
              <p className="text-sm text-gray-500">{metricInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span className="text-xs">Historical</span>
                </div>
                {showProjection && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs">Projected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chart area */}
          <div className="border rounded-md p-4 bg-white">
            <div className="h-64 relative">
              {/* Chart visualization */}
              <div className="absolute inset-0">
                <div className="h-full flex items-end relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                    <div>{metricInfo.unit === 'currency' ? formatCurrency(maxValue) : maxValue}</div>
                    <div>{metricInfo.unit === 'currency' ? formatCurrency((maxValue + minValue) / 2) : Math.round((maxValue + minValue) / 2)}</div>
                    <div>{metricInfo.unit === 'currency' ? formatCurrency(minValue) : minValue}</div>
                  </div>
                  
                  {/* Chart bars */}
                  <div className="ml-12 flex-1 flex items-end space-x-1">
                    {allData.map((dataPoint, index) => {
                      const height = ((dataPoint.value - minValue) / (maxValue - minValue)) * 100;
                      const isProjection = index >= historicalData.length;
                      
                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center group"
                          style={{ height: '100%' }}
                        >
                          <div 
                            className={`w-full rounded-t ${isProjection ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left absolute bottom-0 left-1/2">
                            {new Date(dataPoint.date).toLocaleDateString(undefined, { month: 'short' })}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded p-2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <div className="font-medium">{new Date(dataPoint.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                            <div>
                              {metricInfo.unit === 'currency' 
                                ? formatCurrency(dataPoint.value) 
                                : dataPoint.value}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="h-6 mt-4 relative">
              <div className="absolute left-12 right-0 flex justify-between text-xs text-gray-500">
                <div>{new Date(allData[0].date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                <div>{new Date(allData[Math.floor(allData.length / 2)].date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                <div>{new Date(allData[allData.length - 1].date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Historical performance */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                <h5 className="font-medium">Historical Performance</h5>
              </div>
              
              <div className="mb-2">
                <div className="text-sm text-gray-600">Overall change</div>
                <div className={`text-xl font-bold ${getGrowthColor(historicalGrowth)}`}>
                  {historicalGrowth >= 0 ? '+' : ''}{historicalGrowth.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {historicalGrowth >= 5 
                  ? "Strong growth in the analyzed period."
                  : historicalGrowth >= 0
                  ? "Steady performance in the analyzed period."
                  : "Declining performance in the analyzed period."}
              </div>
              
              <div className="mt-3 text-xs">
                <div className="flex justify-between">
                  <span>Starting: {metricInfo.unit === 'currency' ? formatCurrency(startValue) : startValue}</span>
                  <span>Current: {metricInfo.unit === 'currency' ? formatCurrency(currentValue) : currentValue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Projected improvement */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                <h5 className="font-medium">Projected Improvement</h5>
              </div>
              
              <div className="mb-2">
                <div className="text-sm text-gray-600">With recommendations</div>
                <div className="text-xl font-bold text-green-600">
                  +{projectedGrowth.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Implementing recommended workflows can significantly improve your {selectedMetric} metrics.
              </div>
              
              <div className="mt-3 text-xs">
                <div className="flex justify-between">
                  <span>Current: {metricInfo.unit === 'currency' ? formatCurrency(currentValue) : currentValue}</span>
                  <span>Projected: {metricInfo.unit === 'currency' ? formatCurrency(projectedValue) : projectedValue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Improvement opportunity */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                <h5 className="font-medium">Improvement Opportunity</h5>
              </div>
              
              <div className="mb-2">
                <div className="text-sm text-gray-600">Annual impact</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(opportunityValue.totalOpportunity * 12)}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                Potential annual value from implementing all recommendations.
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Revenue growth:</span>
                  <span className="font-medium">{formatCurrency(opportunityValue.revenueOpportunity * 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency savings:</span>
                  <span className="font-medium">{formatCurrency(opportunityValue.efficiencyOpportunity * 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention value:</span>
                  <span className="font-medium">{formatCurrency(opportunityValue.retentionOpportunity * 12)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}