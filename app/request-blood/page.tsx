"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ALL_BLOOD_GROUPS,
  PRIORITY_CONFIG,
  INDIAN_CITIES,
  isValidIndianPhoneNumber,
  formatIndianPhoneNumber,
} from "@/lib/constants";
import { BloodGroup, RequestPriority, BloodComponent, BloodRequest } from "@/lib/types";
import { requestService } from "@/lib/requests/request-service";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Send,
  Heart,
  Hospital,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Search,
} from "lucide-react";

export default function RequestBloodPage() {
  const { user } = useAuth();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [component, setComponent] = useState<BloodComponent>("rbc");
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [priority, setPriority] = useState<RequestPriority>("URGENT");
  const [hospitalName, setHospitalName] = useState<string>(
    user?.organizationName || "Apollo Hospital, Jubilee Hills"
  );
  const [department, setDepartment] = useState<string>("Trauma & Critical Care Wing");
  const [city, setCity] = useState<string>(user?.city || "Hyderabad");
  const [area, setArea] = useState<string>("Jubilee Hills, Road No. 72");
  const [requiredDate, setRequiredDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [requesterName, setRequesterName] = useState<string>(user?.fullName || "Aarav Sharma");
  const [requesterPhone, setRequesterPhone] = useState<string>("+91 98765 00001");
  const [requesterEmail, setRequesterEmail] = useState<string>(user?.email || "aarav.sharma@example.com");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<BloodRequest | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!hospitalName.trim()) {
      setErrorMsg("Please specify the hospital or healthcare facility name.");
      return;
    }
    if (!city.trim()) {
      setErrorMsg("Please select or enter the city.");
      return;
    }
    if (!unitsNeeded || unitsNeeded < 1 || unitsNeeded > 20) {
      setErrorMsg("Units required must be between 1 and 20 units.");
      return;
    }
    if (!requiredDate) {
      setErrorMsg("Please choose the required date for transfusion.");
      return;
    }
    if (!requesterName.trim()) {
      setErrorMsg("Requester contact name is required.");
      return;
    }
    if (!isValidIndianPhoneNumber(requesterPhone)) {
      setErrorMsg("Please enter a valid Indian mobile number (10 digits starting with 6-9, with optional +91).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bloodGroup,
        component,
        unitsNeeded: Number(unitsNeeded),
        priority,
        hospitalName: hospitalName.trim(),
        department: department.trim() || "Emergency Care",
        city: city.trim(),
        area: area.trim() || undefined,
        requiredDate,
        requesterName: requesterName.trim(),
        requesterPhone: formatIndianPhoneNumber(requesterPhone),
        requesterEmail: requesterEmail.trim(),
        clinicalNotes: clinicalNotes.trim(),
      };

      const result = await requestService.submitEmergencyBloodRequest(payload);
      setSubmittedRequest(result);
    } catch (err: any) {
      console.error("Failed to submit request", err);
      setErrorMsg(err.message || "Unable to submit blood requisition. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Headline Banner */}
          <div className="text-center space-y-3">
            <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              SOS Emergency Requisition Form
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Request Blood Assistance
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Submit an urgent or scheduled blood requisition. Drop4Life alerts verified compatible donors and participating regional blood banks across India.
            </p>
          </div>

          {/* Success Result View */}
          {submittedRequest ? (
            <Card className="border-emerald-200 bg-white shadow-xl overflow-hidden animate-in fade-in-50">
              <div className="bg-emerald-600 text-white p-6 sm:p-8 text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-white border border-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black">Blood Requisition Logged Successfully</h2>
                <p className="text-emerald-100 text-sm max-w-lg mx-auto">
                  Your emergency requisition is recorded in the live registry and has been routed for hospital triage and smart donor matching.
                </p>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Unique Request ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                      {submittedRequest.referenceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Blood Group & Component</span>
                    <span className="font-black text-red-600 text-base">
                      {submittedRequest.bloodGroup} ({submittedRequest.component?.toUpperCase() || "RBC"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Units Required</span>
                    <span className="font-bold text-slate-900 text-base">
                      {submittedRequest.unitsNeeded} Units
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current Status</span>
                    <Badge variant="warning" className="text-[10px] mt-0.5">
                      {submittedRequest.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Hospital Facility:</strong> {submittedRequest.hospitalName} ({submittedRequest.city}, {submittedRequest.area || "City Center"})
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Primary Contact:</strong> {submittedRequest.requesterName} • {submittedRequest.requesterPhone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/find-blood" className="flex-1">
                    <Button variant="default" className="w-full gap-2 font-bold shadow-md">
                      <Search className="w-4 h-4" />
                      Search Available Blood Banks
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setSubmittedRequest(null)}
                    className="flex-1 font-semibold"
                  >
                    Submit Another Requisition
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Requisition Form */
            <Card className="border-slate-200 bg-white shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-200 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600 fill-red-100" />
                  Requisition & Patient Allocation Details
                </CardTitle>
                <p className="text-xs text-slate-500">
                  All fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory for regional coordination.
                </p>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border bg-red-50 text-red-900 border-red-200"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Section 1: Blood Group, Component, Quantity, and Urgency */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Blood Group, Component & Urgency
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Blood Group */}
                      <div>
                        <Label htmlFor="req-blood-group" className="text-xs font-bold text-slate-700">
                          Blood Group <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="req-blood-group"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                          className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-300 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {ALL_BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Component */}
                      <div>
                        <Label htmlFor="req-component" className="text-xs font-bold text-slate-700">
                          Blood Component <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="req-component"
                          value={component}
                          onChange={(e) => setComponent(e.target.value as BloodComponent)}
                          className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-300 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="rbc">Packed Red Blood Cells (PRBC)</option>
                          <option value="plasma">Fresh Frozen Plasma (FFP)</option>
                          <option value="platelets">Platelet Concentrate (RDP / SDP)</option>
                        </select>
                      </div>

                      {/* Units Needed */}
                      <div>
                        <Label htmlFor="req-units" className="text-xs font-bold text-slate-700">
                          Units Required <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="req-units"
                          type="number"
                          min={1}
                          max={20}
                          value={unitsNeeded}
                          onChange={(e) => setUnitsNeeded(parseInt(e.target.value) || 1)}
                          className="mt-1.5 h-10 text-sm font-bold"
                          required
                        />
                      </div>

                      {/* Urgency */}
                      <div>
                        <Label htmlFor="req-urgency" className="text-xs font-bold text-slate-700">
                          Urgency Level <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="req-urgency"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as RequestPriority)}
                          className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-300 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="CRITICAL">Critical (&lt; 1 hr)</option>
                          <option value="EMERGENCY">Emergency (&lt; 4 hrs)</option>
                          <option value="URGENT">Urgent (&lt; 24 hrs)</option>
                          <option value="NORMAL">Standard / Scheduled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Hospital & Location Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      2. Hospital & Treatment Center
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="req-hospital" className="text-xs font-bold text-slate-700">
                          Hospital Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="req-hospital"
                          placeholder="e.g. Apollo Hospital, AIIMS, Fortis Hospital"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="req-department" className="text-xs font-bold text-slate-700">
                          Department / Wing
                        </Label>
                        <Input
                          id="req-department"
                          placeholder="e.g. Trauma Surgery, ICU, Oncology Wing"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="req-city" className="text-xs font-bold text-slate-700">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="req-city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-1.5 w-full h-10 px-3 rounded-md border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {INDIAN_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="req-area" className="text-xs font-bold text-slate-700">
                          Area / Locality
                        </Label>
                        <Input
                          id="req-area"
                          placeholder="e.g. Jubilee Hills, Whitefield, Anna Nagar"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="req-date" className="text-xs font-bold text-slate-700">
                          Required By Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="req-date"
                          type="date"
                          value={requiredDate}
                          onChange={(e) => setRequiredDate(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Contact & Medical Coordinator */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      3. Contact Details & Clinical Notes
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="req-contact-name" className="text-xs font-bold text-slate-700">
                          Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="req-contact-name"
                          placeholder="Full Name"
                          value={requesterName}
                          onChange={(e) => setRequesterName(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="req-contact-phone" className="text-xs font-bold text-slate-700">
                          Indian Mobile (+91) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="req-contact-phone"
                          placeholder="+91 98765 43210"
                          value={requesterPhone}
                          onChange={(e) => setRequesterPhone(e.target.value)}
                          className="mt-1.5 h-10 text-sm font-mono"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="req-contact-email" className="text-xs font-bold text-slate-700">
                          Email Address
                        </Label>
                        <Input
                          id="req-contact-email"
                          type="email"
                          placeholder="email@hospital.org"
                          value={requesterEmail}
                          onChange={(e) => setRequesterEmail(e.target.value)}
                          className="mt-1.5 h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="req-notes" className="text-xs font-bold text-slate-700">
                        Clinical Context & Urgency Notes (Optional)
                      </Label>
                      <textarea
                        id="req-notes"
                        rows={3}
                        placeholder="e.g. Emergency transfusion required for scheduled surgery. O+ or compatible PRBC units needed."
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        className="mt-1.5 w-full p-3 rounded-md border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      By submitting, you confirm that this request represents a legitimate clinical blood requirement.
                    </p>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="w-full sm:w-auto font-black shadow-lg shadow-red-900/10 px-8 gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting Requisition...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Blood Request</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
