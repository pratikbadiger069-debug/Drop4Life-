"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
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
            <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
            <p className="text-xs text-slate-500 mt-1">
              Choose a secure password for your Drop4Life account.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="blush">Password Update</Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Phase 3</span>
              </div>
              <CardTitle className="text-base mt-2">New Security Credentials</CardTitle>
              <CardDescription className="text-xs">
                Your new password must be at least 8 characters.
              </CardDescription>
            </CardHeader>

            <CardContent className="py-6 space-y-4">
              {isSuccess ? (
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Password Updated!</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Your password has been reset successfully. You can now sign in with your new credentials.
                    </p>
                  </div>
                  <Link href="/login">
                    <Button className="w-full font-bold">
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4" noValidate>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="w-full space-y-1.5">
                    <label
                      htmlFor="new-password"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      New Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError("");
                        }}
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

                  <Input
                    label="Confirm New Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
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
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="pt-3 border-t bg-slate-50/50 flex justify-center rounded-b-xl text-center text-xs">
              <Link href="/login" className="text-slate-600 hover:text-slate-900">
                Cancel and return to login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
