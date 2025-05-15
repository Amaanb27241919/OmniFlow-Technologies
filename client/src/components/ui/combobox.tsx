import React, { useState, useEffect, useRef } from 'react';

interface ComboboxProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  options: string[] | { value: string, label: string }[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

/**
 * A combobox component that allows users to select from predefined options
 * or type their own custom value
 */
export function Combobox({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  required = false
}: ComboboxProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<{ value: string, label: string }[]>([]);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Convert options to standard format
  useEffect(() => {
    if (options.length > 0) {
      if (typeof options[0] === 'string') {
        setDisplayOptions(
          (options as string[]).map(opt => ({ value: opt, label: opt }))
        );
      } else {
        setDisplayOptions(options as { value: string, label: string }[]);
      }
    }
  }, [options]);

  // Check if the current value is in the options
  useEffect(() => {
    if (value && displayOptions.length > 0) {
      const matchingOption = displayOptions.find(opt => 
        opt.value === value || opt.label === value
      );
      
      setIsCustom(!matchingOption);
    }
  }, [value, displayOptions]);

  // Focus the custom input when switching to custom mode
  useEffect(() => {
    if (isCustom && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustom]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === "__custom__") {
      setIsCustom(true);
      // Don't trigger onChange yet, wait for custom input
    } else {
      setIsCustom(false);
      onChange(e);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleSwitchBack = () => {
    setIsCustom(false);
  };

  return (
    <div className="relative">
      {!isCustom ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={handleSelectChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
          required={required}
        >
          <option value="" disabled>{placeholder}</option>
          {displayOptions.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="__custom__">-- Enter custom value --</option>
        </select>
      ) : (
        <div className="flex w-full">
          <input
            ref={customInputRef}
            id={id}
            name={name}
            value={value}
            onChange={handleCustomInputChange}
            placeholder="Enter a custom value"
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
            required={required}
          />
          <button
            type="button"
            onClick={handleSwitchBack}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none"
          >
            ↩
          </button>
        </div>
      )}
    </div>
  );
}