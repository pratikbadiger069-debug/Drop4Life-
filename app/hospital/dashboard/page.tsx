"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity, Layers, Users, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function HospitalDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        userName={user?.fullName || "Hospital Staff"}
        userEmail={user?.email || "hospital@drop4life.org"}
        navItems={HOSPITAL_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Hospital Portal (Phase 3 Active)</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {user?.organizationName || "St. Jude Medical Center"}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Hospital Blood Command Radar
              </h1>
              <p className="text-xs text-slate-600">
                Authorized clinical requisition engine, 8-group stock tracking, and smart donor matching.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/find-blood">
                <Button size="sm" variant="outline">
                  View Public Radar
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verification Status</p>
                  <p className="text-base font-bold text-emerald-600 capitalize">
                    {user?.verificationStatus || "Verified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inventory Register</p>
                  <p className="text-base font-bold text-slate-900">8 ABO/Rh Groups</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Emergency Dispatch</p>
                  <p className="text-base font-bold text-slate-900">Active & Ready</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Info Card */}
          <Card className="border-dashed border-slate-300 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hospital Workspace Foundation Initialized</CardTitle>
              <CardDescription className="text-xs">
                Authentication, session security, and role-based routing are verified for Phase 3. Full emergency request builder and 8-group stock register will expand in <strong>Phase 7</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>
                • <strong>Organization:</strong> {user?.organizationName || "Healthcare Provider"}
              </p>
              <p>
                • <strong>Role Guard:</strong> Isolated from Donor and NGO accounts.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
