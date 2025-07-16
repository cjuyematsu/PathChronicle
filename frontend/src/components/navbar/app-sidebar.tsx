"use client"

import * as React from "react"
import { useState } from "react"; 
import { Notebook, Plane, Earth } from "lucide-react"
import { useAuth } from "../../context/AuthContext"; 
import { AddTripPopUp } from "../tripFormPopUp";
import { FlagSelectorPopup } from "../../components/flagSelector";
import { NavMain, NavItem } from "@/src/components/navbar/nav-main"
import { NavUser } from "@/src/components/navbar/nav-user"
import { Sidebar, SidebarContent, SidebarFooter} from "@/src/components/navbar/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, updateUserCountry } = useAuth();
  const [isAddTripPopUpOpen, setIsAddTripPopUpOpen] = useState(false);
  const [showFlagSelector, setShowFlagSelector] = useState(false);

  console.log("[AppSidebar] User from useAuth:", user);

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
      onClick: () => setIsAddTripPopUpOpen(true),
    },
  ];

  const handleCountryChange = (newCountryCode: string) => {
    updateUserCountry(newCountryCode);
    setShowFlagSelector(false);
  };

  return (
    <>
      {isAddTripPopUpOpen && (
        <AddTripPopUp onClose={() => setIsAddTripPopUpOpen(false)} />
      )}
      
      <FlagSelectorPopup
        isOpen={showFlagSelector}
        onClose={() => setShowFlagSelector(false)}
        onSelectFlag={handleCountryChange}
        selectedCode={user?.countryCode || 'us'}
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
                countryCode: user.countryCode
              }} 
              onLogout={logout}
              onChangeCountry={() => setShowFlagSelector(true)}
            />
          ) : (
            <div>Loading User...</div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}