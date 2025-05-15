import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, ChevronRight, HelpCircle } from "lucide-react";

export default function Welcome() {
  return (
    <div className="container-custom">
      <Card className="form-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to BusinessAudit AI</h2>
          <p className="text-gray-600 mb-6">
            Get a personalized business analysis in just a few minutes. Our AI consultant will analyze your business and provide tailored recommendations to help you grow.
          </p>
          
          <div className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-100">
            <div className="flex items-start">
              <InfoIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-primary-700">
                You'll be asked questions about your business operations, revenue, and goals. The more details you provide, the more accurate our recommendations will be.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Link href="/audit">
              <Button className="w-full sm:w-auto">
                Start Business Audit
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Learn More</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
