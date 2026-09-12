import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HelpCircle, Brain, Sparkles, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FeatureImportanceChart({ factors = [], villageName = 'Village', riskLevel = 'Moderate', modelStatus }) {
  // Sort factors descending
  const sortedFactors = [...factors].sort((a, b) => b.importance - a.importance);

  const labels = sortedFactors.map(f => f.name);
  const dataValues = sortedFactors.map(f => parseFloat((f.importance * 100).toFixed(1)));

  // Curated, distinct earthy palette for each parameter bar
  const PALETTE = [
    '#A85448', // 1. Clay red (Primary trigger)
    '#C18C5D', // 2. Terracotta (Secondary trigger)
    '#D09B6F', // 3. Warm Ochre
    '#627C5A', // 4. Forest Moss
    '#527084', // 5. Alpine Slate
    '#857463', // 6. Earth Taupe
    '#766A84', // 7. Ridge Dusk
    '#68827A', // 8. Pine Mist
    '#9E7552', // 9. Sienna
  ];
  const backgroundColors = sortedFactors.map((_, index) => PALETTE[index % PALETTE.length]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Factor Weight Contribution (%)',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
        borderRadius: 5,
        barPercentage: 0.70,
        categoryPercentage: 0.75,
        maxBarThickness: 13,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 2,
        bottom: 2,
        left: 0,
        right: 8,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#26221c',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Roboto', size: 11 },
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context) => ` ${context.raw}% relative contribution to risk score`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.min(100, Math.max(...dataValues, 35) + 8),
        grid: {
          color: '#e7e0d3',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Roboto', size: 11 },
          color: '#7c6853',
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 11, weight: '600' },
          color: '#26221c',
          padding: 6,
        },
      },
    },
  };

  // Plain-English physical interpretation helper
  const getFactorExplanation = (factorName, index) => {
    const nameLower = factorName.toLowerCase();
    if (nameLower.includes('marine') || nameLower.includes('water')) {
      return 'Flat water surface / horizontal terrain where avalanche release is physically non-applicable.';
    }
    if (nameLower.includes('slope')) {
      return 'Terrain angle controls gravitational shear. Slopes 30°-45° are in the primary slab release threshold.';
    }
    if (nameLower.includes('snow') && !nameLower.includes('fall')) {
      return 'Depth and density of base snowpack. Deeper snowpack exerts sustained downward shear pressure.';
    }
    if (nameLower.includes('fall') || nameLower.includes('precip') || nameLower.includes('rain')) {
      return 'Recent accumulation rapidly overburdens weak internal layers before consolidation can occur.';
    }
    if (nameLower.includes('wind')) {
      return 'Ridge wind redistributes surface crystals onto leeward slopes, creating cohesive, fragile wind slabs.';
    }
    if (nameLower.includes('temp')) {
      return 'Temperature swings promote slab faceting or thaw lubrication, weakening interfacial bonds.';
    }
    if (nameLower.includes('dew')) {
      return 'Near-surface dewpoint condensation accelerates facet formation and internal slab shear weakness.';
    }
    if (nameLower.includes('pressure')) {
      return 'Barometric gradients correlate with frontal passage, storm intensity, and gust velocity.';
    }
    if (nameLower.includes('humidity')) {
      return 'High moisture saturation accelerates metamorphism and density changes inside the upper snowpack layers.';
    }
    if (nameLower.includes('month') || nameLower.includes('season')) {
      return 'Historical seasonality weighting reflecting mid-winter and spring transition hazard cycles.';
    }
    return `Physical driver ranked #${index + 1} by the XGBoost TreeSHAP attributions.`;
  };

  // Dynamic canvas key ensuring instant re-render upon random point click
  const dynamicKey = `chart_${villageName}_${sortedFactors.map(f => `${f.name}:${f.importance}`).join('|')}`;

  return (
    <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 shadow-sm space-y-4 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="border-b border-earth-200 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-terracotta-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 font-heading">
              Model Explainability (TreeSHAP)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-earth-200/90 text-earth-800 border border-earth-300/80 shadow-xs">
            xgb_avalanche_final.json
          </span>
        </div>
        <h3 className="font-heading text-lg sm:text-xl font-bold text-earth-900 mt-0.5">
          Key Contributing Hazard Drivers
        </h3>
        <p className="text-xs text-earth-700 font-medium">
          SHAP feature-attribution decomposition from the XGBoost model for {villageName}
        </p>
      </div>

      {/* Chart.js Container with clean row separation & expanded height utilizing available space */}
      <div 
        className="w-full flex-1 min-h-[300px] sm:min-h-[340px] lg:min-h-[360px] bg-white p-3 rounded-xl border border-earth-200/80 shadow-inner flex flex-col justify-center"
      >
        <Bar key={dynamicKey} data={chartData} options={chartOptions} />
      </div>

      {/* Narrative Breakdown for Local Officials / Judges */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-800 flex items-center gap-1.5 font-heading">
          <span>Physical Factor Interpretation</span>
        </h4>

        <div className="space-y-2">
          {sortedFactors.slice(0, 3).map((factor, idx) => (
            <div
              key={factor.name}
              className="bg-white p-2.5 rounded-xl border border-earth-200/70 text-xs flex items-start gap-2 shadow-sm hover:border-earth-300 transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5 font-heading"
                style={{ backgroundColor: backgroundColors[idx] }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-earth-900 text-xs sm:text-sm font-heading truncate">{factor.name}</span>
                  <span className="font-mono font-bold text-terracotta-700 text-xs">
                    {(factor.importance * 100).toFixed(1)}% influence
                  </span>
                </div>
                <p className="text-earth-700 mt-0.5 leading-relaxed text-xs font-normal">
                  {getFactorExplanation(factor.name, idx)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
