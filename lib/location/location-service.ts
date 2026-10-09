/**
 * Drop4Life — Location Services & Facility Discovery Layer
 * 
 * Provides verified geographic location data, proximity calculations using the Haversine formula,
 * accessible list/map representations, and geolocation permission handling.
 * 
 * PRIVACY & ACCURACY RULES:
 * - Strictly prohibits exposing donor home addresses or private patient coordinates.
 * - Only verified public healthcare facilities, registered blood banks, and official campaign venues are exposed.
 * - Handles browser geolocation denials gracefully with manual city/area entry fallbacks.
 */

import { FacilityLocation, FacilityType, BloodGroup } from "@/lib/types";

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Verified Directory of Participating Hospitals, Blood Banks, and Official Venues
 */
export const VERIFIED_FACILITIES: FacilityLocation[] = [
  {
    id: "fac-001",
    name: "St. Jude Medical Center — Blood Bank Pavilion",
    facilityType: "HOSPITAL",
    address: "420 East 70th Street, Transfusion Center Wing B",
    city: "New York",
    area: "Upper East Side, Manhattan",
    latitude: 40.7675,
    longitude: -73.9535,
    phone: "+1 (555) 345-6789",
    emergencyPhone: "+1 (555) 911-7890",
    email: "bloodbank@stjude-med.org",
    operatingHours: "24/7 Emergency Transfusion Services",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-002",
    name: "Metro General Hospital — Trauma Care Center",
    facilityType: "HOSPITAL",
    address: "1000 5th Avenue, Emergency Trauma Unit",
    city: "New York",
    area: "Manhattan",
    latitude: 40.7891,
    longitude: -73.9531,
    phone: "+1 (555) 887-1234",
    emergencyPhone: "+1 (555) 911-1234",
    email: "intake@metrogeneral.org",
    operatingHours: "24/7 Emergency & ICU",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A+", "B+"],
  },
  {
    id: "fac-003",
    name: "Brooklyn Regional LifeCare Blood Bank",
    facilityType: "BLOOD_BANK",
    address: "128 Pierrepont Street",
    city: "Brooklyn",
    area: "Brooklyn Heights",
    latitude: 40.6946,
    longitude: -73.9934,
    phone: "+1 (555) 654-3210",
    email: "donations@brooklynbloodbank.org",
    operatingHours: "Mon-Sat: 07:30 AM – 08:00 PM, Sun: 09:00 AM – 05:00 PM",
    isOpen24x7: false,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB+"],
  },
  {
    id: "fac-004",
    name: "Civic Plaza Public Donation Pavilion",
    facilityType: "CAMPAIGN_VENUE",
    address: "350 5th Avenue, Ground Level Hall",
    city: "New York",
    area: "Midtown Manhattan",
    latitude: 40.7484,
    longitude: -73.9857,
    phone: "+1 (555) 456-7890",
    email: "events@drop4life.org",
    operatingHours: "Oct 12–14: 09:00 AM – 05:00 PM",
    isOpen24x7: false,
    activeCampaignId: "camp-101",
  },
  {
    id: "fac-005",
    name: "Queens County Transfusion & Hematology Institute",
    facilityType: "BLOOD_BANK",
    address: "136-20 38th Avenue",
    city: "Queens",
    area: "Flushing",
    latitude: 40.7598,
    longitude: -73.8312,
    phone: "+1 (555) 789-0123",
    email: "contact@queensbloodcenter.org",
    operatingHours: "Daily: 08:00 AM – 07:00 PM",
    isOpen24x7: false,
    availableBloodGroups: ["O-", "O+", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-006",
    name: "Northwestern Memorial Transfusion Center",
    facilityType: "HOSPITAL",
    address: "251 E Huron St",
    city: "Chicago",
    area: "Streeterville",
    latitude: 41.8954,
    longitude: -87.6217,
    phone: "+1 (312) 555-0199",
    emergencyPhone: "+1 (312) 555-9111",
    operatingHours: "24/7 Emergency Blood Bank",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-007",
    name: "Boston Medical Transfusion & Donor Center",
    facilityType: "HOSPITAL",
    address: "850 Harrison Ave",
    city: "Boston",
    area: "South End",
    latitude: 42.3359,
    longitude: -71.0718,
    phone: "+1 (617) 555-0144",
    emergencyPhone: "+1 (617) 555-9111",
    operatingHours: "24/7 Hospital Blood Bank",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B+", "AB+"],
  },
];

/**
 * Approximate City Center Reference Coordinates for Manual Location Fallback
 */
export const CITY_COORDINATES: Record<string, LocationCoordinate> = {
  "new york": { latitude: 40.7128, longitude: -74.006 },
  "brooklyn": { latitude: 40.6782, longitude: -73.9442 },
  "queens": { latitude: 40.7282, longitude: -73.7949 },
  "manhattan": { latitude: 40.7831, longitude: -73.9712 },
  "boston": { latitude: 42.3601, longitude: -71.0589 },
  "chicago": { latitude: 41.8781, longitude: -87.6298 },
};

/**
 * Calculates straight-line distance in kilometers between two latitude/longitude points (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

class LocationService {
  /**
   * Prompts user for browser geolocation with error handling and fallback
   */
  public async requestBrowserGeolocation(): Promise<{
    coordinate: LocationCoordinate | null;
    status: "SUCCESS" | "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "NOT_SUPPORTED";
    errorMessage?: string;
  }> {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      return {
        coordinate: null,
        status: "NOT_SUPPORTED",
        errorMessage: "Browser geolocation is not supported on this device.",
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinate: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            status: "SUCCESS",
          });
        },
        (error) => {
          let status: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" = "POSITION_UNAVAILABLE";
          let errorMessage = "Unable to retrieve location.";

          if (error.code === error.PERMISSION_DENIED) {
            status = "PERMISSION_DENIED";
            errorMessage = "Location permission denied. Please enter your city or area manually.";
          } else if (error.code === error.TIMEOUT) {
            status = "TIMEOUT";
            errorMessage = "Location request timed out.";
          }

          resolve({
            coordinate: null,
            status,
            errorMessage,
          });
        },
        { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    });
  }

  /**
   * Retrieves facilities with optional proximity sorting and search filters
   */
  public async getFacilities(options?: {
    userCoord?: LocationCoordinate | null;
    city?: string;
    facilityType?: FacilityType | "ALL";
    search?: string;
    bloodGroup?: BloodGroup | "ALL";
  }): Promise<FacilityLocation[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));

    let results = VERIFIED_FACILITIES.map((fac) => {
      let distanceKm: number | undefined;
      if (options?.userCoord) {
        distanceKm = calculateDistanceKm(
          options.userCoord.latitude,
          options.userCoord.longitude,
          fac.latitude,
          fac.longitude
        );
      }
      return {
        ...fac,
        distanceKm,
      };
    });

    if (options?.facilityType && options.facilityType !== "ALL") {
      results = results.filter((f) => f.facilityType === options.facilityType);
    }

    if (options?.city && options.city.trim().length > 0) {
      const q = options.city.toLowerCase().trim();
      results = results.filter((f) => f.city.toLowerCase().includes(q));
    }

    if (options?.bloodGroup && options.bloodGroup !== "ALL") {
      results = results.filter(
        (f) => !f.availableBloodGroups || f.availableBloodGroups.includes(options.bloodGroup as BloodGroup)
      );
    }

    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          (f.area && f.area.toLowerCase().includes(q))
      );
    }

    // Sort: If distances available, sort closest first; else alphabetically by name
    return results.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Generates safe external maps directions URL
   */
  public getDirectionsUrl(address: string, coordinate?: LocationCoordinate): string {
    const encodedAddress = encodeURIComponent(address);
    if (coordinate) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }
}

export const locationService = new LocationService();
