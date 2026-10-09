"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { donorService } from "@/lib/donor/donor-service";
import { AppointmentRecord } from "@/lib/types";
import { INDIAN_CITIES } from "@/lib/constants";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Loader2,
  CalendarDays,
} from "lucide-react";

interface DonorAppointmentsCardProps {
  userId: string;
}

export function DonorAppointmentsCard({ userId }: DonorAppointmentsCardProps) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);

  // Booking Form State
  const [facilityName, setFacilityName] = useState<string>("Apollo Hospital Jubilee Hills");
  const [facilityType, setFacilityType] = useState<"HOSPITAL" | "BLOOD_BANK" | "CAMPAIGN">("HOSPITAL");
  const [city, setCity] = useState<string>("Hyderabad");
  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [timeSlot, setTimeSlot] = useState<string>("10:00 AM - 11:30 AM");
  const [notes, setNotes] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  const loadAppointments = async () => {
    try {
      const res = await donorService.getAppointments(userId);
      setAppointments(res);
    } catch (e) {
      console.error("Failed to load appointments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await donorService.bookAppointment(userId, {
        facilityId: `fac-${Date.now()}`,
        facilityName: facilityName.trim(),
        facilityType,
        city: city.trim(),
        date,
        timeSlot,
        notes: notes.trim(),
      });
      setIsBookModalOpen(false);
      await loadAppointments();
    } catch (err) {
      console.error("Failed to book appointment", err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (aptId: string) => {
    try {
      await donorService.cancelAppointment(userId, aptId);
      await loadAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment", err);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Donation Appointments & Schedules
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Manage your scheduled blood donation appointments with local hospitals and blood banks.
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsBookModalOpen(true)}
            className="font-bold text-xs gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="text-center text-xs text-slate-500 py-4">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl bg-slate-50/50 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No scheduled appointments</p>
            <p className="text-[11px] text-slate-400">
              Book a comfortable donation time slot at a verified blood bank or nearby hospital.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBookModalOpen(true)}
              className="text-xs font-bold mt-2"
            >
              Schedule Donation Slot
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {apt.facilityName}
                    </span>
                    <Badge
                      variant={
                        apt.status === "SCHEDULED"
                          ? "default"
                          : apt.status === "COMPLETED"
                          ? "success"
                          : "secondary"
                      }
                      className="text-[10px] py-0 px-1.5"
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {apt.city}
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Note: {apt.notes}
                    </p>
                  )}
                </div>

                {apt.status === "SCHEDULED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelAppointment(apt.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs self-start sm:self-auto"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Book Appointment */}
        {isBookModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Book Donation Appointment
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="facility-name" className="text-xs font-semibold">
                    Hospital / Blood Center Name
                  </Label>
                  <Input
                    id="facility-name"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">City</Label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white"
                    >
                      {INDIAN_CITIES.slice(0, 10).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Facility Type</Label>
                    <select
                      value={facilityType}
                      onChange={(e: any) => setFacilityType(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white"
                    >
                      <option value="HOSPITAL">Hospital</option>
                      <option value="BLOOD_BANK">Blood Bank</option>
                      <option value="CAMPAIGN">Camp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="apt-date" className="text-xs font-semibold">
                      Preferred Date
                    </Label>
                    <Input
                      id="apt-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Time Slot</Label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white"
                    >
                      <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                      <option value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</option>
                      <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                      <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="apt-notes" className="text-xs font-semibold">
                    Special Notes (Optional)
                  </Label>
                  <Input
                    id="apt-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. First-time donor or whole blood slot"
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBookModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={bookingLoading} className="font-bold">
                    {bookingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Slot"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
