import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function FormProgress({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}: FormProgressProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-2">
          {stepTitles.map((title, index) => (
            <div 
              key={index}
              className={`text-xs md:text-sm font-medium ${
                index + 1 === currentStep 
                  ? 'text-primary' 
                  : index + 1 < currentStep 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    index + 1 === currentStep 
                      ? 'bg-primary text-white' 
                      : index + 1 < currentStep 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden md:inline text-center">{title}</span>
                <span className="md:hidden text-center">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Current step title - visible on mobile */}
      <div className="md:hidden text-center mb-4">
        <h3 className="text-lg font-medium">{stepTitles[currentStep - 1]}</h3>
      </div>
    </div>
  );
}