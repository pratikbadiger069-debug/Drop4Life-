import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/branding/brand-logo";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export const metadata = {
  title: "Access Denied — Drop4Life Authorization",
  description: "Unauthorized role access attempt detected.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 text-destructive flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-red-700">
            Authorization Restriction
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Access Denied
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            You do not have permission to access this portal resource. Drop4Life enforces strict role-based isolation between Donors, Hospital Providers, and NGO Coordinators.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="default" size="sm" className="w-full font-bold">
                My Role Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                Public Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
