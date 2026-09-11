export const VILLAGES = [
  {
    "id": "manali-01",
    "name": "Manali (Solang)",
    "fullName": "Manali � Solang Valley Basin",
    "region": "Himachal Pradesh",
    "district": "Kullu",
    "lat": 32.2432,
    "lng": 77.1892,
    "slopeAngle": 38,
    "elevation": 2050,
    "aspect": "North-East",
    "vegetation": "Alpine Conifer / Deforested Gully",
    "avalancheRisk": {
      "score": 72.4,
      "level": "High"
    },
    "floodRisk": {
      "score": 35,
      "level": "Moderate"
    },
    "weather": {
      "temperature": -2.5,
      "windSpeed": 18,
      "snowfall24h": 12,
      "rainfall24h": 0,
      "humidity": 82,
      "pressure": 1012,
      "condition": "Heavy Snow"
    },
    "topFactors": [
      {
        "name": "Snow Load Ratio",
        "importance": 0.34,
        "key": "snow_depth"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.27,
        "key": "wind_speed"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.19,
        "key": "slope_angle"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.12,
        "key": "temperature"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.08,
        "key": "rainfall"
      }
    ],
    "statusSummary": "High fresh snow load on critical 38� lee slope with 18 km/h crest winds. Solang ski routes under alert.",
    "hiAvalEvents": 16
  },
  {
    "id": "gulmarg-02",
    "name": "Gulmarg (Apharwat)",
    "fullName": "Gulmarg � Apharwat Peak Ridge",
    "region": "Jammu & Kashmir",
    "district": "Baramulla",
    "lat": 34.0484,
    "lng": 74.3805,
    "slopeAngle": 41.5,
    "elevation": 2690,
    "aspect": "North-West",
    "vegetation": "Open Alpine Meadow / Chute",
    "avalancheRisk": {
      "score": 86.8,
      "level": "High"
    },
    "floodRisk": {
      "score": 22,
      "level": "Low"
    },
    "weather": {
      "temperature": -6.2,
      "windSpeed": 28.5,
      "snowfall24h": 24,
      "rainfall24h": 0,
      "humidity": 91,
      "pressure": 1005,
      "condition": "Blizzard"
    },
    "topFactors": [
      {
        "name": "Wind Slab Potential",
        "importance": 0.38,
        "key": "wind_speed"
      },
      {
        "name": "Snow Load Ratio",
        "importance": 0.31,
        "key": "snow_depth"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.21,
        "key": "slope_angle"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.07,
        "key": "temperature"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.03,
        "key": "rainfall"
      }
    ],
    "statusSummary": "Severe blizzard depositing unstable wind slabs along Apharwat Bowl. Phase 2 gondola access restricted.",
    "hiAvalEvents": 24
  },
  {
    "id": "kedarnath-03",
    "name": "Kedarnath Basin",
    "fullName": "Kedarnath � Mandakini Catchment",
    "region": "Uttarakhand",
    "district": "Rudraprayag",
    "lat": 30.7352,
    "lng": 79.0669,
    "slopeAngle": 43,
    "elevation": 3583,
    "aspect": "South-West",
    "vegetation": "Moraine / Glacial Debris",
    "avalancheRisk": {
      "score": 79.2,
      "level": "High"
    },
    "floodRisk": {
      "score": 68.5,
      "level": "High"
    },
    "weather": {
      "temperature": 1.8,
      "windSpeed": 14.2,
      "snowfall24h": 4,
      "rainfall24h": 28.5,
      "humidity": 89,
      "pressure": 1018,
      "condition": "Rain & Sleet"
    },
    "topFactors": [
      {
        "name": "Rainfall Destabilization",
        "importance": 0.36,
        "key": "rainfall"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.28,
        "key": "temperature"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.22,
        "key": "slope_angle"
      },
      {
        "name": "Snow Load Ratio",
        "importance": 0.1,
        "key": "snow_depth"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.04,
        "key": "wind_speed"
      }
    ],
    "statusSummary": "Rain-on-snow event causing heavy snowpack saturation and high GLOF/flash-flood threat in Mandakini valley.",
    "hiAvalEvents": 19
  },
  {
    "id": "dras-04",
    "name": "Dras Gateway",
    "fullName": "Dras � Tiger Hill Flank",
    "region": "Ladakh",
    "district": "Kargil",
    "lat": 34.4294,
    "lng": 75.7589,
    "slopeAngle": 35.5,
    "elevation": 3280,
    "aspect": "North",
    "vegetation": "Barren Rocky Steppe",
    "avalancheRisk": {
      "score": 58.4,
      "level": "Moderate"
    },
    "floodRisk": {
      "score": 14,
      "level": "Low"
    },
    "weather": {
      "temperature": -14.5,
      "windSpeed": 22,
      "snowfall24h": 6.5,
      "rainfall24h": 0,
      "humidity": 68,
      "pressure": 1022,
      "condition": "Cold Drifting Snow"
    },
    "topFactors": [
      {
        "name": "Temperature Anomaly",
        "importance": 0.32,
        "key": "temperature"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.29,
        "key": "wind_speed"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.23,
        "key": "slope_angle"
      },
      {
        "name": "Snow Load Ratio",
        "importance": 0.14,
        "key": "snow_depth"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.02,
        "key": "rainfall"
      }
    ],
    "statusSummary": "Deep sub-zero faceted hoar layer. Drifting snow accumulating on leeward cut slopes along NH-1.",
    "hiAvalEvents": 28
  },
  {
    "id": "kaza-05",
    "name": "Kaza (Spiti)",
    "fullName": "Kaza � Spiti River Corridor",
    "region": "Himachal Pradesh",
    "district": "Lahaul & Spiti",
    "lat": 32.2276,
    "lng": 78.0712,
    "slopeAngle": 32,
    "elevation": 3650,
    "aspect": "South-East",
    "vegetation": "High-Altitude Cold Desert",
    "avalancheRisk": {
      "score": 38,
      "level": "Low"
    },
    "floodRisk": {
      "score": 18.2,
      "level": "Low"
    },
    "weather": {
      "temperature": -9,
      "windSpeed": 11,
      "snowfall24h": 1.5,
      "rainfall24h": 0,
      "humidity": 55,
      "pressure": 1025,
      "condition": "Partly Cloudy"
    },
    "topFactors": [
      {
        "name": "Slope Angle Criticality",
        "importance": 0.35,
        "key": "slope_angle"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.28,
        "key": "wind_speed"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.22,
        "key": "temperature"
      },
      {
        "name": "Snow Load Ratio",
        "importance": 0.12,
        "key": "snow_depth"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.03,
        "key": "rainfall"
      }
    ],
    "statusSummary": "Dry cold snowpack with minimal new accumulation. Low overall trigger potential across local passes.",
    "hiAvalEvents": 8
  },
  {
    "id": "joshimath-06",
    "name": "Joshimath",
    "fullName": "Joshimath � Alaknanda Slope",
    "region": "Uttarakhand",
    "district": "Chamoli",
    "lat": 30.5564,
    "lng": 79.5662,
    "slopeAngle": 37,
    "elevation": 1890,
    "aspect": "North",
    "vegetation": "Terraced Cultivation / Oak Forest",
    "avalancheRisk": {
      "score": 44.5,
      "level": "Moderate"
    },
    "floodRisk": {
      "score": 54,
      "level": "Moderate"
    },
    "weather": {
      "temperature": 4.2,
      "windSpeed": 9.5,
      "snowfall24h": 0,
      "rainfall24h": 18,
      "humidity": 86,
      "pressure": 1016,
      "condition": "Light Rain"
    },
    "topFactors": [
      {
        "name": "Rainfall Destabilization",
        "importance": 0.41,
        "key": "rainfall"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.29,
        "key": "slope_angle"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.18,
        "key": "temperature"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.07,
        "key": "wind_speed"
      },
      {
        "name": "Snow Load Ratio",
        "importance": 0.05,
        "key": "snow_depth"
      }
    ],
    "statusSummary": "Moderate rainfall inducing soil pore pressure. Sub-surface subsidence monitoring active.",
    "hiAvalEvents": 11
  },
  {
    "id": "badrinath-07",
    "name": "Badrinath",
    "fullName": "Badrinath � Neelkanth Approach",
    "region": "Uttarakhand",
    "district": "Chamoli",
    "lat": 30.7433,
    "lng": 79.4938,
    "slopeAngle": 39.5,
    "elevation": 3300,
    "aspect": "East",
    "vegetation": "Scree & Subalpine Grassland",
    "avalancheRisk": {
      "score": 67.5,
      "level": "Moderate"
    },
    "floodRisk": {
      "score": 48,
      "level": "Moderate"
    },
    "weather": {
      "temperature": -3.8,
      "windSpeed": 16,
      "snowfall24h": 9,
      "rainfall24h": 2,
      "humidity": 80,
      "pressure": 1014,
      "condition": "Snow Showers"
    },
    "topFactors": [
      {
        "name": "Snow Load Ratio",
        "importance": 0.35,
        "key": "snow_depth"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.28,
        "key": "slope_angle"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.2,
        "key": "wind_speed"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.11,
        "key": "temperature"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.06,
        "key": "rainfall"
      }
    ],
    "statusSummary": "Fresh snow on transitional ice crust along upper Neelkanth trail. Early spring wet slides possible.",
    "hiAvalEvents": 15
  },
  {
    "id": "sonamarg-08",
    "name": "Sonamarg",
    "fullName": "Sonamarg � Thajiwas Glacier",
    "region": "Jammu & Kashmir",
    "district": "Ganderbal",
    "lat": 34.31,
    "lng": 75.29,
    "slopeAngle": 36.5,
    "elevation": 2740,
    "aspect": "South",
    "vegetation": "Pine Forest & Glacial Outwash",
    "avalancheRisk": {
      "score": 74.8,
      "level": "High"
    },
    "floodRisk": {
      "score": 41,
      "level": "Moderate"
    },
    "weather": {
      "temperature": -4,
      "windSpeed": 21,
      "snowfall24h": 16,
      "rainfall24h": 0,
      "humidity": 87,
      "pressure": 1010,
      "condition": "Blowing Snow"
    },
    "topFactors": [
      {
        "name": "Snow Load Ratio",
        "importance": 0.36,
        "key": "snow_depth"
      },
      {
        "name": "Wind Slab Potential",
        "importance": 0.3,
        "key": "wind_speed"
      },
      {
        "name": "Slope Angle Criticality",
        "importance": 0.21,
        "key": "slope_angle"
      },
      {
        "name": "Temperature Anomaly",
        "importance": 0.09,
        "key": "temperature"
      },
      {
        "name": "Rainfall Destabilization",
        "importance": 0.04,
        "key": "rainfall"
      }
    ],
    "statusSummary": "High fresh snowpack on Zojila access corridor with active wind slab formation on eastern gully chutes.",
    "hiAvalEvents": 22
  }
];
