"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/navbar/ui/sidebar"

// Define a more flexible type for the navigation items
export type NavItem = {
  title: string
  icon?: LucideIcon
  url?: string
  onClick?: () => void
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.url && (
              <Link href={item.url}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            )}

            {item.onClick && (
              <SidebarMenuButton
                onClick={item.onClick}
                tooltip={item.title}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}