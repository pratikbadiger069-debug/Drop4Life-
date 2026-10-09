import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { APP_CONFIG } from "@/lib/constants";
import {
  Heart,
  Activity,
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Clock,
  MapPin,
  Bell,
  Users,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "How It Works — Coordination Platform",
  description:
    "Learn how Drop4Life connects blood donors, hospitals, and NGOs to streamline blood donation requests and emergency response.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-white border-b border-slate-200 py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <Badge variant="blush">Platform Architecture & Flow</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              How Drop4Life Operates
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Drop4Life is designed to bridge the gap between acute hospital blood shortages and willing voluntary donors through automated compatibility checks, proximity ranking, and strict privacy safeguards.
            </p>
          </div>
        </section>

        {/* 3 ROLE JOURNEYS */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Role 1: Donors */}
          <div className="rounded-2xl border border-red-100 bg-white p-8 sm:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <Badge variant="blush">For Voluntary Donors</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    The Donor Journey
                  </h2>
                </div>
              </div>
              <Link href="/register/donor">
                <Button size="sm" variant="default">Join as a Donor</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-primary font-mono">STEP 1</div>
                <h4 className="font-bold text-slate-900 text-base">Simple Registration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide your ABO/Rh blood group, general city location, and contact information. Your exact street address is never published.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-primary font-mono">STEP 2</div>
                <h4 className="font-bold text-slate-900 text-base">Availability & Timer</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toggle your readiness with one click. The system automatically maintains a 90-day medical interval recommendation between whole blood donations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-primary font-mono">STEP 3</div>
                <h4 className="font-bold text-slate-900 text-base">Instant Urgency Alerts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive targeted alerts only when a verified hospital in your vicinity needs your specific compatible blood group.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-primary font-mono">STEP 4</div>
                <h4 className="font-bold text-slate-900 text-base">Verified Impact Log</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  After donating, hospital staff confirm the units received, adding a verifiable milestone record to your personal profile.
                </p>
              </div>
            </div>
          </div>

          {/* Role 2: Hospitals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-800 border border-red-100 flex items-center justify-center font-bold">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="destructive">For Medical Centers</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    The Hospital & Blood Bank Workflow
                  </h2>
                </div>
              </div>
              <Link href="/login">
                <Button size="sm" variant="outline">Hospital Portal</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-red-800 font-mono">STEP 1</div>
                <h4 className="font-bold text-slate-900 text-base">Issue Requisition</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authorized medical staff submit blood needs specifying required group, units, hospital department, and priority (Critical, Emergency, Urgent, Normal).
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-red-800 font-mono">STEP 2</div>
                <h4 className="font-bold text-slate-900 text-base">Smart Matching</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The matching engine evaluates red cell compatibility, proximity, and confirmed availability to generate an operational candidate list.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-red-800 font-mono">STEP 3</div>
                <h4 className="font-bold text-slate-900 text-base">Real-Time Coordination</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track incoming donor responses. Authorized personnel schedule arrival slots and verify identity upon reception.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-red-800 font-mono">STEP 4</div>
                <h4 className="font-bold text-slate-900 text-base">Inventory Balance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Completed donations automatically update the 8-group stock register, triggering threshold alerts when reserves fall low.
                </p>
              </div>
            </div>
          </div>

          {/* Role 3: NGOs */}
          <div className="rounded-2xl border border-amber-100 bg-white p-8 sm:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="warning">For Community Organizers</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    The NGO Campaign Coordination
                  </h2>
                </div>
              </div>
              <Link href="/campaigns">
                <Button size="sm" variant="secondary">View Campaigns</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 font-mono">STEP 1</div>
                <h4 className="font-bold text-slate-900 text-base">Plan Campaign</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Registered NGOs design public blood drives, setting date, venue, target collection units, and partner hospital affiliations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 font-mono">STEP 2</div>
                <h4 className="font-bold text-slate-900 text-base">Mobilize Volunteers</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Publish campaign details across the Drop4Life network, allowing local citizen donors to RSVP and pledge donations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 font-mono">STEP 3</div>
                <h4 className="font-bold text-slate-900 text-base">Conduct Blood Drive</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Execute on-ground donation camps in collaboration with certified phlebotomy units and partner medical facilities.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 font-mono">STEP 4</div>
                <h4 className="font-bold text-slate-900 text-base">Report & Audit</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Record collected blood units, update donor participation badges, and publish verified community yield reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SMART MATCHING CRITERIA & PRIVACY */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Smart Matching Algorithm */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Core Algorithm
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  How Smart Matching Ranks Candidates
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Drop4Life replaces guesswork with an operational scoring system that identifies donors best positioned to assist:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-slate-900 block">1. Strict ABO/Rh Compatibility</strong>
                      <span>Only candidates with medically compatible red blood cell groups are evaluated.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-slate-900 block">2. Confirmed Active Availability</strong>
                      <span>Only donors who have toggled their active status are contacted.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-slate-900 block">3. 90-Day Donation Interval Safety</strong>
                      <span>Donors within their rest window are filtered out to prevent donor fatigue.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-slate-900 block">4. Proximity Radius Optimization</strong>
                      <span>Donors closer to the requesting hospital are prioritized for rapid transit.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Shield */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Privacy-First Architecture</h4>
                    <p className="text-xs text-slate-400">Patient & Donor Confidentiality</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We believe saving lives must never compromise personal privacy. Drop4Life implements zero-public-doxxing policies:
                </p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Exact street addresses and phone numbers are <strong>never</strong> displayed in public searches.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Hospitals only receive authorized contact details once a donor explicitly consents and accepts an invite.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>All communications occur through authenticated, role-scoped in-app notifications.</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] text-slate-400">
                    Compliant with healthcare data privacy best practices and role-based access control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 text-center max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Ready to Connect with Drop4Life?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join the national healthcare coordination movement today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register/donor">
              <Button size="lg" className="font-bold">
                Become a Donor
              </Button>
            </Link>
            <Link href="/find-blood">
              <Button size="lg" variant="outline">
                Find Blood Requests
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
