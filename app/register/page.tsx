"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ALL_BLOOD_GROUPS, APP_CONFIG } from "@/lib/constants";
import { BloodGroup, UserRole } from "@/lib/types";
import {
  Heart,
  Activity,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<"donor" | "hospital" | "ngo">(
    initialRoleParam === "hospital" ? "hospital" : initialRoleParam === "ngo" ? "ngo" : "donor"
  );

  // Common Fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Donor Specific Fields
  const [donorFullName, setDonorFullName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorBloodGroup, setDonorBloodGroup] = useState<BloodGroup>("O+");
  const [donorCity, setDonorCity] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorIsAvailable, setDonorIsAvailable] = useState(true);

  // Hospital Specific Fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLicense, setHospitalLicense] = useState("");
  const [hospitalDept, setHospitalDept] = useState("");
  const [hospitalContact, setHospitalContact] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");

  // NGO Specific Fields
  const [ngoName, setNgoName] = useState("");
  const [ngoRegId, setNgoRegId] = useState("");
  const [ngoContact, setNgoContact] = useState("");
  const [ngoEmail, setNgoEmail] = useState("");
  const [ngoPhone, setNgoPhone] = useState("");
  const [ngoCity, setNgoCity] = useState("");
  const [ngoCoverage, setNgoCoverage] = useState("");
  const [ngoDescription, setNgoDescription] = useState("");

  const { registerDonor, registerHospital, registerNgo } = useAuth();

  const validate = () => {
    const errors: Record<string, string> = {};

    // Password validations
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errors.terms = "You must accept the privacy and coordination guidelines to register.";
    }

    // Role-specific validations
    if (selectedRole === "donor") {
      if (!donorFullName.trim()) errors.donorFullName = "Full name is required.";
      if (!donorEmail.trim()) errors.donorEmail = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) errors.donorEmail = "Invalid email address.";
      if (!donorCity.trim()) errors.donorCity = "City is required.";
    } else if (selectedRole === "hospital") {
      if (!hospitalName.trim()) errors.hospitalName = "Hospital name is required.";
      if (!hospitalLicense.trim()) errors.hospitalLicense = "Healthcare facility license is required.";
      if (!hospitalDept.trim()) errors.hospitalDept = "Hospital department is required.";
      if (!hospitalContact.trim()) errors.hospitalContact = "Contact person name is required.";
      if (!hospitalEmail.trim()) errors.hospitalEmail = "Official work email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hospitalEmail)) errors.hospitalEmail = "Invalid work email format.";
      if (!hospitalPhone.trim()) errors.hospitalPhone = "Emergency contact phone is required.";
      if (!hospitalCity.trim()) errors.hospitalCity = "City is required.";
      if (!hospitalAddress.trim()) errors.hospitalAddress = "Facility address is required.";
    } else if (selectedRole === "ngo") {
      if (!ngoName.trim()) errors.ngoName = "Organization name is required.";
      if (!ngoRegId.trim()) errors.ngoRegId = "NGO registration number is required.";
      if (!ngoContact.trim()) errors.ngoContact = "Authorized representative name is required.";
      if (!ngoEmail.trim()) errors.ngoEmail = "Organization email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ngoEmail)) errors.ngoEmail = "Invalid email format.";
      if (!ngoPhone.trim()) errors.ngoPhone = "Contact phone is required.";
      if (!ngoCity.trim()) errors.ngoCity = "City is required.";
      if (!ngoCoverage.trim()) errors.ngoCoverage = "Regional coverage area is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (selectedRole === "donor") {
        await registerDonor({
          fullName: donorFullName,
          email: donorEmail,
          password,
          bloodGroup: donorBloodGroup,
          city: donorCity,
          phone: donorPhone,
          isAvailable: donorIsAvailable,
        });
      } else if (selectedRole === "hospital") {
        await registerHospital({
          hospitalName,
          licenseNumber: hospitalLicense,
          department: hospitalDept,
          contactPerson: hospitalContact,
          workEmail: hospitalEmail,
          password,
          phone: hospitalPhone,
          city: hospitalCity,
          address: hospitalAddress,
        });
      } else if (selectedRole === "ngo") {
        await registerNgo({
          organizationName: ngoName,
          registrationId: ngoRegId,
          contactPerson: ngoContact,
          email: ngoEmail,
          password,
          phone: ngoPhone,
          city: ngoCity,
          coverageArea: ngoCoverage,
          description: ngoDescription,
        });
      }
    } catch (err: any) {
      setFormErrors({ submit: err.message || "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex justify-center mb-2">
          <BrandLogo size="lg" showTagline={false} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Your Drop4Life Account
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select your ecosystem role to get started with synchronized coordination.
        </p>
      </div>

      {/* STEP 1: ROLE SELECTION CARDS */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 text-center">
          Step 1: Choose Your Account Type
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Account Role Selection">
          {/* Donor Card */}
          <button
            type="button"
            onClick={() => setSelectedRole("donor")}
            role="radio"
            aria-checked={selectedRole === "donor"}
            className={cn(
              "flex flex-col text-left p-5 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
              selectedRole === "donor"
                ? "border-primary bg-red-50/60 shadow-md ring-1 ring-primary/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold mb-3">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-slate-900 text-base">Voluntary Donor</span>
              {selectedRole === "donor" && <Badge variant="blush">Selected</Badge>}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Respond to urgent nearby requests and log your donation milestones.
            </p>
          </button>

          {/* Hospital Card */}
          <button
            type="button"
            onClick={() => setSelectedRole("hospital")}
            role="radio"
            aria-checked={selectedRole === "hospital"}
            className={cn(
              "flex flex-col text-left p-5 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
              selectedRole === "hospital"
                ? "border-red-800 bg-red-50/60 shadow-md ring-1 ring-red-800/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-800 border border-red-100 flex items-center justify-center font-bold mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-slate-900 text-base">Hospital Facility</span>
              {selectedRole === "hospital" && <Badge variant="destructive">Selected</Badge>}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Issue emergency blood requisitions and manage 8-group stock reserves.
            </p>
          </button>

          {/* NGO Card */}
          <button
            type="button"
            onClick={() => setSelectedRole("ngo")}
            role="radio"
            aria-checked={selectedRole === "ngo"}
            className={cn(
              "flex flex-col text-left p-5 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
              selectedRole === "ngo"
                ? "border-amber-600 bg-amber-50/60 shadow-md ring-1 ring-amber-600/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center font-bold mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-slate-900 text-base">NGO Coordinator</span>
              {selectedRole === "ngo" && <Badge variant="warning">Selected</Badge>}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Host community blood donation drives and mobilize volunteers.
            </p>
          </button>
        </div>
      </div>

      {/* STEP 2: REGISTRATION FORM */}
      <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <Badge variant={selectedRole === "donor" ? "blush" : selectedRole === "hospital" ? "destructive" : "warning"}>
              {selectedRole === "donor" ? "Donor Registration" : selectedRole === "hospital" ? "Hospital Registration" : "NGO Registration"}
            </Badge>
            <span className="text-xs text-muted-foreground">Step 2 of 2</span>
          </div>
          <CardTitle className="text-lg mt-2">
            {selectedRole === "donor" && "Enter Your Donor Profile"}
            {selectedRole === "hospital" && "Healthcare Facility Verification Details"}
            {selectedRole === "ngo" && "NGO Organization Information"}
          </CardTitle>
          <CardDescription className="text-xs">
            {selectedRole === "donor" && "Your contact info and exact home address remain completely confidential."}
            {selectedRole === "hospital" && "Hospital accounts will enter pending verification status until license validation."}
            {selectedRole === "ngo" && "NGO accounts will coordinate blood drives and partner hospital connections."}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-6">
          {formErrors.submit && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertTitle className="text-xs font-bold">Submission Failed</AlertTitle>
                <AlertDescription className="text-xs">{formErrors.submit}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* 1. DONOR FORM FIELDS */}
            {selectedRole === "donor" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Legal Name"
                    placeholder="Sarah Connor"
                    value={donorFullName}
                    onChange={(e) => setDonorFullName(e.target.value)}
                    error={formErrors.donorFullName}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="sarah@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    error={formErrors.donorEmail}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="ABO/Rh Blood Group"
                    value={donorBloodGroup}
                    onChange={(e) => setDonorBloodGroup(e.target.value as BloodGroup)}
                    options={ALL_BLOOD_GROUPS.map((g) => ({
                      value: g,
                      label: `Type ${g} (${g === "O-" ? "Universal Donor" : g === "AB+" ? "Universal Recipient" : "Red Blood Cells"})`,
                    }))}
                    helperText="Used strictly to match with compatible patient requisitions."
                    required
                  />

                  <Input
                    label="City / General Region"
                    placeholder="Hyderabad, Telangana"
                    value={donorCity}
                    onChange={(e) => setDonorCity(e.target.value)}
                    error={formErrors.donorCity}
                    helperText="Only approximate region is used for distance calculations."
                    required
                  />
                </div>

                <Input
                  label="Contact Phone (Optional)"
                  placeholder="+91 98765 00001"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  helperText="Never made public; only shared with hospital staff upon accepting a request."
                />

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <Checkbox
                    label="Active for Emergency Shortage Matching"
                    description="Receive notifications when a verified hospital in your area critically needs your blood group."
                    checked={donorIsAvailable}
                    onChange={(e) => setDonorIsAvailable(e.target.checked)}
                  />
                </div>
              </>
            )}

            {/* 2. HOSPITAL FORM FIELDS */}
            {selectedRole === "hospital" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hospital / Medical Center Name"
                    placeholder="Apollo Hospital Jubilee Hills"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    error={formErrors.hospitalName}
                    required
                  />

                  <Input
                    label="Medical Facility License ID"
                    placeholder="TS-MED-849201"
                    value={hospitalLicense}
                    onChange={(e) => setHospitalLicense(e.target.value)}
                    error={formErrors.hospitalLicense}
                    helperText="Required for healthcare authority accreditation."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Department / Blood Bank Division"
                    placeholder="Emergency Trauma & Blood Bank"
                    value={hospitalDept}
                    onChange={(e) => setHospitalDept(e.target.value)}
                    error={formErrors.hospitalDept}
                    required
                  />

                  <Input
                    label="Authorized Contact Person"
                    placeholder="Dr. Rajesh Verma"
                    value={hospitalContact}
                    onChange={(e) => setHospitalContact(e.target.value)}
                    error={formErrors.hospitalContact}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Work Email"
                    type="email"
                    placeholder="bloodbank@apollo-hyd.org"
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    error={formErrors.hospitalEmail}
                    required
                  />

                  <Input
                    label="Emergency Line Phone"
                    placeholder="+91 98765 00002"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    error={formErrors.hospitalPhone}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Hyderabad"
                    value={hospitalCity}
                    onChange={(e) => setHospitalCity(e.target.value)}
                    error={formErrors.hospitalCity}
                    required
                  />

                  <Input
                    label="Full Facility Address"
                    placeholder="Road No. 72, Jubilee Hills"
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    error={formErrors.hospitalAddress}
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-900 block font-semibold mb-0.5">
                    Healthcare Verification Notice:
                  </strong>
                  Hospital accounts will enter a <code>pending_verification</code> state to ensure patient safety and authorized clinical requisition rights.
                </div>
              </>
            )}

            {/* 3. NGO FORM FIELDS */}
            {selectedRole === "ngo" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="NGO / Organization Name"
                    placeholder="Youth Red Cross Society & Lifeline"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    error={formErrors.ngoName}
                    required
                  />

                  <Input
                    label="NGO Registration / Tax ID"
                    placeholder="KA-NGO-994821"
                    value={ngoRegId}
                    onChange={(e) => setNgoRegId(e.target.value)}
                    error={formErrors.ngoRegId}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Authorized Coordinator Name"
                    placeholder="Priya Reddy"
                    value={ngoContact}
                    onChange={(e) => setNgoContact(e.target.value)}
                    error={formErrors.ngoContact}
                    required
                  />

                  <Input
                    label="Official NGO Email"
                    type="email"
                    placeholder="coordinator@redcross-lifeline.org"
                    value={ngoEmail}
                    onChange={(e) => setNgoEmail(e.target.value)}
                    error={formErrors.ngoEmail}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    placeholder="+91 98765 00003"
                    value={ngoPhone}
                    onChange={(e) => setNgoPhone(e.target.value)}
                    error={formErrors.ngoPhone}
                    required
                  />

                  <Input
                    label="City / Headquarters"
                    placeholder="Bengaluru, KA"
                    value={ngoCity}
                    onChange={(e) => setNgoCity(e.target.value)}
                    error={formErrors.ngoCity}
                    required
                  />
                </div>

                <Input
                  label="Regional Coverage Area"
                  placeholder="Bengaluru Urban & Rural"
                  value={ngoCoverage}
                  onChange={(e) => setNgoCoverage(e.target.value)}
                  error={formErrors.ngoCoverage}
                  required
                />

                <Textarea
                  label="Organization Mission / Description (Optional)"
                  placeholder="Describe your community health outreach initiatives..."
                  value={ngoDescription}
                  onChange={(e) => setNgoDescription(e.target.value)}
                />
              </>
            )}

            {/* COMMON SECURITY & PASSWORD FIELDS */}
            <div className="pt-2 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full space-y-1.5">
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Create Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 pr-10 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        formErrors.password && "border-destructive"
                      )}
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
                  {formErrors.password && (
                    <p className="text-xs text-destructive font-medium">{formErrors.password}</p>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={formErrors.confirmPassword}
                  required
                />
              </div>

              <div className="pt-1">
                <Checkbox
                  label="I agree to the Drop4Life Platform Terms and Clinical Privacy Policy."
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (formErrors.terms) setFormErrors({ ...formErrors, terms: "" });
                  }}
                />
                {formErrors.terms && (
                  <p className="text-xs text-destructive font-medium mt-1 pl-6">
                    {formErrors.terms}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold shadow-md gap-2"
                isLoading={isSubmitting}
              >
                <UserPlus className="w-4 h-4" />
                <span>Complete Registration</span>
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-3 border-t bg-slate-50/50 flex flex-col gap-2 rounded-b-xl text-center text-xs">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center text-xs text-muted-foreground">Loading registration hub...</div>}>
          <RegisterContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
