"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS, ALL_BLOOD_GROUPS, REQUEST_STATUS_CONFIG } from "@/lib/constants";
import { BloodRequest, RequestStatus, RequestPriority, BloodGroup } from "@/lib/types";
import { requestService } from "@/lib/requests/request-service";
import { RequestFormDialog } from "@/components/requests/request-form-dialog";
import { EmergencyBadge } from "@/components/requests/emergency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Send,
  PlusCircle,
  Search,
  Filter,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function HospitalRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "ALL">("ALL");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const data = await requestService.getBloodRequests();
        if (isMounted) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && req.priority !== priorityFilter) return false;
      if (bloodGroupFilter !== "ALL" && req.bloodGroup !== bloodGroupFilter) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = req.referenceNumber.toLowerCase().includes(q);
        const matchDept = req.department.toLowerCase().includes(q);
        const matchHosp = req.hospitalName.toLowerCase().includes(q);
        const matchGroup = req.bloodGroup.toLowerCase().includes(q);
        const matchCity = req.city.toLowerCase().includes(q);
        if (!matchRef && !matchDept && !matchHosp && !matchGroup && !matchCity) return false;
      }
      return true;
    });
  }, [requests, statusFilter, priorityFilter, bloodGroupFilter, searchQuery]);

  // Metrics
  const totalCount = requests.length;
  const criticalCount = requests.filter(
    (r) => (r.priority === "CRITICAL" || r.priority === "EMERGENCY") && r.status !== "FULFILLED" && r.status !== "CANCELLED"
  ).length;
  const inProgressCount = requests.filter(
    (r) => r.status === "IN_PROGRESS" || r.status === "UNDER_REVIEW" || r.status === "SUBMITTED"
  ).length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;

  const handleRequestCreated = (newReq: BloodRequest) => {
    setRequests((prev) => [newReq, ...prev]);
  };

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        navItems={HOSPITAL_NAV_ITEMS}
        userName={user?.fullName || "Hospital Coordinator"}
        userEmail={user?.email || "hospital@drop4life.org"}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-red-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-800/80 text-red-200 text-xs font-semibold mb-3 border border-red-700/50">
                <Send className="w-3.5 h-3.5" />
                <span>Requisitions & Smart Matching Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Blood Requisitions & Donor Coordination
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                Submit official hospital requisitions, evaluate red cell compatibility matches, and coordinate candidate invitations across active volunteer pools.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                New Requisition
              </Button>
            </div>
          </div>

          {/* Emergency Safety Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Emergency Notice & Disclaimer:</span> Drop4Life provides intelligent logistical matching and does not guarantee immediate donor availability or transfusion clearance. For immediate life-critical transfusions, directly notify regional blood banks and emergency services.
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Requisitions
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
                <span className="text-xs text-slate-400 mt-1 block">Logged records</span>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    Active Emergency
                  </span>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-black text-red-700 mt-1">{criticalCount}</div>
                <span className="text-xs text-red-600/80 mt-1 block">Critical & Emergency</span>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50/40">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  In Progress / Review
                </span>
                <div className="text-2xl font-black text-indigo-800 mt-1">{inProgressCount}</div>
                <span className="text-xs text-indigo-600/80 mt-1 block">Active matching</span>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Fulfilled
                </span>
                <div className="text-2xl font-black text-emerald-800 mt-1">{fulfilledCount}</div>
                <span className="text-xs text-emerald-600/80 mt-1 block">Successfully completed</span>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    placeholder="Search ref #, department, blood group..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "ALL")}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-red-500 focus:outline-none"
                    aria-label="Filter by Status"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as RequestPriority | "ALL")}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-red-500 focus:outline-none"
                    aria-label="Filter by Priority"
                  >
                    <option value="ALL">All Urgency Levels</option>
                    <option value="CRITICAL">Critical (&lt; 1 hr)</option>
                    <option value="EMERGENCY">Emergency (&lt; 4 hrs)</option>
                    <option value="URGENT">Urgent (&lt; 24 hrs)</option>
                    <option value="NORMAL">Standard / Scheduled</option>
                  </select>
                </div>

                {/* Blood Group Filter */}
                <div>
                  <select
                    value={bloodGroupFilter}
                    onChange={(e) => setBloodGroupFilter(e.target.value as BloodGroup | "ALL")}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-red-500 focus:outline-none font-medium"
                    aria-label="Filter by Blood Group"
                  >
                    <option value="ALL">All Blood Groups</option>
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table / Cards */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-sm">Loading blood requisitions...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 p-6">
                <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Blood Requests Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No requisitions match your filter criteria. Try clearing filters or submit a new requisition.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                    setBloodGroupFilter("ALL");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Reference & Urgency</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Units (Needed / Fulfilled)</th>
                      <th className="py-3 px-4">Department & City</th>
                      <th className="py-3 px-4">Required Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Matching & Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => {
                      const statusCfg = REQUEST_STATUS_CONFIG[req.status] || {
                        label: req.status,
                        badgeVariant: "default",
                      };

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Ref & Urgency */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Link
                              href={`/hospital/requests/${req.id}`}
                              className="font-bold text-slate-900 hover:text-red-700 font-mono text-sm block"
                            >
                              {req.referenceNumber}
                            </Link>
                            <div className="mt-1">
                              <EmergencyBadge priority={req.priority} size="sm" />
                            </div>
                          </td>

                          {/* Blood Group */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 font-black text-sm border border-red-200">
                              {req.bloodGroup}
                            </span>
                          </td>

                          {/* Units */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-sm">
                              {req.unitsFulfilled} / {req.unitsNeeded} units
                            </div>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-red-600 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (req.unitsFulfilled / req.unitsNeeded) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>

                          {/* Dept & City */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{req.department}</div>
                            <div className="text-slate-500 text-[11px]">
                              {req.city}
                              {req.area ? `, ${req.area}` : ""}
                            </div>
                          </td>

                          {/* Required Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{req.requiredDate}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Badge variant={statusCfg.badgeVariant as any}>
                              {statusCfg.label}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Link href={`/hospital/requests/${req.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 hover:bg-red-50 hover:text-red-700 hover:border-red-200 gap-1 font-semibold"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Match Donors</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Request Dialog */}
        <RequestFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onRequestCreated={handleRequestCreated}
          defaultBloodGroup="O-"
          defaultCity={user?.city || "Hyderabad"}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
