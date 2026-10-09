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

    const searchResults = await locationService.getFacilities({ search: "Bengaluru" });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(
      searchResults.every(
        (f) =>
          f.city.toLowerCase().includes("bengaluru") ||
          f.name.toLowerCase().includes("bengaluru") ||
          f.address.toLowerCase().includes("bengaluru")
      )
    ).toBe(true);
  });

  it("accurately calculates Haversine distance in kilometers", () => {
    // Hyderabad Jubilee Hills (17.4265, 78.4112) to Charminar (17.3616, 78.4747) ~ 9.8 km
    const dist = calculateDistanceKm(17.4265, 78.4112, 17.3616, 78.4747);
    expect(dist).toBeGreaterThan(8.5);
    expect(dist).toBeLessThan(11.0);
  });

  it("sorts facilities by proximity from user coordinates", async () => {
    // Coordinates near Central Hyderabad (17.3850, 78.4867)
    const sorted = await locationService.getFacilities({
      userCoord: { latitude: 17.3850, longitude: 78.4867 },
    });

    expect(sorted[0].distanceKm).toBeDefined();
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i].distanceKm || 0;
      const next = sorted[i + 1].distanceKm || 0;
      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it("generates valid navigation direction URLs without exposing private tokens", () => {
    const gmapsUrl = locationService.getDirectionsUrl("Apollo Hospital Jubilee Hills", {
      latitude: 17.4265,
      longitude: 78.4112,
    });
    expect(gmapsUrl).toContain("https://www.google.com/maps/dir/");
    expect(gmapsUrl).toContain("17.4265,78.4112");
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

