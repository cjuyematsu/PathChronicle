"use client"

import * as React from "react"
import { useState } from "react"; 
import { Notebook, Plane, Earth } from "lucide-react"
import { useAuth } from "../../context/AuthContext"; 
import { AddTripPopUp } from "../tripFormPopUp";
import { NavMain, NavItem } from "@/src/components/navbar/nav-main"
import { NavUser } from "@/src/components/navbar/nav-user"
import { Sidebar, SidebarContent, SidebarFooter} from "@/src/components/navbar/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const [isAddTripPopUpOpen, setIsAddTripPopUpOpen] = useState(false);

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

  return (
    <>
      {isAddTripPopUpOpen && (
        <AddTripPopUp onClose={() => setIsAddTripPopUpOpen(false)} />
      )}
      
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
            />
          ) : (
            <div>Loading User...</div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}