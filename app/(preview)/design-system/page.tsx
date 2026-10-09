"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner, Skeleton } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Dialog } from "@/components/ui/dialog";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  DONOR_NAV_ITEMS,
  HOSPITAL_NAV_ITEMS,
  NGO_NAV_ITEMS,
  ALL_BLOOD_GROUPS,
  APP_CONFIG,
} from "@/lib/constants";
import {
  Heart,
  Droplet,
  ShieldCheck,
  Activity,
  Building2,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("colors");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState("donor");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("O+");
  const [previewRole, setPreviewRole] = useState<"donor" | "hospital" | "ngo">("donor");

  const tabsList = [
    { id: "colors", label: "Colors & Tokens" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons" },
    { id: "forms", label: "Form Controls" },
    { id: "cards", label: "Cards & Surfaces" },
    { id: "badges-alerts", label: "Badges & Alerts" },
    { id: "tables-modals", label: "Tables & Modals" },
    { id: "states", label: "Loaders & States" },
    { id: "shell", label: "Dashboard Shell" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blush">Design System 1.0</Badge>
                <span className="text-xs text-muted-foreground font-mono">Phase 1 Foundation</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
                {APP_CONFIG.name} Component Explorer
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Centralized healthcare tokens, accessible controls, and responsive UI foundations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Test Modal Dialog
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Tabs
              tabs={tabsList}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Tab 1: Colors & Tokens */}
        <TabPanel id="colors" activeTab={activeTab}>
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Primary Brand Palette (Deep Blood Red)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-20 rounded-lg bg-primary mb-3 shadow-inner" />
                  <p className="font-semibold text-xs text-slate-900">Primary (Deep Red)</p>
                  <p className="text-[11px] text-muted-foreground font-mono">hsl(0, 85%, 32%) / #990000</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-20 rounded-lg bg-primary-hover mb-3 shadow-inner" />
                  <p className="font-semibold text-xs text-slate-900">Primary Hover</p>
                  <p className="text-[11px] text-muted-foreground font-mono">hsl(0, 85%, 24%) / #7A0000</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-20 rounded-lg bg-blush border border-red-100 mb-3" />
                  <p className="font-semibold text-xs text-slate-900">Soft Blush Accent</p>
                  <p className="text-[11px] text-muted-foreground font-mono">hsl(350, 95%, 95%) / #FFF0F2</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-20 rounded-lg bg-slate-900 mb-3 shadow-inner" />
                  <p className="font-semibold text-xs text-slate-900">Charcoal Dark / Slate</p>
                  <p className="text-[11px] text-muted-foreground font-mono">hsl(222, 47%, 11%) / #0F172A</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Semantic Status Colors (Accessible Healthcare Hierarchy)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-16 rounded-lg bg-red-600 mb-3" />
                  <p className="font-semibold text-xs text-slate-900">Critical / Emergency</p>
                  <p className="text-[11px] text-red-600 font-mono">#DC2626 (Red 600)</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-16 rounded-lg bg-amber-500 mb-3" />
                  <p className="font-semibold text-xs text-slate-900">Urgent / Warning</p>
                  <p className="text-[11px] text-amber-600 font-mono">#F59E0B (Amber 500)</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-16 rounded-lg bg-emerald-600 mb-3" />
                  <p className="font-semibold text-xs text-slate-900">Fulfilled / Success</p>
                  <p className="text-[11px] text-emerald-600 font-mono">#16A34A (Emerald 600)</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="h-16 rounded-lg bg-blue-600 mb-3" />
                  <p className="font-semibold text-xs text-slate-900">Info / Matching</p>
                  <p className="text-[11px] text-blue-600 font-mono">#2563EB (Blue 600)</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Tab 2: Typography */}
        <TabPanel id="typography" activeTab={activeTab}>
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs text-muted-foreground font-mono">Heading 1 / Display</span>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Every Drop Can Save a Life.
              </h1>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-mono">Heading 2 / Section</span>
              <h2 className="text-2xl font-bold text-slate-900">
                Immediate Blood Requisition Radar
              </h2>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-mono">Heading 3 / Card Title</span>
              <h3 className="text-lg font-semibold text-slate-900">
                Hospital Inventory Status (8 ABO/Rh Groups)
              </h3>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-mono">Body / Regular Text</span>
              <p className="text-base text-slate-700 leading-relaxed max-w-3xl">
                Drop4Life matches voluntary blood donors with hospitals experiencing urgent blood deficits. Compatibility criteria are evaluated deterministically to minimize clinical transfusion delays.
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-mono">Helper / Small Caption</span>
              <p className="text-xs text-muted-foreground">
                * Clinical disclaimer: Results must be verified by hospital blood bank personnel prior to administration.
              </p>
            </div>
          </div>
        </TabPanel>

        {/* Tab 3: Buttons */}
        <TabPanel id="buttons" activeTab={activeTab}>
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Button Variants
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="destructive">Destructive Action</Button>
                <Button variant="blush">Blush Accent</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Style</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Sizes & States
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (sm)</Button>
                <Button size="default">Default Size</Button>
                <Button size="lg">Large (lg)</Button>
                <Button isLoading>Processing...</Button>
                <Button disabled>Disabled State</Button>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Tab 4: Form Controls */}
        <TabPanel id="forms" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Text Inputs & Selects</h3>

              <Input
                label="Full Name"
                placeholder="Dr. Rajesh Verma"
                helperText="Enter your legal identification name."
              />

              <Input
                label="Emergency Contact Phone"
                placeholder="+91 98765 00001"
                error="Invalid phone number format."
              />

              <Select
                label="Blood Group"
                options={ALL_BLOOD_GROUPS.map((g) => ({ value: g, label: `Type ${g}` }))}
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                helperText="Select your tested ABO/Rh blood type."
              />

              <Textarea
                label="Emergency Requisition Notes"
                placeholder="Specify clinical urgency, patient age, and special crossmatch requirements..."
              />
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-semibold text-slate-900">Selections & Toggles</h3>

              <RadioGroup
                label="Select Account Role"
                name="demo-role"
                selectedValue={selectedRadio}
                onChange={setSelectedRadio}
                options={[
                  {
                    value: "donor",
                    label: "Blood Donor",
                    description: "Respond to nearby urgent blood donation alerts.",
                  },
                  {
                    value: "hospital",
                    label: "Hospital / Healthcare Provider",
                    description: "Issue critical blood requests and manage stock.",
                  },
                  {
                    value: "ngo",
                    label: "NGO / Blood Bank Coordinator",
                    description: "Organize blood donation drives and campaigns.",
                  },
                ]}
              />

              <div className="space-y-3 pt-2">
                <Checkbox
                  label="Available for Emergency Dispatch"
                  description="Receive instant high-priority notifications when a matching patient is within 15 km."
                  defaultChecked
                />
                <Checkbox
                  label="Share Approximate City with Hospitals"
                  description="Exact home address remains completely confidential."
                  defaultChecked
                />
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Tab 5: Cards & Surfaces */}
        <TabPanel id="cards" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" dot>Critical Urgency</Badge>
                  <span className="text-xs text-muted-foreground">12m ago</span>
                </div>
                <CardTitle className="mt-2">St. Jude Medical Center</CardTitle>
                <CardDescription>Department of Trauma Surgery</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Required:</strong> 3 Units of O- (Universal Donor)</p>
                <p><strong>Distance:</strong> ~4.2 km away</p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" size="sm" className="w-full">Details</Button>
                <Button variant="default" size="sm" className="w-full">Accept</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="warning">Low Stock</Badge>
                  <span className="text-xs text-muted-foreground">Updated 1h ago</span>
                </div>
                <CardTitle className="mt-2">Blood Bank Reserve (A-)</CardTitle>
                <CardDescription>City Central Blood Center</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Units Available:</strong> 4 Units</p>
                <p><strong>Threshold Limit:</strong> 10 Units minimum</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Create Stock Requisition
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="success">Active Drive</Badge>
                  <span className="text-xs text-muted-foreground">Tomorrow, 9 AM</span>
                </div>
                <CardTitle className="mt-2">Metro Blood Drive 2026</CardTitle>
                <CardDescription>Red Cross Community Center</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Target:</strong> 150 Donors</p>
                <p><strong>Registered:</strong> 88 Participants</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm" className="w-full">
                  View Campaign
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabPanel>

        {/* Tab 6: Badges & Alerts */}
        <TabPanel id="badges-alerts" activeTab={activeTab}>
          <div className="space-y-8">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Status Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="destructive" dot>Critical Request</Badge>
                <Badge variant="warning" dot>Pending Response</Badge>
                <Badge variant="success" dot>Donor Confirmed</Badge>
                <Badge variant="info" dot>Smart Matched</Badge>
                <Badge variant="blush">Blush Accent</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Semantic Alerts
              </h3>

              <Alert variant="destructive">
                <AlertTitle>Critical Blood Shortage Alert</AlertTitle>
                <AlertDescription>
                  Emergency level red cell reserve for group O- has dropped below critical safety levels at Metro General Hospital.
                </AlertDescription>
              </Alert>

              <Alert variant="warning">
                <AlertTitle>90-Day Donation Eligibility Reminder</AlertTitle>
                <AlertDescription>
                  Your last whole blood donation was 68 days ago. You will become eligible again in 22 days.
                </AlertDescription>
              </Alert>

              <Alert variant="success">
                <AlertTitle>Donation Transfusion Confirmed</AlertTitle>
                <AlertDescription>
                  Your recent donation has successfully been received and verified by St. Jude Medical Center.
                </AlertDescription>
              </Alert>

              <Alert variant="info">
                <AlertTitle>Compatibility Notice</AlertTitle>
                <AlertDescription>
                  AB+ recipients can receive red blood cells from all 8 blood groups (Universal Recipient).
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabPanel>

        {/* Tab 7: Tables & Modals */}
        <TabPanel id="tables-modals" activeTab={activeTab}>
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Accessible Data Table Example
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Available Units</TableHead>
                    <TableHead>Min. Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-red-700">O-</TableCell>
                    <TableCell>2 Units</TableCell>
                    <TableCell>8 Units</TableCell>
                    <TableCell>
                      <Badge variant="destructive" dot>Critical</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Request</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">O+</TableCell>
                    <TableCell>14 Units</TableCell>
                    <TableCell>10 Units</TableCell>
                    <TableCell>
                      <Badge variant="success" dot>Normal</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">A+</TableCell>
                    <TableCell>18 Units</TableCell>
                    <TableCell>12 Units</TableCell>
                    <TableCell>
                      <Badge variant="success" dot>Normal</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">B-</TableCell>
                    <TableCell>3 Units</TableCell>
                    <TableCell>6 Units</TableCell>
                    <TableCell>
                      <Badge variant="warning" dot>Low</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Request</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabPanel>

        {/* Tab 8: Loaders & States */}
        <TabPanel id="states" activeTab={activeTab}>
          <div className="space-y-8">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Spinners & Skeletons
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <Spinner size="sm" label="Small spinner" />
                <Spinner size="md" label="Searching donor network..." />
                <Spinner size="lg" label="Processing transfusion verification..." />
              </div>

              <div className="mt-6 space-y-2 max-w-md">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                title="No Pending Blood Requests"
                description="All emergency requests for your matching blood type (O+) have been addressed."
                actionLabel="View Past Donations"
                onAction={() => alert("Simulated navigation to past donations")}
              />

              <ErrorState
                title="Network Synchronization Error"
                message="Unable to fetch live inventory counts from the central hospital blood bank."
                onRetry={() => alert("Retrying connection...")}
              />
            </div>
          </div>
        </TabPanel>

        {/* Tab 9: Dashboard Shell */}
        <TabPanel id="shell" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Role Dashboard Shell Architecture
                </h3>
                <p className="text-xs text-muted-foreground">
                  Switch the preview to inspect Donor, Hospital, and NGO dashboard layouts.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={previewRole === "donor" ? "default" : "outline"}
                  onClick={() => setPreviewRole("donor")}
                >
                  Donor View
                </Button>
                <Button
                  size="sm"
                  variant={previewRole === "hospital" ? "default" : "outline"}
                  onClick={() => setPreviewRole("hospital")}
                >
                  Hospital View
                </Button>
                <Button
                  size="sm"
                  variant={previewRole === "ngo" ? "default" : "outline"}
                  onClick={() => setPreviewRole("ngo")}
                >
                  NGO View
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 overflow-hidden shadow-md">
              <DashboardShell
                role={previewRole}
                userName={
                  previewRole === "donor"
                    ? "Rahul Kumar (Donor)"
                    : previewRole === "hospital"
                    ? "Dr. Rajesh Verma (Apollo Hospital)"
                    : "Priya Reddy (Youth Red Cross NGO)"
                }
                userEmail={
                  previewRole === "donor"
                    ? "rahul.donor@drop4life.org"
                    : previewRole === "hospital"
                    ? "trauma.desk@apollo-hyd.org"
                    : "coordinator@redcross-lifeline.org"
                }
                navItems={
                  previewRole === "donor"
                    ? DONOR_NAV_ITEMS
                    : previewRole === "hospital"
                    ? HOSPITAL_NAV_ITEMS
                    : NGO_NAV_ITEMS
                }
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {previewRole === "donor" && "Welcome, Rahul Kumar"}
                        {previewRole === "hospital" && "Emergency Blood Radar — Apollo Hospital"}
                        {previewRole === "ngo" && "Campaign Coordination Command"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Shared responsive dashboard shell with navigation, role badge, notifications, and profile menu.
                      </p>
                    </div>
                    <Badge variant="outline">Shell Preview Mode</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">Active & Ready</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs text-muted-foreground">Associated Role</p>
                      <p className="text-lg font-bold text-primary mt-1 uppercase">{previewRole}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs text-muted-foreground">Emergency Hotline</p>
                      <p className="text-lg font-bold text-emerald-600 mt-1">1-800-DROP4LIFE</p>
                    </div>
                  </div>
                </div>
              </DashboardShell>
            </div>
          </div>
        </TabPanel>
      </main>

      {/* Confirmation Dialog Demo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Confirm Emergency Blood Request Dispatch"
        description="This action will notify all active, compatible blood donors within 15 km."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                alert("Simulated emergency dispatch confirmed.");
                setIsDialogOpen(false);
              }}
            >
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Please confirm that this requisition is authorized by the attending emergency physician. A high-priority push notification will be broadcast to the matching donor pool.
        </p>
      </Dialog>

      <Footer />
    </div>
  );
}
