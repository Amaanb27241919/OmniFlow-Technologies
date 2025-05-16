import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface InsightTooltipProps {
  field: string;
  industry?: string;
  children: React.ReactNode;
}

export function InsightTooltip({ field, industry, children }: InsightTooltipProps) {
  const [open, setOpen] = useState(false);
  
  // Load the tooltip data when opened to prevent excessive API calls
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/tooltips', field, industry],
    queryFn: async () => {
      const url = new URL(`/api/tooltips/${field}`, window.location.origin);
      if (industry) {
        url.searchParams.append('industry', industry);
      }
      return await apiRequest(url.toString(), { method: "GET" });
    },
    enabled: open, // Only fetch when tooltip is opened
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
  
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full p-0 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
            aria-label={`Get insights about ${field}`}
          >
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-sm p-0 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800">
              {data?.title || field.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
          </div>
          
          <div className="p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                <span className="text-sm text-gray-600">Loading insight...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-gray-600">Unable to load insight right now.</p>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line">{data?.content}</p>
            )}
          </div>
          
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InsightTooltip;