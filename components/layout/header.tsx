"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding/brand-logo";
import { PUBLIC_NAV_ITEMS, APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top Emergency & Trust Ribbon */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-red-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              Emergency Response Network:
            </span>
            <span className="hidden sm:inline text-slate-300">
              24/7 Blood Coordination Helpline:
            </span>
            <a
              href={`tel:${APP_CONFIG.contact.emergencyHelpline}`}
              className="font-bold text-white hover:underline inline-flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3 text-red-400" />
              {APP_CONFIG.contact.emergencyHelpline}
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
            <span>{APP_CONFIG.tagline}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Network Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center">
            <BrandLogo size="md" showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              if (item.disabled) {
                return (
                  <span
                    key={item.href}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed select-none rounded-md"
                    title={`Coming in ${item.note || "upcoming phase"}`}
                  >
                    {item.title}
                    {item.note && (
                      <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {item.note}
                      </span>
                    )}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-red-50 text-primary font-semibold"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.title}
                  {item.href === "/design-system" && (
                    <Badge variant="blush" className="ml-1.5 text-[10px] py-0 px-1.5">
                      Preview
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Role Access CTA buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold text-slate-800">
                Log In
              </Button>
            </Link>
            <Link href="/register/donor">
              <Button variant="default" size="sm" className="font-semibold shadow-sm">
                Become a Donor
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 select-none"
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {item.note || "Soon"}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-red-50 text-primary font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>{item.title}</span>
                  {item.href === "/design-system" && (
                    <Badge variant="blush" className="text-[10px]">
                      Preview
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Log In
              </Button>
            </Link>
            <Link href="/register/donor" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full justify-center">
                Become a Donor
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
