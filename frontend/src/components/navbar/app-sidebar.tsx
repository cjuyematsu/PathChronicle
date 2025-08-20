"use client"

import * as React from "react"
import { useState } from "react"; 
import { Notebook, PlaneLanding, PlaneTakeoff, Earth, Stamp, X, Shield, UserPlus } from "lucide-react"
import { useAuth } from "../../context/AuthContext"; 
import { FlagSelectorPopup } from "../../components/flagSelector";
import { NavMain, NavItem } from "@/src/components/navbar/nav-main"
import { NavUser } from "@/src/components/navbar/nav-user"
import { Sidebar, SidebarContent, SidebarFooter} from "@/src/components/navbar/ui/sidebar"
import { getCountryName } from '@/src/data/countries';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, updateUserCountry, isGuest, convertGuestToUser } = useAuth();
  const [showFlagSelector, setShowFlagSelector] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('us');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      title: "View Globe",
      url: "/",
      icon: Earth,
    },
    {
      title: "Trip Summary",
      url: "/summary",
      icon: Notebook,
    },
    {
      title: "Add Trip",
      url: "/add-trip",
      icon: PlaneTakeoff,
    },
    {
      title: "Remove Trip",
      url: "/remove-trip",
      icon: PlaneLanding,
    },
    {
      title: "Passports",
      url: "/countries",
      icon: Stamp,
    },
  ];

  const handleCountryChange = (newCountryCode: string) => {
    if (showCreateAccountModal) {
      setCountryCode(newCountryCode);
    } else {
      updateUserCountry(newCountryCode);
    }
    setShowFlagSelector(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      await convertGuestToUser(email, password, countryCode);
      setShowCreateAccountModal(false);
      // Reset form
      setEmail('');
      setPassword('');
      setCountryCode('us');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FlagSelectorPopup
        isOpen={showFlagSelector}
        onClose={() => setShowFlagSelector(false)}
        onSelectFlag={handleCountryChange}
        selectedCode={showCreateAccountModal ? countryCode : (user?.countryCode || 'us')}
      />
      
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <NavMain items={navItems} />
        </SidebarContent>

        <SidebarFooter>
          {user ? (
            <NavUser 
              user={{
                name: user.name,
                email: user.email,
                countryCode: user.countryCode,
                isGuest: isGuest
              }} 
              onLogout={logout}
              onChangeCountry={() => {
                setShowCreateAccountModal(false);
                setShowFlagSelector(true);
              }}
              onCreateAccount={isGuest ? () => setShowCreateAccountModal(true) : undefined}
            />
          ) : (
            <div></div>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Save Your Trips</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create an account to keep all your trip data
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateAccountModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  All your current trips will be saved automatically
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <button
                  type="button"
                  onClick={() => setShowFlagSelector(true)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <span className={`fi fi-${countryCode} text-xl`} />
                    <span>{getCountryName(countryCode)}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue as Guest
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}