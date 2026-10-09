import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  APP_CONFIG,
  ALL_BLOOD_GROUPS,
  PRIORITY_CONFIG,
} from "@/lib/constants";
import {
  MOCK_PUBLIC_REQUESTS,
  MOCK_PUBLIC_CAMPAIGNS,
  MOCK_TRUST_METRICS,
} from "@/lib/mock-data";
import { InteractiveBloodCompatibilityChecker } from "@/components/blood-compatibility/interactive-compatibility-checker";
import {
  Heart,
  Activity,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  Droplet,
  Users,
  Compass,
  PhoneCall,
  UserPlus,
  HeartHandshake,
} from "lucide-react";

export default function HomePage() {
  const featuredRequests = MOCK_PUBLIC_REQUESTS.slice(0, 3);
  const featuredCampaigns = MOCK_PUBLIC_CAMPAIGNS.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-red-50/30 to-slate-50 border-b border-slate-200/80 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline & Action */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-3.5 py-1 text-xs font-semibold text-red-800 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <span>National Blood Coordination Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                  Every Drop Can <br className="hidden sm:inline" />
                  <span className="text-primary">Save a Life.</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Connecting blood donors, hospitals, and NGOs to help people find blood donation support when it matters most.
                </p>

                {/* Primary Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <Link href="/register/donor" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full font-bold shadow-md shadow-red-900/10 inline-flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Donate Blood</span>
                    </Button>
                  </Link>
                  <Link href="/find-blood" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full font-semibold inline-flex items-center justify-center gap-2 bg-white">
                      <Search className="w-4 h-4 text-slate-600" />
                      <span>Find Blood</span>
                    </Button>
                  </Link>
                  <Link href="/request-blood" className="w-full sm:w-auto">
                    <Button variant="blush" size="lg" className="w-full font-semibold inline-flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span>Request Blood</span>
                    </Button>
                  </Link>
                </div>

                {/* Trust mini-badge */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Strict Donor Privacy
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Medical Centers
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    24/7 Rapid Coordination
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual Card (Emergency Radar Card) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-xl shadow-red-900/5 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-primary">
                        <Activity className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Urgent Requisition Radar</h3>
                        <p className="text-[11px] text-muted-foreground">Live Hospital Matching Queue</p>
                      </div>
                    </div>
                    <Badge variant="destructive" dot>Live Demo</Badge>
                  </div>

                  {/* Sample Live Requests List */}
                  <div className="space-y-3">
                    {featuredRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between transition-colors hover:bg-red-50/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-red-200 text-primary font-black text-sm shadow-sm">
                            {req.bloodGroup}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {req.hospitalName}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {req.department} • {req.city}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              req.priority === "CRITICAL"
                                ? "destructive"
                                : req.priority === "EMERGENCY"
                                ? "destructive"
                                : "warning"
                            }
                            className="text-[10px] py-0 px-1.5"
                          >
                            {req.priority}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {req.createdAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Sample live feed from regional network
                    </span>
                    <Link
                      href="/find-blood"
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View All Requests</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & IMPACT METRICS SECTION */}
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                Ecosystem Metrics
              </h2>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                A Unified Lifesaving Coordination Network
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                * Note: Figures shown represent illustrative demonstration benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-primary">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{MOCK_TRUST_METRICS.activeDonorsLabel}</p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">{MOCK_TRUST_METRICS.activeDonorsSub}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{MOCK_TRUST_METRICS.hospitalsConnectedLabel}</p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">{MOCK_TRUST_METRICS.hospitalsConnectedSub}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{MOCK_TRUST_METRICS.campaignsCompletedLabel}</p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">{MOCK_TRUST_METRICS.campaignsCompletedSub}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{MOCK_TRUST_METRICS.avgResponseTimeLabel}</p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">{MOCK_TRUST_METRICS.avgResponseTimeSub}</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4 STEPS) */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="blush" className="mb-2">4-Step Coordination Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How Drop4Life Works
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Replacing chaotic emergency messaging with a deterministic, privacy-first platform connecting verified donors, recipients, hospitals, and blood banks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-black text-lg">
                    1
                  </div>
                  <Badge variant="outline" className="text-[11px]">Onboarding</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-slate-900">1. Register</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Join as a donor, recipient, NGO, or hospital. Set up your role profile with verified credentials and location preferences.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t text-xs font-semibold text-primary">
                Quick role-based onboarding
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-black text-lg">
                    2
                  </div>
                  <Badge variant="outline" className="text-[11px]">Intake</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-slate-900">2. Search or Request</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Find available blood stock in your city or submit an SOS emergency request with required units, urgency, and facility.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t text-xs font-semibold text-primary">
                Instant SOS requisition
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-black text-lg">
                    3
                  </div>
                  <Badge variant="outline" className="text-[11px]">Algorithm</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-slate-900">3. Find a Match</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Identify compatible potential donors or authorized blood banks through clinical ABO/Rh compatibility algorithms.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t text-xs font-semibold text-primary">
                Smart donor matching
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-black text-lg">
                    4
                  </div>
                  <Badge variant="outline" className="text-[11px]">Fulfillment</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">4. Coordinate & Track</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Coordinate the donation safely, follow live request status via unique tracking IDs, and confirm transfusion completion.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t text-xs font-semibold text-emerald-600">
                End-to-end timeline tracking
              </div>
            </div>
          </div>

          {/* Action CTAs: Functional Get Started Button */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold shadow-lg shadow-red-900/10 gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-semibold gap-2 bg-white">
                <span>Explore Role Walkthrough</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 3 CORE USER ROLES SECTION */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Built for Three Dedicated Ecosystems
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Each participant role enjoys a tailored workspace built specifically for their mission.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Donor Card */}
              <Card className="flex flex-col justify-between border-slate-200 hover:border-red-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-red-100 text-primary flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Voluntary Donors</CardTitle>
                    <Badge variant="blush">For Individuals</Badge>
                  </div>
                  <CardDescription>
                    Empowering everyday heroes to save lives nearby.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 flex-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Manage donor availability and 90-day eligibility</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Receive instant alerts for compatible hospital shortages</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Coordinate donation slots and view personal lifesaving history</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href="/register/donor" className="w-full">
                    <Button variant="default" className="w-full font-bold">
                      Register as a Donor
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Hospital Card */}
              <Card className="flex flex-col justify-between border-slate-200 hover:border-red-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-800 border border-red-100 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Hospitals & Centers</CardTitle>
                    <Badge variant="destructive">For Healthcare</Badge>
                  </div>
                  <CardDescription>
                    Emergency blood bank requisition and inventory control.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 flex-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Create Critical, Emergency, and Urgent blood requests</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Find compatible, ready donors ranked by proximity</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Maintain 8-group stock levels with automated low-stock warnings</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full font-bold">
                      Access Hospital Portal
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* NGO Card */}
              <Card className="flex flex-col justify-between border-slate-200 hover:border-amber-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">NGOs & Charities</CardTitle>
                    <Badge variant="warning">For Organizers</Badge>
                  </div>
                  <CardDescription>
                    Community blood drive organizers and volunteer mobilization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 flex-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Organize, publish, and manage public blood drives</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Coordinate volunteer participant registrations</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Partner with regional hospitals to fulfill community demand</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href="/campaigns" className="w-full">
                    <Button variant="secondary" className="w-full font-bold">
                      Explore NGO Campaigns
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* INTERACTIVE BLOOD COMPATIBILITY CHECKER */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveBloodCompatibilityChecker />
        </section>

        {/* CAMPAIGNS PREVIEW SECTION */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <Badge variant="warning">Community Action</Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Featured Blood Donation Campaigns
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Upcoming community drives organized by partner NGOs and hospitals.
                </p>
              </div>

              <Link href="/campaigns">
                <Button variant="outline" size="sm" className="gap-2 self-start md:self-auto">
                  <span>View All Campaigns</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredCampaigns.map((camp) => (
                <Card key={camp.id} className="border-slate-200 hover:border-red-200 transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={camp.status === "ACTIVE" ? "success" : "default"}>
                        {camp.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        Organized by {camp.organizerName}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{camp.title}</CardTitle>
                    <CardDescription>{camp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-700" />
                      <span>{camp.startDate} – {camp.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-700" />
                      <span>{camp.locationAddress}, {camp.city}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Target: {camp.targetUnits} Units</span>
                        <span>{camp.registeredDonors} Registered</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((camp.registeredDonors / camp.targetUnits) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end">
                    <Link href="/campaigns">
                      <Button variant="outline" size="sm">
                        View Drive Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-red-900/20 blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/60 px-4 py-1.5 text-xs font-semibold text-red-300">
              <Heart className="w-3.5 h-3.5 fill-current text-red-400" />
              <span>Make an Immediate Impact</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Be Someone’s Reason to Hope.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Every two seconds, someone in the healthcare network needs blood. Join thousands of compassionate donors, hospitals, and coordinators on Drop4Life.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register/donor" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg">
                  Become a Donor
                </Button>
              </Link>
              <Link href="/campaigns" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-white border-slate-700 hover:bg-slate-800 bg-slate-900/80">
                  Explore Campaigns
                </Button>
              </Link>
              <Link href="/find-blood" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full text-slate-300 hover:text-white hover:bg-slate-800">
                  Find Blood
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
