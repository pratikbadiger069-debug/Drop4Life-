"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Calendar, Users, Flag, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NgoDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ngo", "admin"]}>
      <DashboardShell
        role="ngo"
        userName={user?.fullName || "NGO Coordinator"}
        userEmail={user?.email || "ngo@drop4life.org"}
        navItems={NGO_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">NGO Coordinator Portal (Phase 3 Active)</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {user?.organizationName || "Red Cross Community Chapter"}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Campaign & Blood Drive Command
              </h1>
              <p className="text-xs text-slate-600">
                Organize public donation campaigns, coordinate volunteer rosters, and track community yields.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/campaigns">
                <Button size="sm" variant="outline">
                  Browse Public Drives
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Organization Verification</p>
                  <p className="text-base font-bold text-emerald-600 capitalize">
                    {user?.verificationStatus || "Verified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Drives</p>
                  <p className="text-base font-bold text-slate-900">Community Drives Active</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volunteer Mobilization</p>
                  <p className="text-base font-bold text-slate-900">Coordination Active</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Info Card */}
          <Card className="border-dashed border-slate-300 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">NGO Workspace Foundation Initialized</CardTitle>
              <CardDescription className="text-xs">
                Authentication, session security, and role-based routing are verified for Phase 3. Full campaign planner, hospital partnership manager, and yield analytics will expand in <strong>Phase 8</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>
                • <strong>Organization:</strong> {user?.organizationName || "NGO Coordinator"}
              </p>
              <p>
                • <strong>Role Guard:</strong> Isolated from Donor and Hospital accounts.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
