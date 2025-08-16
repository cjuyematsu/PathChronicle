"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, LogOut, Flag } from "lucide-react"

interface NavUserProps {
  user: {
    name: string;
    email: string;
    countryCode: string;
  };
  onLogout: () => void;
  onChangeCountry: () => void;
}

export function NavUser({ user, onLogout, onChangeCountry }: NavUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const checkCollapsedState = () => {
      const selectors = [
        '[data-sidebar="sidebar"]',
        '[data-sidebar]',
        '.sidebar',
        'aside'
      ];
      
      let sidebar = null;
      for (const selector of selectors) {
        sidebar = document.querySelector(selector);
        if (sidebar) break;
      }
      
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        const isCollapsedByState = sidebar.getAttribute('data-state') === 'collapsed';
        const isCollapsedByClass = sidebar.className.includes('collapsed');
        const isCollapsedByWidth = width < 100;
        
        setIsCollapsed(isCollapsedByState || isCollapsedByClass || isCollapsedByWidth);
      }
    };

    checkCollapsedState();

    const sidebar = document.querySelector('[data-sidebar]') || document.querySelector('aside');
    let observer: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    
    if (sidebar) {
      observer = new MutationObserver(checkCollapsedState);
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['data-state', 'class']
      });
      
      resizeObserver = new ResizeObserver(checkCollapsedState);
      resizeObserver.observe(sidebar);
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleChangeCountry = () => {
    setIsOpen(false);
    onChangeCountry();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
          isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3 flex-1 min-w-0'}`}>
          <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-10 h-10'}`}>
            <span className={`fi fi-${user.countryCode} ${isCollapsed ? 'text-sm' : 'text-3xl'}`} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 ${
          isCollapsed ? 'left-full ml-2 w-64 z-[100]' : 'left-0 w-full z-50'
        }`}>
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
                     
          <button
            onClick={handleChangeCountry}
            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Flag className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2">
              <span className={`fi fi-${user.countryCode} text-sm`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Change Icon
              </span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}