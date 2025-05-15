import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="#">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">About</span>
            </Link>
            <Link href="#">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Privacy</span>
            </Link>
            <Link href="#">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Terms</span>
            </Link>
            <Link href="#">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Contact</span>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} BusinessAudit AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
