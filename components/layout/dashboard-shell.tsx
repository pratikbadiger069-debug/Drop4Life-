"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole, NavItem } from "@/lib/types";
import {
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Activity,
  Heart,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  userName = "Demo User",
  userEmail = "user@drop4life.org",
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleConfig = {
    donor: {
      label: "Donor Portal",
      badgeVariant: "blush" as const,
      icon: Heart,
      color: "text-red-700",
    },
    hospital: {
      label: "Hospital Portal",
      badgeVariant: "destructive" as const,
      icon: Activity,
      color: "text-red-800",
    },
    ngo: {
      label: "NGO Coordinator",
      badgeVariant: "warning" as const,
      icon: Building2,
      color: "text-amber-800",
    },
    admin: {
      label: "System Admin",
      badgeVariant: "default" as const,
      icon: Shield,
      color: "text-slate-800",
    },
  }[role];

  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <BrandLogo size="sm" showTagline={false} />
          <div className="hidden sm:flex items-center ml-2 pl-3 border-l border-slate-200">
            <Badge variant={roleConfig.badgeVariant} className="font-semibold text-xs py-0.5">
              <RoleIcon className="w-3 h-3 mr-1" />
              {roleConfig.label}
            </Badge>
          </div>
        </div>

        {/* User menu and notifications */}
        <div className="flex items-center gap-3">
          <button
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-primary font-bold text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{userName}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{userEmail}</p>
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-red-700">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 pt-16 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full justify-between p-4">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-400 cursor-not-allowed select-none"
                    >
                      <span>{item.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                        Planned
                      </span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-50 text-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Support Section */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-primary">Need Urgent Support?</p>
              <p className="text-slate-500">24/7 Blood Coordination Center is active.</p>
              <a
                href="tel:1-800-DROP4LIFE"
                className="inline-block font-bold text-primary hover:underline mt-1"
              >
                1-800-DROP4LIFE
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
