"use client";

import React, { useState } from "react";
import { FacilityLocation, FacilityType } from "@/lib/types";
import { locationService, LocationCoordinate } from "@/lib/location/location-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Droplet,
  Layers,
  X,
  Sparkles,
} from "lucide-react";

interface InteractiveMapViewProps {
  facilities: FacilityLocation[];
  userCoord?: LocationCoordinate | null;
  selectedFacilityId?: string | null;
  onSelectFacility?: (facility: FacilityLocation | null) => void;
}

export function InteractiveMapView({
  facilities,
  userCoord,
  selectedFacilityId,
  onSelectFacility,
}: InteractiveMapViewProps) {
  const [activeFacility, setActiveFacility] = useState<FacilityLocation | null>(
    facilities.find((f) => f.id === selectedFacilityId) || null
  );

  const handleMarkerClick = (facility: FacilityLocation) => {
    setActiveFacility(facility);
    if (onSelectFacility) onSelectFacility(facility);
  };

  const getPinColor = (type: FacilityType) => {
    switch (type) {
      case "HOSPITAL":
        return "bg-red-600 text-white border-red-700 shadow-red-500/30";
      case "BLOOD_BANK":
        return "bg-blue-600 text-white border-blue-700 shadow-blue-500/30";
      case "CAMPAIGN_VENUE":
        return "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/30";
      default:
        return "bg-slate-700 text-white border-slate-800";
    }
  };

  // Convert real lat/long of NYC area (~40.68 - 40.82 lat, -74.02 - -73.80 lon) to relative percentage for SVG overlay
  const getMapPosition = (lat: number, lon: number) => {
    const minLat = 40.67;
    const maxLat = 40.82;
    const minLon = -74.02;
    const maxLon = -73.80;

    // Constrain within bounds or fallback to normalized center
    const clampedLat = Math.min(maxLat, Math.max(minLat, lat));
    const clampedLon = Math.min(maxLon, Math.max(minLon, lon));

    const y = 100 - ((clampedLat - minLat) / (maxLat - minLat)) * 100;
    const x = ((clampedLon - minLon) / (maxLon - minLon)) * 100;

    return {
      top: `${Math.max(8, Math.min(90, y))}%`,
      left: `${Math.max(8, Math.min(90, x))}%`,
    };
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner select-none">
      {/* Background Stylized Map Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

      {/* Stylized River & Landmass Vectors */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 200 0 Q 240 200 320 300 T 450 600"
          stroke="#0284c7"
          strokeWidth="38"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 0 350 Q 200 340 320 300 T 600 450"
          stroke="#0284c7"
          strokeWidth="24"
          fill="none"
        />
        {/* Grid Lines */}
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#334155" strokeDasharray="4 4" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeDasharray="4 4" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#334155" strokeDasharray="4 4" />
        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#334155" strokeDasharray="4 4" />
        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#334155" strokeDasharray="4 4" />
      </svg>

      {/* Map Legend Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60 text-white text-[11px] shadow-lg flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block ring-2 ring-red-400/40" />
          <span>Hospitals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block ring-2 ring-blue-400/40" />
          <span>Blood Banks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block ring-2 ring-emerald-400/40" />
          <span>Donation Venues</span>
        </div>
      </div>

      {/* User Geolocation Marker if available */}
      {userCoord && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={getMapPosition(userCoord.latitude, userCoord.longitude)}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white shadow-md shadow-red-500/50" />
          </div>
          <span className="absolute top-5 -left-6 bg-slate-950/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
            You Are Here
          </span>
        </div>
      )}

      {/* Facility Pin Markers */}
      {facilities.map((fac) => {
        const pos = getMapPosition(fac.latitude, fac.longitude);
        const isSelected = activeFacility?.id === fac.id;

        return (
          <button
            key={fac.id}
            onClick={() => handleMarkerClick(fac)}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all transform hover:scale-125 focus:outline-none ${
              isSelected ? "scale-125 z-30 ring-4 ring-white/50 rounded-full" : ""
            }`}
            style={pos}
            aria-label={`View details for ${fac.name}`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform ${getPinColor(
                fac.facilityType
              )}`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
        );
      })}

      {/* Active Facility Card Popup Overlay */}
      {activeFacility && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl animate-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge
                variant={
                  activeFacility.facilityType === "HOSPITAL"
                    ? "destructive"
                    : activeFacility.facilityType === "BLOOD_BANK"
                    ? "default"
                    : "success"
                }
                className="text-[10px] uppercase font-bold px-2 py-0.5"
              >
                {activeFacility.facilityType.replace("_", " ")}
              </Badge>
              <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                {activeFacility.name}
              </h4>
            </div>
            <button
              onClick={() => setActiveFacility(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close location card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                {activeFacility.address}, {activeFacility.city}
              </span>
            </div>

            {activeFacility.operatingHours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-700">
                  {activeFacility.operatingHours}
                </span>
              </div>
            )}

            {activeFacility.distanceKm !== undefined && (
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold font-mono pt-0.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>{activeFacility.distanceKm} km away from your location</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <a
              href={`tel:${activeFacility.phone}`}
              className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeFacility.phone}</span>
            </a>

            <a
              href={locationService.getDirectionsUrl(
                `${activeFacility.name}, ${activeFacility.address}, ${activeFacility.city}`,
                { latitude: activeFacility.latitude, longitude: activeFacility.longitude }
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span>Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
