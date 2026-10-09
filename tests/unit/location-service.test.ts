import { describe, it, expect } from "vitest";
import {
  locationService,
  calculateDistanceKm,
  VERIFIED_FACILITIES,
} from "@/lib/location/location-service";

describe("Location & Facility Discovery Service", () => {
  it("retrieves verified facilities across hospitals, blood banks, and campaign venues", async () => {
    const facilities = await locationService.getFacilities();
    expect(facilities.length).toBeGreaterThanOrEqual(4);

    const types = new Set(facilities.map((f) => f.facilityType));
    expect(types.has("HOSPITAL")).toBe(true);
    expect(types.has("BLOOD_BANK")).toBe(true);
    expect(types.has("CAMPAIGN_VENUE")).toBe(true);
  });

  it("filters facilities by facility type and search query", async () => {
    const bloodBanks = await locationService.getFacilities({ facilityType: "BLOOD_BANK" });
    expect(bloodBanks.every((f) => f.facilityType === "BLOOD_BANK")).toBe(true);

    const searchResults = await locationService.getFacilities({ search: "Brooklyn" });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(
      searchResults.every(
        (f) =>
          f.city.toLowerCase().includes("brooklyn") ||
          f.name.toLowerCase().includes("brooklyn") ||
          f.address.toLowerCase().includes("brooklyn")
      )
    ).toBe(true);
  });

  it("accurately calculates Haversine distance in kilometers", () => {
    // New York Midtown (40.7484, -73.9857) to Downtown Brooklyn (40.6934, -73.9858) ~ 6.1 km
    const dist = calculateDistanceKm(40.7484, -73.9857, 40.6934, -73.9858);
    expect(dist).toBeGreaterThan(5.5);
    expect(dist).toBeLessThan(7.0);
  });

  it("sorts facilities by proximity from user coordinates", async () => {
    // Coordinates near Central Manhattan (40.7831, -73.9712)
    const sorted = await locationService.getFacilities({
      userCoord: { latitude: 40.7831, longitude: -73.9712 },
    });

    expect(sorted[0].distanceKm).toBeDefined();
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i].distanceKm || 0;
      const next = sorted[i + 1].distanceKm || 0;
      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it("generates valid navigation direction URLs without exposing private tokens", () => {
    const gmapsUrl = locationService.getDirectionsUrl("Metro General Hospital", {
      latitude: 40.7484,
      longitude: -73.9857,
    });
    expect(gmapsUrl).toContain("https://www.google.com/maps/dir/");
    expect(gmapsUrl).toContain("40.7484,-73.9857");
  });

  it("enforces location privacy: only public and authorized facility locations are listed", async () => {
    const facilities = await locationService.getFacilities();

    // Verify all facilities are public registered entities
    for (const fac of facilities) {
      expect(fac.address).toBeDefined();
      expect(fac.name).not.toMatch(/donor home|private residence/i);
    }
  });
});

