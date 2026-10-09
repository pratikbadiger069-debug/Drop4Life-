"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { APP_CONFIG } from "@/lib/constants";
import { Eye, EyeOff, Lock, Heart, Activity, Building2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="max-w-md w-full my-6">
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="inline-flex justify-center mb-2">
          <BrandLogo size="lg" showTagline={false} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Drop4Life
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          &ldquo;{APP_CONFIG.tagline}&rdquo;
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <Badge variant="blush">Secure Authentication</Badge>
            <span className="text-[11px] text-muted-foreground font-mono">Phase 3</span>
          </div>
          <CardTitle className="text-base mt-2">Account Portal Login</CardTitle>
          <CardDescription className="text-xs">
            Enter your credentials to access your role-specific dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-6 space-y-4">
          {/* Error Banner */}
          {errorMsg && (
            <Alert variant="destructive">
              <AlertTitle className="text-xs font-bold">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Quick Demo Account Selector for Review */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Demo Accounts (Instant Testing):</span>
              <span className="text-[10px] text-muted-foreground">Click to Autofill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo("donor@drop4life.org", "DonorPass123!")}
                className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-100/70 text-[11px] font-semibold text-primary flex items-center justify-center gap-1 transition-colors"
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Donor</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("hospital@drop4life.org", "HospitalPass123!")}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-800 flex items-center justify-center gap-1 transition-colors"
              >
                <Activity className="w-3 h-3" />
                <span>Hospital</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("ngo@drop4life.org", "NgoPass123!")}
                className="p-1.5 rounded-lg border border-amber-200 bg-white hover:bg-amber-100 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1 transition-colors"
              >
                <Building2 className="w-3 h-3" />
                <span>NGO</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@drop4life.org", "AdminPass123!")}
                className="p-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-100 text-[11px] font-semibold text-indigo-900 flex items-center justify-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password <span className="text-destructive">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 pr-10 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input text-primary accent-primary"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold shadow-md gap-2"
              isLoading={isSubmitting}
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-3 border-t bg-slate-50/50 flex flex-col gap-3 rounded-b-xl text-center text-xs">
          <p className="text-slate-600">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            ← Return to Public Website
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense fallback={<div className="text-xs text-muted-foreground">Loading login portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
