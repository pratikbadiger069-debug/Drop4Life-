"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // Simulate safe generic password recovery response
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full my-6">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-2">
              <BrandLogo size="lg" showTagline={false} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Reset Your Password</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your email address to receive password recovery instructions.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="blush">Account Recovery</Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Phase 3</span>
              </div>
              <CardTitle className="text-base mt-2">Password Assistance</CardTitle>
              <CardDescription className="text-xs">
                We will send instructions to verify your account identity.
              </CardDescription>
            </CardHeader>

            <CardContent className="py-6 space-y-4">
              {isSubmitted ? (
                <div className="space-y-4">
                  <Alert variant="success">
                    <AlertTitle className="text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Recovery Instructions Sent</span>
                    </AlertTitle>
                    <AlertDescription className="text-xs leading-relaxed mt-1">
                      If an account is associated with <strong>{email}</strong>, you will receive an email containing a secure password reset link.
                    </AlertDescription>
                  </Alert>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <strong className="text-slate-900 block mb-0.5">Development Environment Note:</strong>
                    Live transactional email delivery will be wired through Supabase / SMTP in Phase 14. For testing, you can use the test reset link below:
                    <div className="mt-2">
                      <Link href="/reset-password">
                        <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                          Proceed to Reset Password Form (Demo)
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Input
                    label="Registered Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-bold shadow-md gap-2"
                    isLoading={isLoading}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="pt-3 border-t bg-slate-50/50 flex justify-center rounded-b-xl text-center text-xs">
              <Link href="/login" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
