"use client";

import {
  Bell,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Trophy,
  User as UserIcon,
  Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Batches", url: "/batches", icon: Layers },
  { title: "Students", url: "/students", icon: Users },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Assignments", url: "/assignments", icon: FileText },
  { title: "Exams & Results", url: "/exams", icon: GraduationCap },
  { title: "Fee Management", url: "/fees", icon: CreditCard },
  { title: "Notices", url: "/notices", icon: Bell },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border pl-4 pr-12 md:pr-4 py-0">
        <div className="flex w-full items-center gap-2.5 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <BookOpen className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 leading-none">
            <span className="font-heading font-semibold text-sm text-sidebar-foreground truncate">Coaching Center</span>
            <span className="text-xs text-muted-foreground truncate">Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {session?.user && (
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
            <UserIcon className="size-3.5 shrink-0" />
            <span className="truncate font-medium">{session.user.name || session.user.email}</span>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
