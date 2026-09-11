/**
 * Terra Watch - Prediction History & Audit Logger
 * Stores timestamped evaluations so authorities can review trend trajectories.
 */

const MAX_HISTORY_ENTRIES = 200;
const historyStore = [];

function recordEvaluation({ villageId, villageName, coordinates, weather, avalancheRisk, floodRisk, source }) {
  const entry = {
    id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    villageId: villageId || 'custom-coord',
    villageName: villageName || `Coordinate (${coordinates?.lat?.toFixed(3)}, ${coordinates?.lng?.toFixed(3)})`,
    coordinates: coordinates || null,
    weather: {
      temperature: weather?.temperature ?? 0,
      windSpeed: weather?.windSpeed ?? 0,
      snowfall24h: weather?.snowfall24h ?? 0,
      rainfall24h: weather?.rainfall24h ?? 0
    },
    avalancheRisk: {
      score: avalancheRisk?.score ?? 0,
      level: avalancheRisk?.level ?? 'Low'
    },
    floodRisk: {
      score: floodRisk?.score ?? 0,
      level: floodRisk?.level ?? 'Low'
    },
    source: source || 'unknown'
  };

  historyStore.unshift(entry);
  if (historyStore.length > MAX_HISTORY_ENTRIES) {
    historyStore.pop();
  }

  return entry;
}

function getHistory(villageId, limit = 20) {
  if (villageId) {
    return historyStore.filter(h => h.villageId === villageId).slice(0, limit);
  }
  return historyStore.slice(0, limit);
}

module.exports = {
  recordEvaluation,
  getHistory
};
