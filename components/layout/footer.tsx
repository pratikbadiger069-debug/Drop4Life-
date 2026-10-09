import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding/brand-logo";
import { APP_CONFIG } from "@/lib/constants";
import { ShieldCheck, Heart, PhoneCall, Mail, AlertTriangle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/10 p-2.5 rounded-xl inline-block">
              <BrandLogo size="md" showTagline={false} clickable={false} className="text-white" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {APP_CONFIG.name} is a dedicated healthcare coordination platform unifying donors, hospitals, and NGOs to save lives across the nation.
            </p>
            <div className="flex items-center gap-2 text-xs text-red-400 font-semibold tracking-wide uppercase">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{APP_CONFIG.tagline}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/request-blood" className="hover:text-white transition-colors font-semibold text-red-300 hover:text-red-200">
                  Request Blood
                </Link>
              </li>
              <li>
                <Link href="/find-blood" className="hover:text-white transition-colors">
                  Find Blood
                </Link>
              </li>
              <li>
                <Link href="/blood-compatibility" className="hover:text-white transition-colors">
                  Blood Compatibility
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-white transition-colors">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Drop4Life
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-white transition-colors">
                  Design System Preview
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles & Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              User Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Donor Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Hospital Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  NGO Coordinator Portal
                </Link>
              </li>
              <li>
                <Link href="/register/donor" className="hover:text-white transition-colors">
                  Register as Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* 24/7 Helpline & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Emergency Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-red-950/60 border border-red-800/60 p-3">
                <span className="text-xs text-red-300 font-semibold block">
                  24/7 Emergency Line
                </span>
                <a
                  href={`tel:${APP_CONFIG.contact.emergencyHelpline}`}
                  className="text-white font-bold hover:underline flex items-center gap-1.5 mt-1"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                  {APP_CONFIG.contact.emergencyHelpline}
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${APP_CONFIG.contact.email}`} className="hover:text-white">
                  {APP_CONFIG.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer Box */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Clinical & Safety Disclaimer:</strong> {APP_CONFIG.name} is a coordination and informational platform. Blood compatibility charts, inventory dashboards, and donor matching scores are for screening support only and do not replace mandatory laboratory crossmatching, infectious disease screening, or physician evaluation prior to any transfusion.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} {APP_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Health Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
