"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FacilityLocation, FacilityType, BloodGroup } from "@/lib/types";
import {
  locationService,
  LocationCoordinate,
  CITY_COORDINATES,
} from "@/lib/location/location-service";
import { InteractiveMapView } from "./interactive-map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Building2,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Search,
  Compass,
  Map,
  List,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Droplet,
} from "lucide-react";

interface FacilityFinderProps {
  initialCity?: string;
  defaultView?: "map" | "list";
}

export function FacilityFinder({
  initialCity = "",
  defaultView = "list",
}: FacilityFinderProps) {
  const [facilities, setFacilities] = useState<FacilityLocation[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">(defaultView);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedType, setSelectedType] = useState<FacilityType | "ALL">("ALL");

  const [userCoord, setUserCoord] = useState<LocationCoordinate | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const loadData = React.useCallback(async (coord?: LocationCoordinate | null) => {
    try {
      const data = await locationService.getFacilities({
        userCoord: coord !== undefined ? coord : userCoord,
        city: selectedCity,
        facilityType: selectedType,
        search: searchQuery,
      });
      setFacilities(data);
    } catch (err) {
      console.error("Failed to load facilities", err);
    }
  }, [userCoord, selectedCity, selectedType, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestGeolocation = async () => {
    setGeoLoading(true);
    setGeoError(null);
    setGeoMessage(null);

    const result = await locationService.requestBrowserGeolocation();
    setGeoLoading(false);

    if (result.status === "SUCCESS" && result.coordinate) {
      setUserCoord(result.coordinate);
      setGeoMessage("Location acquired! Showing closest facilities.");
      loadData(result.coordinate);
    } else {
      setGeoError(
        result.errorMessage ||
          "Location permission was denied. You can manually enter your city or neighborhood below."
      );
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    const coords = CITY_COORDINATES[city.toLowerCase()];
    if (coords) {
      setUserCoord(coords);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Location Controls Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  placeholder="Search hospital or center..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              {/* City Filter */}
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:border-red-500 focus:outline-none"
                  aria-label="Filter by City"
                >
                  <option value="">All Regions</option>
                  <option value="New York">New York / Manhattan</option>
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Queens">Queens</option>
                  <option value="Boston">Boston</option>
                  <option value="Chicago">Chicago</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:border-red-500 focus:outline-none"
                  aria-label="Filter by Facility Type"
                >
                  <option value="ALL">All Facility Types</option>
                  <option value="HOSPITAL">Hospitals & Trauma Wings</option>
                  <option value="BLOOD_BANK">Regional Blood Banks</option>
                  <option value="CAMPAIGN_VENUE">Public Donation Venues</option>
                </select>
              </div>
            </div>

            {/* Geolocation Button & View Switcher */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRequestGeolocation}
                disabled={geoLoading}
                className="text-xs h-9 gap-1.5 font-semibold text-slate-700 hover:text-red-700 hover:border-red-200"
              >
                {geoLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Compass className="w-3.5 h-3.5 text-red-600" />
                )}
                <span>Use My Location</span>
              </Button>

              <div className="border border-slate-200 rounded-lg p-0.5 flex items-center bg-slate-50">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  aria-label="Switch to List View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                    viewMode === "map"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  aria-label="Switch to Map View"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location Alerts */}
          {geoMessage && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-xs font-medium">{geoMessage}</AlertDescription>
            </Alert>
          )}

          {geoError && (
            <Alert className="bg-amber-50 text-amber-900 border-amber-200 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <AlertDescription className="text-xs font-medium">{geoError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content: Map or List */}
      {viewMode === "map" ? (
        <div className="space-y-4">
          <InteractiveMapView facilities={facilities} userCoord={userCoord} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white border border-slate-200 rounded-2xl p-6">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">No Facilities Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No healthcare centers match your search parameters. Try changing the city or search term.
              </p>
            </div>
          ) : (
            facilities.map((fac) => (
              <Card
                key={fac.id}
                className="border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge
                        variant={
                          fac.facilityType === "HOSPITAL"
                            ? "destructive"
                            : fac.facilityType === "BLOOD_BANK"
                            ? "default"
                            : "success"
                        }
                        className="text-[10px] uppercase font-bold px-2 py-0.5"
                      >
                        {fac.facilityType.replace("_", " ")}
                      </Badge>
                      <CardTitle className="text-sm font-bold text-slate-900 mt-1.5">
                        {fac.name}
                      </CardTitle>
                    </div>
                    {fac.isOpen24x7 && (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                        24/7 Open
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2 text-xs text-slate-600 flex-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {fac.address}, {fac.city} {fac.area ? `(${fac.area})` : ""}
                    </span>
                  </div>

                  {fac.operatingHours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{fac.operatingHours}</span>
                    </div>
                  )}

                  {fac.distanceKm !== undefined && (
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold font-mono">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{fac.distanceKm} km away from your location</span>
                    </div>
                  )}

                  {fac.availableBloodGroups && fac.availableBloodGroups.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-slate-500 mr-1">Available Groups:</span>
                      {fac.availableBloodGroups.map((bg) => (
                        <span
                          key={bg}
                          className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold font-mono text-[10px]"
                        >
                          {bg}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${fac.phone}`}
                    className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fac.phone}</span>
                  </a>

                  <a
                    href={locationService.getDirectionsUrl(
                      `${fac.name}, ${fac.address}, ${fac.city}`,
                      { latitude: fac.latitude, longitude: fac.longitude }
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
