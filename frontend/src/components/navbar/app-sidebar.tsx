"use client"

import * as React from "react"
import { useState, useEffect } from "react"; 
import {
  Notebook,
  Globe,
  Plane,
  Earth
} from "lucide-react"

import { Button } from "@/src/components/navbar/ui/button";
import { LoginPopUp } from "./login-popup";
import { AddTripPopUp } from "../tripFormPopUp"; // 1. Import the new popup
import { NavMain, NavItem } from "@/src/components/navbar/nav-main" // Import NavItem type
import { NavUser } from "@/src/components/navbar/nav-user"
import { TeamSwitcher } from "@/src/components/navbar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/src/components/navbar/ui/sidebar"

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPopUpOpen, setIsLoginPopUpOpen] = useState(false);
  const [isAddTripPopUpOpen, setIsAddTripPopUpOpen] = useState(false); // 2. Add state for the trip popup

  // 3. Update nav items to use onClick for "Add Trip"
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
      icon: Plane,
      onClick: () => setIsAddTripPopUpOpen(true), // This opens the popup
    },
  ];

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return; 
    }
    // ... (rest of your fetchUserData function is unchanged)
    try {
      const response = await fetch('/api/auth/userdata', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        localStorage.removeItem('authToken'); 
        throw new Error('Failed to fetch user data.');
      }
      const userData: UserProfile = await response.json();
      setUser(userData); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoginPopUpOpen(false); 
    setIsLoading(true);    
    fetchUserData();       
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
 
  return (
    <>
      {isLoginPopUpOpen && (
        <LoginPopUp
          onClose={() => setIsLoginPopUpOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {isAddTripPopUpOpen && (
        <AddTripPopUp onClose={() => setIsAddTripPopUpOpen(false)} />
      )}

      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={[{ name: "Globe", logo: Globe, plan:"thing" }]} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navItems} />
        </SidebarContent>
        <SidebarFooter>
          {user ? (
            <NavUser user={user} />   
          ) : (
            <div style={{ padding: '0 8px' }}>
              <Button variant="outline" className="w-full" onClick={() => setIsLoginPopUpOpen(true)}>
                Sign Up / Log In
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}