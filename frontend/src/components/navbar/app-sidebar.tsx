"use client"

import * as React from "react"
import { useState } from "react"; 
import { Notebook, PlaneLanding, PlaneTakeoff, Earth, Stamp } from "lucide-react"
import { useAuth } from "../../context/AuthContext"; 
import { FlagSelectorPopup } from "../../components/flagSelector";
import { NavMain, NavItem } from "@/src/components/navbar/nav-main"
import { NavUser } from "@/src/components/navbar/nav-user"
import { Sidebar, SidebarContent, SidebarFooter} from "@/src/components/navbar/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, updateUserCountry } = useAuth();
  const [showFlagSelector, setShowFlagSelector] = useState(false);

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
    updateUserCountry(newCountryCode);
    setShowFlagSelector(false);
  };

  return (
    <>
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
            <div></div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}