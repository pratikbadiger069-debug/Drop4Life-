import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Heart,
  Activity,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Foundation Hero Banner */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-4 py-1.5 text-xs font-semibold text-red-800 shadow-sm mb-6">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Phase 1 Initialized — Foundation & Design System Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {APP_CONFIG.name}
            </h1>

            <p className="mt-3 text-xl sm:text-2xl font-medium text-red-700">
              &ldquo;{APP_CONFIG.tagline}&rdquo;
            </p>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A unified emergency blood coordination platform connecting donors, healthcare providers, and NGO blood drives to accelerate lifesaving transfusions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/design-system">
                <Button size="lg" className="font-semibold shadow-md inline-flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Explore Design System & Components</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Core Roles Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Tri-Role Architecture
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Drop4Life coordinates three synchronized user ecosystems with customized workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Donor Role */}
            <Card className="border-red-100/80 bg-white">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-primary mb-3">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle>1. Donors</CardTitle>
                  <Badge variant="blush">Role 1</Badge>
                </div>
                <CardDescription>
                  Voluntary blood donors ready to save lives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant alerts for compatible urgent requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>90-day donation eligibility countdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personalized donation impact history</span>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Role */}
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-800 mb-3 border border-red-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle>2. Hospitals</CardTitle>
                  <Badge variant="destructive">Role 2</Badge>
                </div>
                <CardDescription>
                  Medical centers managing blood banks and emergencies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Critical & Emergency blood requisition creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart donor matching & proximity ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>8-group inventory tracker with low-stock alerts</span>
                </div>
              </CardContent>
            </Card>

            {/* NGO Role */}
            <Card className="border-amber-100/80 bg-white">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800 mb-3 border border-amber-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle>3. NGOs</CardTitle>
                  <Badge variant="warning">Role 3</Badge>
                </div>
                <CardDescription>
                  Community organizations mobilizing blood drives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Blood donation campaign organizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public blood drive scheduler & coordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hospital partnership & donor volunteer management</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Design System Callout */}
        <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">
              Drop4Life Accessible Healthcare Design System
            </h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Standardized color tokens, deep blood red primary palette, accessible typography, semantic status alerts, and responsive layouts built with TypeScript & Tailwind CSS.
            </p>
            <div className="pt-2">
              <Link href="/design-system">
                <Button variant="default" className="bg-red-700 hover:bg-red-800 text-white font-semibold">
                  Launch Component Explorer
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
