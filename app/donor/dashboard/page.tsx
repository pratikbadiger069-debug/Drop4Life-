"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { DONOR_NAV_ITEMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart, Clock, ShieldCheck, Activity, Droplet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DonorDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardShell
        role="donor"
        userName={user?.fullName || "Donor Member"}
        userEmail={user?.email || "donor@drop4life.org"}
        navItems={DONOR_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blush">Donor Portal (Phase 3 Active)</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Blood Group: <strong>{user?.bloodGroup || "O-"}</strong>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Welcome, {user?.fullName || "Donor Member"}
              </h1>
              <p className="text-xs text-slate-600">
                Manage your voluntary donor availability, compatible requests, and donation logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/find-blood">
                <Button size="sm" variant="default" className="font-bold">
                  Browse Emergency Requests
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-red-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Donation Eligibility</p>
                  <p className="text-base font-bold text-emerald-600">Eligible to Donate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center font-bold">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registered Blood Group</p>
                  <p className="text-base font-bold text-slate-900">{user?.bloodGroup || "O-"} (Active)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Privacy Protection</p>
                  <p className="text-base font-bold text-slate-900">Approximate Region</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Info Card */}
          <Card className="border-dashed border-slate-300 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Donor Workspace Foundation Initialized</CardTitle>
              <CardDescription className="text-xs">
                Authentication, session security, and role-based routing are verified for Phase 3. Full donor request response workflows and history tracking will expand in <strong>Phase 5</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>
                • <strong>Role Guard:</strong> Protected from unauthorized access by non-donor accounts.
              </p>
              <p>
                • <strong>Session State:</strong> Authenticated as <code>{user?.email}</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
