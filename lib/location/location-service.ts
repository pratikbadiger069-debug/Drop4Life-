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
    name: "Apollo Hospital Jubilee Hills — Blood Bank Pavilion",
    facilityType: "HOSPITAL",
    address: "Road No. 72, Jubilee Hills, Transfusion Center Wing B",
    city: "Hyderabad",
    area: "Jubilee Hills",
    latitude: 17.4265,
    longitude: 78.4112,
    phone: "+91 98765 00002",
    emergencyPhone: "+91 40 2360 7777",
    email: "bloodbank@apollo-hyd.org",
    operatingHours: "24/7 Emergency Transfusion Services",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-002",
    name: "AIIMS New Delhi — Main Blood Bank & Trauma Center",
    facilityType: "HOSPITAL",
    address: "Sri Aurobindo Marg, Ansari Nagar, Emergency Trauma Unit",
    city: "New Delhi",
    area: "Ansari Nagar",
    latitude: 28.5672,
    longitude: 77.2100,
    phone: "+91 98765 00010",
    emergencyPhone: "+91 11 2658 8500",
    email: "intake@aiims-delhi.org",
    operatingHours: "24/7 Emergency & ICU",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A+", "B+"],
  },
  {
    id: "fac-003",
    name: "Manipal Hospital — Regional LifeCare Blood Bank",
    facilityType: "BLOOD_BANK",
    address: "98 HAL Old Airport Road, Kodihalli",
    city: "Bengaluru",
    area: "HAL Old Airport Road",
    latitude: 12.9582,
    longitude: 77.6495,
    phone: "+91 98765 00011",
    email: "donations@manipalbloodbank.org",
    operatingHours: "Mon-Sat: 07:30 AM – 08:00 PM, Sun: 09:00 AM – 05:00 PM",
    isOpen24x7: false,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB+"],
  },
  {
    id: "fac-004",
    name: "Indian Red Cross Society Blood Bank & Donor Pavilion",
    facilityType: "CAMPAIGN_VENUE",
    address: "Red Cross Bhawan, 1 Red Cross Road",
    city: "New Delhi",
    area: "Central Delhi",
    latitude: 28.6190,
    longitude: 77.2104,
    phone: "+91 98765 00003",
    email: "events@drop4life.org",
    operatingHours: "Oct 12–14: 09:00 AM – 05:00 PM",
    isOpen24x7: false,
    activeCampaignId: "camp-101",
  },
  {
    id: "fac-005",
    name: "KEM Hospital Regional Transfusion & Hematology Institute",
    facilityType: "BLOOD_BANK",
    address: "Acharya Donde Marg, Parel",
    city: "Mumbai",
    area: "Parel",
    latitude: 19.0028,
    longitude: 72.8427,
    phone: "+91 98765 00012",
    email: "contact@kembloodcenter.org",
    operatingHours: "Daily: 08:00 AM – 07:00 PM",
    isOpen24x7: false,
    availableBloodGroups: ["O-", "O+", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-006",
    name: "Rajiv Gandhi Government General Hospital Blood Bank",
    facilityType: "HOSPITAL",
    address: "EVR Periyar Salai, Park Town",
    city: "Chennai",
    area: "Park Town",
    latitude: 13.0818,
    longitude: 80.2785,
    phone: "+91 98765 00013",
    emergencyPhone: "+91 44 2530 5000",
    operatingHours: "24/7 Emergency Blood Bank",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  },
  {
    id: "fac-007",
    name: "King George Hospital (KGH) Regional Blood Center",
    facilityType: "HOSPITAL",
    address: "Maharanipeta, Collector Office Road",
    city: "Visakhapatnam",
    area: "Maharanipeta",
    latitude: 17.7088,
    longitude: 83.3056,
    phone: "+91 98765 00014",
    emergencyPhone: "+91 891 256 4891",
    operatingHours: "24/7 Hospital Blood Bank",
    isOpen24x7: true,
    availableBloodGroups: ["O-", "O+", "A-", "A+", "B+", "AB+"],
  },
];

/**
 * Approximate City Center Reference Coordinates for Manual Location Fallback
 */
export const CITY_COORDINATES: Record<string, LocationCoordinate> = {
  "hyderabad": { latitude: 17.3850, longitude: 78.4867 },
  "bengaluru": { latitude: 12.9716, longitude: 77.5946 },
  "bangalore": { latitude: 12.9716, longitude: 77.5946 },
  "new delhi": { latitude: 28.6139, longitude: 77.2090 },
  "delhi": { latitude: 28.6139, longitude: 77.2090 },
  "mumbai": { latitude: 19.0760, longitude: 72.8777 },
  "chennai": { latitude: 13.0827, longitude: 80.2707 },
  "visakhapatnam": { latitude: 17.6868, longitude: 83.2185 },
  "vijayawada": { latitude: 16.5062, longitude: 80.6480 },
  "kochi": { latitude: 9.9312, longitude: 76.2673 },
  "kolkata": { latitude: 22.5726, longitude: 88.3639 },
  "pune": { latitude: 18.5204, longitude: 73.8567 },
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
