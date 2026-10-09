import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Heart, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Register as a Donor — Drop4Life",
  description: "Join Drop4Life as a voluntary blood donor to receive compatible urgent shortage alerts.",
};

export default function RegisterDonorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-2">
              <BrandLogo size="lg" showTagline={false} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Become a Drop4Life Donor</h1>
            <p className="text-xs text-slate-500 mt-1">
              Join our national network of voluntary blood donors.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="blush">Phase 3 Milestone</Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Donor Onboarding</span>
              </div>
              <CardTitle className="text-base mt-2">Donor Registration Hub</CardTitle>
              <CardDescription className="text-xs">
                Complete donor registration with ABO/Rh group selection, location radius, and privacy levels goes live in <strong>Phase 3</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="py-5 space-y-4 text-xs text-slate-600">
              <div className="rounded-xl bg-red-50/60 p-4 border border-red-100 space-y-2">
                <strong className="text-primary block font-semibold text-sm">
                  What You Can Expect as a Drop4Life Donor:
                </strong>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant notifications when your blood group is critically needed within your area.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Strict confidentiality — your phone number and home address are never made public.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Personalized donation interval tracker (90-day cooldown) and verified lifesaving history.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <p className="font-semibold text-slate-900 mb-1">Explore Available Requisitions Now</p>
                <p>
                  While onboarding is preparing for Phase 3, you can browse open hospital blood requisitions and campaigns on the public discovery pages.
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t flex flex-col gap-2">
              <Link href="/find-blood" className="w-full">
                <Button variant="default" size="sm" className="w-full text-xs font-bold gap-1.5">
                  <span>Explore Open Blood Requisitions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Home</span>
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
