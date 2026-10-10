"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";
import {
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleCategory, setRoleCategory] = useState("donor");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    if (!subject.trim()) {
      newErrors.subject = "Please enter a subject for your inquiry.";
    }

    if (!message.trim()) {
      newErrors.message = "Please write your message.";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate safe local form submission feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setErrors({});
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <Badge variant="blush">Support & Coordination Assistance</Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Contact Drop4Life Support
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Have questions about registering as a donor, hospital requisition onboarding, or NGO drive partnerships? Our support team is here to assist.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>Send Us a Message</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill out the form below and a representative will reply within 24–48 hours.
                  </p>
                </div>

                {/* Success Banner */}
                {isSuccess && (
                  <div className="mb-6">
                    <Alert variant="success">
                      <AlertTitle className="text-sm font-bold">
                        Message Sent Successfully (Simulated Development Mode)
                      </AlertTitle>
                      <AlertDescription className="text-xs leading-relaxed mt-1">
                        Thank you for reaching out to Drop4Life. Your message has been received in the Phase 2 test environment. (Live backend database tickets will connect in Phase 14).
                      </AlertDescription>
                    </Alert>
                    <div className="mt-3 text-right">
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                )}

                <form noValidate onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Aarav Sharma"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: "" });
                      }}
                      error={errors.fullName}
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="aarav.sharma@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="I Am Contacting As"
                      value={roleCategory}
                      onChange={(e) => setRoleCategory(e.target.value)}
                      options={[
                        { value: "donor", label: "Voluntary Donor / Public Citizen" },
                        { value: "hospital", label: "Hospital / Healthcare Provider Staff" },
                        { value: "ngo", label: "NGO / Community Organizer" },
                        { value: "general", label: "General Inquiry / Feedback" },
                      ]}
                      helperText="Helps us route your inquiry to the right coordinator."
                    />

                    <Input
                      label="Subject"
                      placeholder="e.g. Hospital blood drive query"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (errors.subject) setErrors({ ...errors, subject: "" });
                      }}
                      error={errors.subject}
                      required
                    />
                  </div>

                  <Textarea
                    label="Your Message"
                    placeholder="Provide detailed information regarding your inquiry..."
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors({ ...errors, message: "" });
                    }}
                    error={errors.message}
                    required
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto font-bold gap-2"
                      isLoading={isSubmitting}
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Quick Help & Emergency Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Emergency Helpline Box */}
              <div className="rounded-2xl border border-red-200 bg-red-900 text-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>24/7 Critical Blood Emergency Helpline</span>
                </div>
                <h3 className="text-2xl font-black mt-2 text-white">
                  {APP_CONFIG.contact.emergencyHelpline}
                </h3>
                <p className="text-xs text-red-200 mt-2 leading-relaxed">
                  For immediate acute hospital trauma requisitions or urgent inter-hospital crossmatching coordination.
                </p>
                <div className="mt-4 pt-3 border-t border-red-800 flex items-center justify-between text-xs">
                  <span className="text-red-300">Toll-Free Nationwide</span>
                  <a
                    href={`tel:${APP_CONFIG.contact.emergencyHelpline}`}
                    className="font-bold text-white underline"
                  >
                    Dial Now
                  </a>
                </div>
              </div>

              {/* General Inquiries Box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Direct Contact Channels
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">General Support Email:</strong>
                      <a href={`mailto:${APP_CONFIG.contact.email}`} className="text-primary hover:underline">
                        {APP_CONFIG.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Support Desk Hours:</strong>
                      <span>Monday – Friday, 8:00 AM – 8:00 PM EST</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Verification Team:</strong>
                      <span>Hospital and NGO license verifications processed within 24h.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick FAQ pointer */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">Looking for immediate answers?</span>
                </div>
                <Link href="/about" className="font-bold text-primary hover:underline">
                  Read FAQs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
