/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Location {
  latitude: number;
  longitude: number;
}

export interface VendorLocationData {
  vendorResponseId: string;
  name: string;
  revisions?: Array<{
    generalTerms?: {
      dispatchLocation?: {
        latitude: string | number;
        longitude: string | number;
        name: string;
        state: string;
      };
    };
  }>;
  dispatchLocation?: {
    latitude: string | number;
    longitude: string | number;
    name: string;
    state: string;
  };
  latitude?: number;
  longitude?: number;
  location?: string;
}

export interface LocationRanking {
  distance: number;
  score: number;
  vendorName: string;
  vendorLocation?: string;
}

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
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
  return Math.round(distance * 100) / 100;
};

export const extractVendorCoordinates = (
  vendor: VendorLocationData
): { latitude: number; longitude: number; locationName?: string } | null => {
  // Check revisions first
  if (vendor.revisions && vendor.revisions.length > 0) {
    const latestRevision = vendor.revisions[0];
    if (latestRevision.generalTerms?.dispatchLocation) {
      const dispatchLocation = latestRevision.generalTerms.dispatchLocation;
      const lat = parseFloat(String(dispatchLocation.latitude));
      const lon = parseFloat(String(dispatchLocation.longitude));

      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        return {
          latitude: lat,
          longitude: lon,
          locationName: `${dispatchLocation.name}, ${dispatchLocation.state}`,
        };
      }
    }
  }

  // Check dispatch location
  if (vendor.dispatchLocation) {
    const lat = parseFloat(String(vendor.dispatchLocation.latitude));
    const lon = parseFloat(String(vendor.dispatchLocation.longitude));

    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      return {
        latitude: lat,
        longitude: lon,
        locationName: vendor.dispatchLocation.name,
      };
    }
  }

  // Check direct coordinates
  if (vendor.latitude !== undefined && vendor.longitude !== undefined) {
    const lat = parseFloat(String(vendor.latitude));
    const lon = parseFloat(String(vendor.longitude));

    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      return {
        latitude: lat,
        longitude: lon,
        locationName: vendor.location,
      };
    }
  }

  return null;
};

export const calculateVendorDistances = (
  vendors: VendorLocationData[],
  buyerLocation: Location
): Map<string, LocationRanking> => {
  const rankings = new Map<string, LocationRanking>();

  vendors.forEach((vendor) => {
    const vendorCoords = extractVendorCoordinates(vendor);

    if (!vendorCoords) {
      rankings.set(vendor.vendorResponseId, {
        distance: 100,
        score: 3,
        vendorName: vendor.name,
        vendorLocation: "Unknown",
      });
      return;
    }

    const distance = calculateDistance(
      buyerLocation.latitude,
      buyerLocation.longitude,
      vendorCoords.latitude,
      vendorCoords.longitude
    );

    rankings.set(vendor.vendorResponseId, {
      distance,
      score: 0,
      vendorName: vendor.name,
      vendorLocation: vendorCoords.locationName,
    });
  });

  return rankings;
};

export const calculateLocationScores = (
  distanceRankings: Map<string, LocationRanking>,
  dataTypeConfigs: any[]
): Map<string, LocationRanking> => {
  const scoredRankings = new Map<string, LocationRanking>();

  const locationConfig = dataTypeConfigs.find(
    (dt) =>
      dt.name.toLowerCase().includes("location") ||
      dt.name.toLowerCase().includes("distance") ||
      dt.id.toLowerCase().includes("location")
  );

  const defaultLocationConfig = {
    scoreMappings: [
      { label: "Very Close", score: 5, operator: "range", rangeStart: 0, rangeEnd: 50 },
      { label: "Close", score: 4, operator: "range", rangeStart: 50, rangeEnd: 100 },
      { label: "Moderate", score: 3, operator: "range", rangeStart: 100, rangeEnd: 200 },
      { label: "Far", score: 2, operator: "range", rangeStart: 200, rangeEnd: 500 },
      { label: "Very Far", score: 1, operator: "range", rangeStart: 500, rangeEnd: 10000 },
    ],
  };

  const effectiveConfig = locationConfig || defaultLocationConfig;

  distanceRankings.forEach((ranking, vendorId) => {
    let score = 3;

    for (const mapping of effectiveConfig.scoreMappings) {
      if (mapping.operator === "range" && mapping.rangeStart !== undefined && mapping.rangeEnd !== undefined) {
        if (ranking.distance >= mapping.rangeStart && ranking.distance < mapping.rangeEnd) {
          score = mapping.score;
          break;
        }
      }
    }

    scoredRankings.set(vendorId, {
      ...ranking,
      score,
    });
  });

  return scoredRankings;
};

export const calculateLocationRankings = (
  vendors: VendorLocationData[],
  dataTypeConfigs: any[],
  buyerLocation: Location | null
): Map<string, LocationRanking> => {
  if (!buyerLocation) {
    const defaultRankings = new Map<string, LocationRanking>();
    vendors.forEach((vendor) => {
      defaultRankings.set(vendor.vendorResponseId, {
        distance: 100,
        score: 3,
        vendorName: vendor.name,
        vendorLocation: "Unknown",
      });
    });
    return defaultRankings;
  }

  const distanceRankings = calculateVendorDistances(vendors, buyerLocation);
  const scoredRankings = calculateLocationScores(distanceRankings, dataTypeConfigs);

  return scoredRankings;
};