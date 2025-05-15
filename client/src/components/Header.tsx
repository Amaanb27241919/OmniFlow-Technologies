import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">BusinessAudit AI</h1>
          </div>
        </Link>
        <div className="text-sm text-gray-500">Business Strategy Analysis Tool</div>
      </div>
    </header>
  );
}
