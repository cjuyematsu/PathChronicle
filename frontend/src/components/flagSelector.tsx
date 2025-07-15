"use client";

import { useState } from 'react';
import { countries } from '../data/countries'


interface FlagSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlag: (countryCode: string) => void;
  selectedCode?: string;
}

export function FlagSelectorPopup({ isOpen, onClose, onSelectFlag, selectedCode }: FlagSelectorPopupProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelectFlag(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose Your Country
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 gap-2">
            {filteredCountries.map(({ code, name }) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedCode === code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                }`}
              >
                <span className={`fi fi-${code} text-2xl`} />
                <span className="text-left">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}