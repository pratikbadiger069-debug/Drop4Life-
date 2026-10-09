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
  ShieldCheck,
  Activity,
  Users,
  Building2,
  Lock,
  Globe,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Droplet,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "About Drop4Life — Mission & Values",
  description:
    "Learn about Drop4Life, our mission to coordinate blood donation networks, protect donor privacy, and assist emergency medical transfusions.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="bg-white border-b border-slate-200 py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <Badge variant="blush">Mission & Principles</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              About Drop4Life
            </h1>
            <p className="text-lg text-primary font-medium">
              &ldquo;{APP_CONFIG.tagline}&rdquo;
            </p>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Drop4Life was conceived to transform fragmented emergency blood appeals into an organized, deterministic, and privacy-first digital healthcare network.
            </p>
          </div>
        </section>

        {/* MISSION & THE PROBLEM WE ADDRESS */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                The Critical Challenge in Emergency Blood Transfusions
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                During medical emergencies, traumatic injuries, or acute surgeries, finding compatible blood units within a strict 60-minute window can be the difference between life and death.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Historically, families and clinicians relied on frantic social media posts, unstructured chat groups, and telephone calls. This creates massive informational friction, delayed matches, and exposes voluntary donors to privacy risks.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold text-slate-800">
                Drop4Life replaces chaos with a structured three-pillar platform uniting voluntary donors, licensed hospitals, and verified NGO blood drive coordinators.
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-primary fill-current" />
                <span>Our Tri-Role Ecosystem Approach</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-lg bg-red-50/70 p-3.5 border border-red-100">
                  <strong className="text-primary block text-sm mb-1">1. Voluntary Donors</strong>
                  <p className="text-slate-600">
                    Receive verified, role-based urgent notifications tailored strictly to their ABO/Rh blood group and geographic vicinity, without public exposure.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
                  <strong className="text-slate-900 block text-sm mb-1">2. Healthcare Providers</strong>
                  <p className="text-slate-600">
                    Issue critical blood requisitions, track candidate responses in real-time, and manage 8-group stock inventories to prevent critical stockouts.
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50/70 p-3.5 border border-amber-100">
                  <strong className="text-amber-900 block text-sm mb-1">3. Non-Governmental Organizations</strong>
                  <p className="text-slate-600">
                    Organize, publish, and mobilize community blood donation drives to consistently replenish regional blood banks before crises occur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Our Core Operating Values
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Every line of code and user interaction on Drop4Life adheres to four non-negotiable principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200 bg-slate-50/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">1. Trust & Integrity</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  We never claim fake affiliations, invent unverified donor counts, or bypass established hospital clinical screening procedures.
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-50/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">2. Strict Privacy</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  Personal phone numbers, emails, and exact home addresses are strictly shielded from public directories and search engines.
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-50/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center mb-2">
                    <Globe className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">3. Equitable Access</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  Every patient in need of life-saving blood deserves equal priority based solely on medical urgency, regardless of background.
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-50/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">4. Fast Coordination</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  Deterministic algorithm-driven matching prioritizes proximity and active readiness to minimize delays during trauma surgery.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Common questions about voluntary blood donation on Drop4Life.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                How often can I safely donate blood?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                Most health authorities recommend a minimum interval of 56 to 90 days between whole blood donations to allow your red blood cells and iron stores to replenish naturally. Drop4Life includes an automatic 90-day cooldown tracker.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                Will my contact details be publicly searchable?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                <strong>No.</strong> Your phone number, email, and exact street address are never visible in public searches. Only authorized hospital personnel receive direct contact details after you explicitly accept a blood request.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                Does Drop4Life replace laboratory crossmatching?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                <strong>No.</strong> Drop4Life assists with communication and preliminary candidate ranking. Every blood donation is subject to certified hospital phlebotomy screening and mandatory laboratory pre-transfusion crossmatching.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500 mb-3">Have a question not answered here?</p>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="gap-2">
                <span>Contact Drop4Life Support</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
