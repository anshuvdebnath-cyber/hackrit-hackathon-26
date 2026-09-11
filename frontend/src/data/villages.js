export const VILLAGES = [
  {
    "id": "manali-01",
    "name": "Manali (Solang)",
    "fullName": "Manali — Solang Valley Basin",
    "region": "Himachal Pradesh",
    "district": "Kullu",
    "lat": 32.2432,
    "lng": 77.1892,
    "slopeAngle": 38,
    "elevation": 2050,
    "aspect": "North-East",
    "vegetation": "Alpine Conifer / Deforested Gully",
    "avalancheRisk": {
      "score": 5.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 25,
      "level": "Low"
    },
    "weather": {
      "temperature": 18.9,
      "windSpeed": 4.2,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 45,
      "pressure": 1014,
      "condition": "Clear / Mild"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Wind Slab Potential", "importance": 0.25, "key": "wind_speed" },
      { "name": "Temperature Anomaly", "importance": 0.15, "key": "temperature" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.10, "key": "rainfall" }
    ],
    "statusSummary": "Clear ground with zero snow accumulation. Stable slope equilibrium across Solang access corridors.",
    "hiAvalEvents": 16
  },
  {
    "id": "gulmarg-02",
    "name": "Gulmarg (Apharwat)",
    "fullName": "Gulmarg — Apharwat Peak Ridge",
    "region": "Jammu & Kashmir",
    "district": "Baramulla",
    "lat": 34.0484,
    "lng": 74.3805,
    "slopeAngle": 41.5,
    "elevation": 2690,
    "aspect": "North-West",
    "vegetation": "Open Alpine Meadow / Chute",
    "avalancheRisk": {
      "score": 5.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 20,
      "level": "Low"
    },
    "weather": {
      "temperature": 17.9,
      "windSpeed": 2.5,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 48,
      "pressure": 1016,
      "condition": "Clear Sky"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Wind Slab Potential", "importance": 0.25, "key": "wind_speed" },
      { "name": "Temperature Anomaly", "importance": 0.15, "key": "temperature" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.10, "key": "rainfall" }
    ],
    "statusSummary": "Apharwat ridge basin currently clear of slab build-up. Standard backcountry trekking precautions.",
    "hiAvalEvents": 24
  },
  {
    "id": "kedarnath-03",
    "name": "Kedarnath Basin",
    "fullName": "Kedarnath — Mandakini Catchment",
    "region": "Uttarakhand",
    "district": "Rudraprayag",
    "lat": 30.7352,
    "lng": 79.0669,
    "slopeAngle": 43,
    "elevation": 3583,
    "aspect": "South-West",
    "vegetation": "Moraine / Glacial Debris",
    "avalancheRisk": {
      "score": 6.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 35,
      "level": "Low"
    },
    "weather": {
      "temperature": 10.3,
      "windSpeed": 2.1,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 52,
      "pressure": 1018,
      "condition": "Partly Cloudy"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Temperature Anomaly", "importance": 0.25, "key": "temperature" },
      { "name": "Wind Slab Potential", "importance": 0.15, "key": "wind_speed" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.10, "key": "rainfall" }
    ],
    "statusSummary": "Upper Mandakini moraines assessed as stable. Normal summer/autumn baseline stream flow.",
    "hiAvalEvents": 19
  },
  {
    "id": "dras-04",
    "name": "Dras Gateway",
    "fullName": "Dras — Tiger Hill Flank",
    "region": "Ladakh",
    "district": "Kargil",
    "lat": 34.4294,
    "lng": 75.7589,
    "slopeAngle": 35.5,
    "elevation": 3280,
    "aspect": "North",
    "vegetation": "Barren Rocky Steppe",
    "avalancheRisk": {
      "score": 4.5,
      "level": "Low"
    },
    "floodRisk": {
      "score": 15,
      "level": "Low"
    },
    "weather": {
      "temperature": 18.1,
      "windSpeed": 9.7,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 38,
      "pressure": 1022,
      "condition": "Dry & Breezy"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Wind Slab Potential", "importance": 0.30, "key": "wind_speed" },
      { "name": "Temperature Anomaly", "importance": 0.15, "key": "temperature" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.05, "key": "rainfall" }
    ],
    "statusSummary": "Tiger Hill flank free of snowpack. NH-1 highway corridor completely open and stable.",
    "hiAvalEvents": 28
  },
  {
    "id": "kaza-05",
    "name": "Kaza (Spiti)",
    "fullName": "Kaza — Spiti River Corridor",
    "region": "Himachal Pradesh",
    "district": "Lahaul & Spiti",
    "lat": 32.2276,
    "lng": 78.0712,
    "slopeAngle": 32,
    "elevation": 3650,
    "aspect": "South-East",
    "vegetation": "High-Altitude Cold Desert",
    "avalancheRisk": {
      "score": 4.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 15,
      "level": "Low"
    },
    "weather": {
      "temperature": 19.0,
      "windSpeed": 6.8,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 32,
      "pressure": 1025,
      "condition": "Sunny Cold Desert"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Wind Slab Potential", "importance": 0.25, "key": "wind_speed" },
      { "name": "Temperature Anomaly", "importance": 0.20, "key": "temperature" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.05, "key": "rainfall" }
    ],
    "statusSummary": "Spiti valley passes currently snow-free. Normal high-desert environmental stability.",
    "hiAvalEvents": 8
  },
  {
    "id": "joshimath-06",
    "name": "Joshimath",
    "fullName": "Joshimath — Alaknanda Slope",
    "region": "Uttarakhand",
    "district": "Chamoli",
    "lat": 30.5564,
    "lng": 79.5662,
    "slopeAngle": 37,
    "elevation": 1890,
    "aspect": "North",
    "vegetation": "Terraced Cultivation / Oak Forest",
    "avalancheRisk": {
      "score": 4.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 30,
      "level": "Low"
    },
    "weather": {
      "temperature": 20.3,
      "windSpeed": 0.4,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 62,
      "pressure": 1018,
      "condition": "Mild Autumn"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Temperature Anomaly", "importance": 0.25, "key": "temperature" },
      { "name": "Wind Slab Potential", "importance": 0.15, "key": "wind_speed" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.10, "key": "rainfall" }
    ],
    "statusSummary": "Alaknanda slope dry with calm winds. Routine geophysical slope stability monitoring.",
    "hiAvalEvents": 11
  },
  {
    "id": "badrinath-07",
    "name": "Badrinath",
    "fullName": "Badrinath — Neelkanth Approach",
    "region": "Uttarakhand",
    "district": "Chamoli",
    "lat": 30.7433,
    "lng": 79.4938,
    "slopeAngle": 39.5,
    "elevation": 3300,
    "aspect": "East",
    "vegetation": "Scree & Subalpine Grassland",
    "avalancheRisk": {
      "score": 5.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 25,
      "level": "Low"
    },
    "weather": {
      "temperature": 12.6,
      "windSpeed": 3.1,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 50,
      "pressure": 1019,
      "condition": "Cool Alpine Clear"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Temperature Anomaly", "importance": 0.25, "key": "temperature" },
      { "name": "Wind Slab Potential", "importance": 0.15, "key": "wind_speed" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.10, "key": "rainfall" }
    ],
    "statusSummary": "Neelkanth approach clear of fresh slab accumulations. Favorable alpine conditions.",
    "hiAvalEvents": 15
  },
  {
    "id": "sonamarg-08",
    "name": "Sonamarg",
    "fullName": "Sonamarg — Thajiwas Glacier",
    "region": "Jammu & Kashmir",
    "district": "Ganderbal",
    "lat": 34.31,
    "lng": 75.29,
    "slopeAngle": 36.5,
    "elevation": 2740,
    "aspect": "South",
    "vegetation": "Pine Forest & Glacial Outwash",
    "avalancheRisk": {
      "score": 5.0,
      "level": "Low"
    },
    "floodRisk": {
      "score": 25,
      "level": "Low"
    },
    "weather": {
      "temperature": 18.4,
      "windSpeed": 6.5,
      "snowfall24h": 0,
      "rainfall24h": 0,
      "humidity": 45,
      "pressure": 1015,
      "condition": "Breezy Clear"
    },
    "topFactors": [
      { "name": "Slope Angle Criticality", "importance": 0.40, "key": "slope_angle" },
      { "name": "Wind Slab Potential", "importance": 0.25, "key": "wind_speed" },
      { "name": "Temperature Anomaly", "importance": 0.20, "key": "temperature" },
      { "name": "Snow Load Ratio", "importance": 0.10, "key": "snow_depth" },
      { "name": "Rainfall Destabilization", "importance": 0.05, "key": "rainfall" }
    ],
    "statusSummary": "Zojila pass approach currently clear of snowpack. Stable conditions throughout the sector.",
    "hiAvalEvents": 22
  }
];
