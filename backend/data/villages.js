/**
 * Terraform - Verified Himalayan Risk Zones Registry
 * Ground-truth verified with SASE/DGRE (Defence Geoinformatics Research Establishment),
 * Geological Survey of India (GSI), and the HiAVAL Historical Avalanche Database.
 */

const VILLAGES = [
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
    slopeAngle: 38.5,       // Critical slab shear angle
    elevation: 4030,        // Pass couloir altitude (meters)
    aspect: "NE",
    vegetation: "Barren Alpine Scree",
    hiAvalEvents: 34,
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
    slopeAngle: 41.0,       // Acute release bowl
    elevation: 3980,
    aspect: "NW",
    vegetation: "Alpine Glacial Cirque / Bare Rock",
    hiAvalEvents: 28,
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
    statusSummary: "Rain-shadow dry snowpack; low total precipitation limits slides to loose surface sluffs."
  }
];

module.exports = VILLAGES;

