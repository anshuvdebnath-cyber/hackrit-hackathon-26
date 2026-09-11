/**
 * Terra Watch - Monitored Himalayan Villages & Terrain Registry
 * Contains static DEM (Digital Elevation Model) terrain attributes.
 * Real-time weather and ML risk predictions are computed dynamically per village.
 */

const VILLAGES = [
  {
    id: "manali-01",
    name: "Old Manali",
    fullName: "Old Manali Sector 4 (Solang Approach)",
    region: "Himachal Pradesh",
    district: "Kullu",
    lat: 32.2590,
    lng: 77.1750,
    slopeAngle: 38,       // Critical slab shear angle (degrees)
    elevation: 2050,      // meters
    aspect: "NE",
    vegetation: "Sparse Pine",
    hiAvalEvents: 14,
    statusSummary: "Moderate slab accumulation on leeward ridgelines above Manu Temple."
  },
  {
    id: "gulmarg-02",
    name: "Gulmarg Apharwat",
    fullName: "Gulmarg Apharwat Ridge Basin",
    region: "Jammu & Kashmir",
    district: "Baramulla",
    lat: 34.0484,
    lng: 74.3805,
    slopeAngle: 42,       // Prime avalanche release chute
    elevation: 2690,
    aspect: "N",
    vegetation: "Alpine Meadow / Bare Rock",
    hiAvalEvents: 28,
    statusSummary: "Persistent wind slab hazard along Gondola Phase-2 backcountry bowls."
  },
  {
    id: "kedarnath-03",
    name: "Kedarnath Basin",
    fullName: "Kedarnath Shrine Moraine Complex",
    region: "Uttarakhand",
    district: "Rudraprayag",
    lat: 30.7346,
    lng: 79.0669,
    slopeAngle: 34,
    elevation: 3583,
    aspect: "S",
    vegetation: "Glacial Till / Moraine",
    hiAvalEvents: 19,
    statusSummary: "Mandakini headwall chutes active during rapid temperature inversions."
  },
  {
    id: "dras-04",
    name: "Dras Sub-Sector",
    fullName: "Dras Valley Tololing Incline",
    region: "Ladakh",
    district: "Kargil",
    lat: 34.4290,
    lng: 75.7530,
    slopeAngle: 36,
    elevation: 3280,
    aspect: "NW",
    vegetation: "Cold Steppe",
    hiAvalEvents: 22,
    statusSummary: "Extreme depth hoar crystallization creating weak base layer across NH-1."
  },
  {
    id: "kaza-05",
    name: "Kaza Spiti",
    fullName: "Kaza Spiti River Escarpment",
    region: "Himachal Pradesh",
    district: "Lahaul & Spiti",
    lat: 32.2276,
    lng: 78.0710,
    slopeAngle: 29,
    elevation: 3650,
    aspect: "SE",
    vegetation: "High Altitude Desert",
    hiAvalEvents: 8,
    statusSummary: "Low seasonal precipitation; localized sluffs along steep scree gullies."
  },
  {
    id: "joshimath-06",
    name: "Joshimath Upper",
    fullName: "Joshimath Auli Chute Line",
    region: "Uttarakhand",
    district: "Chamoli",
    lat: 30.5562,
    lng: 79.5668,
    slopeAngle: 37,
    elevation: 2550,
    aspect: "N",
    vegetation: "Subalpine Deodar",
    hiAvalEvents: 16,
    statusSummary: "Alaknanda tributary drainage prone to wet spring slab avalanches."
  },
  {
    id: "badrinath-07",
    name: "Badrinath Pass",
    fullName: "Nar-Narayan Ridge Enclosure",
    region: "Uttarakhand",
    district: "Chamoli",
    lat: 30.7433,
    lng: 79.4938,
    slopeAngle: 41,
    elevation: 3133,
    aspect: "E",
    vegetation: "Rocky Chutes",
    hiAvalEvents: 25,
    statusSummary: "Steep amphitheater topography channelizing high-velocity powder slides."
  },
  {
    id: "sonamarg-08",
    name: "Sonamarg Thajiwas",
    fullName: "Sonamarg Thajiwas Glacier Track",
    region: "Jammu & Kashmir",
    district: "Ganderbal",
    lat: 34.3050,
    lng: 75.2950,
    slopeAngle: 39,
    elevation: 2740,
    aspect: "NE",
    vegetation: "Fir & Birch Forest Border",
    hiAvalEvents: 31,
    statusSummary: "Major slide path across Zojila approach; high cornice trigger sensitivity."
  }
];

module.exports = VILLAGES;
