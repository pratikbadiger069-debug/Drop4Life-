"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { RECIPIENT_NAV_ITEMS } from "@/lib/constants";
import { BloodRequest } from "@/lib/types";
import { requestService } from "@/lib/requests/request-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Heart,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Droplet,
} from "lucide-react";

export default function RecipientDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await requestService.getBloodRequests();
        setRequests(all);
      } catch (e) {
        console.error("Failed to load blood requests", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const activeCount = requests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "IN_PROGRESS" || r.status === "UNDER_REVIEW"
  ).length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;

  return (
    <ProtectedRoute allowedRoles={["recipient", "admin"]}>
      <DashboardShell
        role="recipient"
        userName={user?.fullName || "Ananya Patel"}
        userEmail={user?.email || "recipient@drop4life.org"}
        navItems={RECIPIENT_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blush">Patient & Recipient Portal</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Location: <strong>{user?.city || "Chennai, India"}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Welcome, {user?.fullName || "Ananya Patel"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Track your active blood requests, monitor live donor matching status, and access verified blood inventory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/request-blood">
                <Button size="sm" variant="default" className="font-bold text-xs gap-1.5 shadow-md shadow-red-900/10">
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit SOS Blood Request</span>
                </Button>
              </Link>
              <Link href="/find-blood">
                <Button size="sm" variant="outline" className="font-bold text-xs gap-1.5 bg-white">
                  <Search className="w-4 h-4" />
                  <span>Search Available Blood</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-red-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Active Requests</p>
                  <p className="text-xl font-black text-slate-900">{activeCount}</p>
                  <span className="text-[10px] text-amber-700 font-medium">In coordination queue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Fulfilled Requests</p>
                  <p className="text-xl font-black text-slate-900">{fulfilledCount}</p>
                  <span className="text-[10px] text-emerald-700 font-medium">Transfusions completed</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Donor Privacy</p>
                  <p className="text-xs font-bold text-slate-900">Protected Relay Active</p>
                  <span className="text-[10px] text-slate-500">End-to-end encrypted coordination</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blood Requests Listing Card */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    Your Blood Assistance Requisitions
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Monitor progress, unique reference IDs, hospital coordination, and donor matching timelines.
                  </CardDescription>
                </div>
                <Link href="/request-blood">
                  <Button size="sm" variant="outline" className="text-xs font-bold gap-1 bg-white">
                    <span>New Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Loading requisitions...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl bg-slate-50/50 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No blood requests submitted yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    If you or a loved one requires blood, create an SOS emergency request to alert verified donors and hospitals.
                  </p>
                  <Link href="/request-blood" className="inline-block pt-2">
                    <Button size="sm" className="font-bold text-xs">
                      Submit First Blood Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-red-200 text-primary font-black text-sm shadow-xs">
                            {req.bloodGroup}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {req.referenceNumber}
                              </span>
                              <Badge
                                variant={
                                  req.priority === "CRITICAL" || req.priority === "EMERGENCY"
                                    ? "destructive"
                                    : "warning"
                                }
                                className="text-[10px] py-0 px-1.5"
                              >
                                {req.priority}
                              </Badge>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                              {req.hospitalName}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              req.status === "FULFILLED"
                                ? "success"
                                : req.status === "CANCELLED"
                                ? "secondary"
                                : "default"
                            }
                            className="text-xs font-bold py-0.5 px-2"
                          >
                            {req.status}
                          </Badge>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                            {req.unitsFulfilled} / {req.unitsNeeded} Units
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {req.city} {req.area ? `(${req.area})` : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Required: {req.requiredDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Logged: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href="/find-blood">
                          <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary p-0 h-auto">
                            <span>Check Donor Responses →</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
