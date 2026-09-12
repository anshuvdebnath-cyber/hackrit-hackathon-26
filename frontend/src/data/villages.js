/**
 * Terraform - Verified Himalayan Risk Zones Registry (Frontend Fallback / Offline Telemetry)
 * Ground-truth verified with SASE/DGRE (Defence Geoinformatics Research Establishment),
 * Geological Survey of India (GSI), and the HiAVAL Historical Avalanche Database.
 */

export const VILLAGES = [
  // ==========================================
  // CATEGORY 1: VERIFIED HIGH RISK ZONES (DGRE Red Zones)
  // ==========================================
  {
    id: "zojila-01",
    name: "Zojila Pass (Captain Morh)",
    fullName: "Zojila Pass — Captain Morh Avalanche Axis",
    region: "Ladakh",
    district: "Kargil",
    hazardTier: "High Risk Zone",
    dgReClassification: "DGRE Red Zone",
    lat: 34.3120,
    lng: 75.4800,
    slopeAngle: 38.5,
    elevation: 4030,
    aspect: "NE",
    vegetation: "Barren Alpine Scree",
    hiAvalEvents: 34,
    avalancheRisk: {
      score: 18.5,
      level: "Low"
    },
    floodRisk: {
      score: 15,
      level: "Low"
    },
    weather: {
      temperature: 1.2,
      windSpeed: 24.5,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 52,
      pressure: 630,
      condition: "High Altitude Wind"
    },
    topFactors: [
      { name: "Slope Angle Criticality (38.5°)", importance: 0.40, key: "slope_angle" },
      { name: "Wind Slab Drift Potential", importance: 0.25, key: "wind_speed" },
      { name: "High Altitude Elevation Shear", importance: 0.15, key: "elevation" },
      { name: "Snow Depth Metric", importance: 0.10, key: "snow_depth" },
      { name: "Temperature Gradient", importance: 0.10, key: "temperature" }
    ],
    statusSummary: "Critical DGRE Red Zone; chronic leeward wind-slab accumulation along Srinagar-Leh NH-1D."
  },
  {
    id: "gulmarg-02",
    name: "Gulmarg (Apharwat Peak)",
    fullName: "Gulmarg — Apharwat Peak Phase-2 Cirque",
    region: "Jammu & Kashmir",
    district: "Baramulla",
    hazardTier: "High Risk Zone",
    dgReClassification: "DGRE Red Zone",
    lat: 34.0203,
    lng: 74.3411,
    slopeAngle: 41.0,
    elevation: 3980,
    aspect: "NW",
    vegetation: "Alpine Glacial Cirque / Bare Rock",
    hiAvalEvents: 28,
    avalancheRisk: {
      score: 16.0,
      level: "Low"
    },
    floodRisk: {
      score: 12,
      level: "Low"
    },
    weather: {
      temperature: 4.8,
      windSpeed: 14.2,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 48,
      pressure: 635,
      condition: "Clear Alpine Sky"
    },
    topFactors: [
      { name: "Acute Chute Slope (41.0°)", importance: 0.45, key: "slope_angle" },
      { name: "Wind Slab Inflow", importance: 0.20, key: "wind_speed" },
      { name: "Solar Aspect Thawing", importance: 0.15, key: "temperature" },
      { name: "Historical Slab Frequency", importance: 0.10, key: "hi_aval" },
      { name: "Precipitation Balance", importance: 0.10, key: "rainfall" }
    ],
    statusSummary: "High-frequency backcountry powder & wind slab hazard above Gondola Phase-2 terminal."
  },
  {
    id: "rohtang-03",
    name: "Rohtang Pass (Rahla Chute)",
    fullName: "Rohtang Pass — Rahla Chute & North Ridge",
    region: "Himachal Pradesh",
    district: "Kullu",
    hazardTier: "High Risk Zone",
    dgReClassification: "DGRE Red Zone",
    lat: 32.3820,
    lng: 77.2310,
    slopeAngle: 39.0,
    elevation: 4120,
    aspect: "NE",
    vegetation: "Steep Bedrock & Scree",
    hiAvalEvents: 31,
    avalancheRisk: {
      score: 19.2,
      level: "Low"
    },
    floodRisk: {
      score: 20,
      level: "Low"
    },
    weather: {
      temperature: 2.1,
      windSpeed: 21.0,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 50,
      pressure: 625,
      condition: "Ridge Crest Gusts"
    },
    topFactors: [
      { name: "Critical Shear Gradient (39.0°)", importance: 0.42, key: "slope_angle" },
      { name: "Ridge Wind Jet", importance: 0.28, key: "wind_speed" },
      { name: "Alpine Elevation Gradient", importance: 0.12, key: "elevation" },
      { name: "Precipitation Potential", importance: 0.10, key: "snowfall" },
      { name: "Temperature Inversion", importance: 0.08, key: "temperature" }
    ],
    statusSummary: "Severe Western Disturbance precipitation hub; intense cornice collapse triggers."
  },
  {
    id: "kedarnath-04",
    name: "Kedarnath (Chorabari Basin)",
    fullName: "Kedarnath — Chorabari Glacial Headwall",
    region: "Uttarakhand",
    district: "Rudraprayag",
    hazardTier: "High Risk Zone",
    dgReClassification: "DGRE Red Zone",
    lat: 30.7620,
    lng: 79.0620,
    slopeAngle: 38.0,
    elevation: 3950,
    aspect: "S",
    vegetation: "Glacial Moraine & Ice Fall",
    hiAvalEvents: 22,
    avalancheRisk: {
      score: 17.5,
      level: "Low"
    },
    floodRisk: {
      score: 28,
      level: "Low"
    },
    weather: {
      temperature: 3.5,
      windSpeed: 12.0,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 55,
      pressure: 640,
      condition: "Partly Cloudy Catchment"
    },
    topFactors: [
      { name: "Glacial Headwall Slope (38.0°)", importance: 0.40, key: "slope_angle" },
      { name: "Hydrological Runoff Concentration", importance: 0.25, key: "flood_risk" },
      { name: "Solar Radiation Exposure", importance: 0.15, key: "temperature" },
      { name: "Glacial Debris Loading", importance: 0.10, key: "vegetation" },
      { name: "Historical Outburst Metric", importance: 0.10, key: "hi_aval" }
    ],
    statusSummary: "Acute GLOF and wet-slab channelization corridor directly above Kedarnath shrine."
  },
  {
    id: "dhundi-05",
    name: "Dhundi (Atal Tunnel Portal)",
    fullName: "Dhundi — South Portal Avalanche Path",
    region: "Himachal Pradesh",
    district: "Kullu",
    hazardTier: "High Risk Zone",
    dgReClassification: "DGRE Red Zone",
    lat: 32.3556,
    lng: 77.1292,
    slopeAngle: 37.0,
    elevation: 2895,
    aspect: "E",
    vegetation: "Subalpine Scrub / Chute",
    hiAvalEvents: 19,
    avalancheRisk: {
      score: 15.0,
      level: "Low"
    },
    floodRisk: {
      score: 18,
      level: "Low"
    },
    weather: {
      temperature: 11.2,
      windSpeed: 10.5,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 62,
      pressure: 725,
      condition: "Valley Floor Clear"
    },
    topFactors: [
      { name: "Confined Couloir Slope (37.0°)", importance: 0.38, key: "slope_angle" },
      { name: "Wind Funneling Corridor", importance: 0.22, key: "wind_speed" },
      { name: "Thaw Boundary Temperature", importance: 0.20, key: "temperature" },
      { name: "Chute Scrub Friction", importance: 0.10, key: "vegetation" },
      { name: "Precipitation Balance", importance: 0.10, key: "rainfall" }
    ],
    statusSummary: "Permanent DGRE active research station; high-frequency slide path monitoring."
  },

  // ==========================================
  // CATEGORY 2: VERIFIED MEDIUM RISK ZONES (DGRE Yellow Zones)
  // ==========================================
  {
    id: "keylong-06",
    name: "Keylong (Lahaul Valley)",
    fullName: "Keylong — Lahaul Valley Escarpment",
    region: "Himachal Pradesh",
    district: "Lahaul & Spiti",
    hazardTier: "Medium Risk Zone",
    dgReClassification: "DGRE Yellow Zone",
    lat: 32.5710,
    lng: 77.0320,
    slopeAngle: 31.0,
    elevation: 3106,
    aspect: "SW",
    vegetation: "Subalpine Terraces",
    hiAvalEvents: 12,
    avalancheRisk: {
      score: 12.0,
      level: "Low"
    },
    floodRisk: {
      score: 16,
      level: "Low"
    },
    weather: {
      temperature: 13.5,
      windSpeed: 9.8,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 45,
      pressure: 708,
      condition: "Mild Valley Breeze"
    },
    topFactors: [
      { name: "Escarpment Slope (31.0°)", importance: 0.35, key: "slope_angle" },
      { name: "Valley Wind Circulation", importance: 0.25, key: "wind_speed" },
      { name: "Spring Diurnal Heating", importance: 0.20, key: "temperature" },
      { name: "Terrace Infiltration Rate", importance: 0.10, key: "soil" },
      { name: "Snowfall Potential", importance: 0.10, key: "snowfall" }
    ],
    statusSummary: "Periodic spring wet slides from upper ridges; inhabited river valley floor is buffered."
  },
  {
    id: "dras-07",
    name: "Dras (Tololing Foothills)",
    fullName: "Dras Valley — Tololing Foothills",
    region: "Ladakh",
    district: "Kargil",
    hazardTier: "Medium Risk Zone",
    dgReClassification: "DGRE Yellow Zone",
    lat: 34.4280,
    lng: 75.7510,
    slopeAngle: 30.5,
    elevation: 3280,
    aspect: "NW",
    vegetation: "Cold Steppe Meadow",
    hiAvalEvents: 15,
    avalancheRisk: {
      score: 14.5,
      level: "Low"
    },
    floodRisk: {
      score: 10,
      level: "Low"
    },
    weather: {
      temperature: 7.2,
      windSpeed: 16.0,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 40,
      pressure: 692,
      condition: "Dry Cold Gusts"
    },
    topFactors: [
      { name: "Sub-Zero Temperature Extreme", importance: 0.35, key: "temperature" },
      { name: "Steppe Valley Slope (30.5°)", importance: 0.30, key: "slope_angle" },
      { name: "Katabatic Valley Winds", importance: 0.20, key: "wind_speed" },
      { name: "Depth Hoar Metamorphism", importance: 0.10, key: "snow_depth" },
      { name: "Historical Cold Events", importance: 0.05, key: "hi_aval" }
    ],
    statusSummary: "Intense depth hoar crystallization at sub-zero extremes; moderate valley slope."
  },
  {
    id: "auli-08",
    name: "Auli (Joshimath Slopes)",
    fullName: "Auli — Joshimath Upper Slopes",
    region: "Uttarakhand",
    district: "Chamoli",
    hazardTier: "Medium Risk Zone",
    dgReClassification: "DGRE Yellow Zone",
    lat: 30.5312,
    lng: 79.5694,
    slopeAngle: 28.0,
    elevation: 2750,
    aspect: "N",
    vegetation: "Subalpine Conifer & Deodar",
    hiAvalEvents: 10,
    avalancheRisk: {
      score: 9.5,
      level: "Low"
    },
    floodRisk: {
      score: 14,
      level: "Low"
    },
    weather: {
      temperature: 15.0,
      windSpeed: 7.5,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 58,
      pressure: 740,
      condition: "Fair Alpine"
    },
    topFactors: [
      { name: "Forest Anchor Friction", importance: 0.35, key: "vegetation" },
      { name: "Moderate Incline (28.0°)", importance: 0.30, key: "slope_angle" },
      { name: "Subalpine Temperature", importance: 0.15, key: "temperature" },
      { name: "Wind Exposure", importance: 0.10, key: "wind_speed" },
      { name: "Seasonal Rainfall", importance: 0.10, key: "rainfall" }
    ],
    statusSummary: "Dense forest cover anchors snowpack; localized slides confined to upper clearings."
  },
  {
    id: "badrinath-09",
    name: "Badrinath (Nar-Narayan)",
    fullName: "Badrinath — Nar-Narayan Corridor",
    region: "Uttarakhand",
    district: "Chamoli",
    hazardTier: "Medium Risk Zone",
    dgReClassification: "DGRE Yellow Zone",
    lat: 30.7433,
    lng: 79.4938,
    slopeAngle: 33.0,
    elevation: 3133,
    aspect: "E",
    vegetation: "Subalpine Scrub & Scree",
    hiAvalEvents: 16,
    avalancheRisk: {
      score: 13.8,
      level: "Low"
    },
    floodRisk: {
      score: 22,
      level: "Low"
    },
    weather: {
      temperature: 9.8,
      windSpeed: 11.2,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 54,
      pressure: 705,
      condition: "Alaknanda Gorge Breeze"
    },
    topFactors: [
      { name: "Gorge Flank Incline (33.0°)", importance: 0.36, key: "slope_angle" },
      { name: "Spring Diurnal Melting", importance: 0.24, key: "temperature" },
      { name: "Channelized Wind Drift", importance: 0.20, key: "wind_speed" },
      { name: "Historical Gorge Releases", importance: 0.10, key: "hi_aval" },
      { name: "Alaknanda Catchment Runoff", importance: 0.10, key: "flood_risk" }
    ],
    statusSummary: "Confined valley floor with moderate seasonal hazard during spring thaw periods."
  },
  {
    id: "kaza-10",
    name: "Kaza (Spiti Escarpment)",
    fullName: "Kaza — Spiti River Basin Escarpment",
    region: "Himachal Pradesh",
    district: "Lahaul & Spiti",
    hazardTier: "Medium Risk Zone",
    dgReClassification: "DGRE Yellow Zone",
    lat: 32.2276,
    lng: 78.0710,
    slopeAngle: 26.0,
    elevation: 3650,
    aspect: "SE",
    vegetation: "Arid High-Altitude Desert",
    hiAvalEvents: 7,
    avalancheRisk: {
      score: 8.5,
      level: "Low"
    },
    floodRisk: {
      score: 8,
      level: "Low"
    },
    weather: {
      temperature: 12.0,
      windSpeed: 13.0,
      snowfall24h: 0,
      rainfall24h: 0,
      humidity: 28,
      pressure: 665,
      condition: "Arid High Desert Clear"
    },
    topFactors: [
      { name: "Low Precipitation Rate", importance: 0.40, key: "rainfall" },
      { name: "Low-Gradient Slope (26.0°)", importance: 0.30, key: "slope_angle" },
      { name: "Cold Desert Solar Insolation", importance: 0.15, key: "temperature" },
      { name: "Spiti Wind Exposure", importance: 0.10, key: "wind_speed" },
      { name: "Sparse Soil Moisture", importance: 0.05, key: "soil" }
    ],
    statusSummary: "Rain-shadow dry snowpack; low total precipitation limits slides to loose surface sluffs."
  }
];
