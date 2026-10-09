import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Heart, Activity, Building2, Lock, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Account Sign In — Drop4Life Portals",
  description: "Sign in to your Drop4Life Donor, Hospital, or NGO coordinator portal.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-2">
              <BrandLogo size="lg" showTagline={false} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sign In to Drop4Life</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access your synchronized workspace.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="blush">Phase 3 Milestone</Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Authentication Hub</span>
              </div>
              <CardTitle className="text-base mt-2">Unified Multi-Role Portal</CardTitle>
              <CardDescription className="text-xs">
                Role-based authentication & session state will go live in <strong>Phase 3</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="py-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-red-100 bg-red-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-primary flex items-center justify-center font-bold">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">1. Donor Portal</strong>
                    <span className="text-slate-500">Eligibility & emergency request response</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Phase 3</Badge>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-red-800 border border-red-100 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">2. Hospital Portal</strong>
                    <span className="text-slate-500">Emergency requisition & inventory tracking</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Phase 3</Badge>
              </div>

              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">3. NGO Coordinator</strong>
                    <span className="text-slate-500">Campaigns & blood drive mobilization</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">Phase 3</Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t flex flex-col gap-2">
              <Link href="/design-system" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5">
                  <span>Inspect Dashboard Shells in Component Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Public Home</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
