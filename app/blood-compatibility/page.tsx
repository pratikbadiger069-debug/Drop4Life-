import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CompatibilityChecker } from "@/components/compatibility/compatibility-checker";
import { CompatibilityReferenceTable } from "@/components/compatibility/compatibility-reference-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Droplets,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  Activity,
} from "lucide-react";
import { RED_CELL_COMPATIBILITY_DISCLAIMER } from "@/lib/blood-compatibility";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Blood Group Compatibility Checker | ${APP_CONFIG.name}`,
  description:
    "Check red blood cell transfusion compatibility between ABO and Rh blood groups with Drop4Life's interactive clinical reference engine.",
};

export default function BloodCompatibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header / Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
            <Droplets className="w-3.5 h-3.5" />
            <span>Transfusion Science & Clinical Guidance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Blood Group Compatibility Checker
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Understand how red blood cell transfusions work between different ABO and Rh(D) blood groups. Explore compatible donor-recipient pairs and reference matrices.
          </p>
        </div>

        {/* Interactive Compatibility Checker Component */}
        <section aria-label="Interactive Compatibility Checker Tool">
          <CompatibilityChecker />
        </section>

        {/* Reference Guide & Matrix */}
        <section aria-label="Blood Group Compatibility Reference Tables">
          <CompatibilityReferenceTable />
        </section>

        {/* Educational / Transfusion Science Breakdown */}
        <section aria-label="Blood Group Science and Facts" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">
              Understanding Red Blood Cell Compatibility
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Key biological principles behind ABO blood types, Rh factors, and antibody reactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 w-fit">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  The ABO Blood System
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Red blood cells carry carbohydrate antigens on their surface known as A and B. Blood type <strong>A</strong> has A antigens, <strong>B</strong> has B antigens, <strong>AB</strong> has both, and <strong>O</strong> has neither.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 w-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  The Rh(D) Factor (+ / −)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Rh factor refers to the presence (+) or absence (−) of the D protein antigen on red cells. Rh-negative individuals can develop antibodies if exposed to Rh-positive blood, so they generally require Rh-negative red cells.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Universal Donors & Recipients
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>O−</strong> red cells carry no A, B, or Rh antigens and can be given to all groups in emergencies. <strong>AB+</strong> recipients have all antigens and can receive red cells from any ABO/Rh group.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Clinical Disclaimer Callout Banner */}
        <section aria-label="Official Medical Disclaimer">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 sm:p-7 text-amber-950 flex flex-col sm:flex-row items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-base font-bold">
                Mandatory Clinical Safety Notice
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                {RED_CELL_COMPATIBILITY_DISCLAIMER}
              </p>
              <p className="text-xs text-amber-800">
                Blood transfusion involves minor blood group antigens (Kell, Duffy, Kidd, etc.) and individual antibody screenings not captured by ABO/Rh alone. Always rely on licensed clinical blood bank testing.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Bar */}
        <section className="rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-rose-900 text-white p-8 sm:p-10 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Save a Life in Your Community?
            </h2>
            <p className="text-red-100 text-sm sm:text-base">
              Every two seconds, someone in the healthcare network needs blood. Join Drop4Life as a verified donor, hospital, or NGO coordinator.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register/donor">
              <Button size="lg" className="bg-white text-red-900 hover:bg-red-50 font-bold shadow-md">
                Register as a Blood Donor
              </Button>
            </Link>
            <Link href="/find-blood">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold">
                Find Available Blood
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
