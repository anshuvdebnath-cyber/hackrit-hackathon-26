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

export default function FeatureImportanceChart({ factors = [], villageName = 'Village', riskLevel = 'Moderate' }) {
  // Sort factors descending
  const sortedFactors = [...factors].sort((a, b) => b.importance - a.importance);

  const labels = sortedFactors.map(f => f.name);
  const dataValues = sortedFactors.map(f => parseFloat((f.importance * 100).toFixed(1)));

  // Color mapping based on importance ranking
  const backgroundColors = sortedFactors.map((_, index) => {
    if (index === 0) return '#A85448'; // Clay (Primary trigger)
    if (index === 1) return '#C18C5D'; // Terracotta (Secondary trigger)
    if (index === 2) return '#D09B6F';
    return '#5D7052';                  // Moss
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Factor Weight Contribution (%)',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(c => c),
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 28,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#26221c',
        titleFont: { family: 'Inter', size: 14, weight: 'bold' },
        bodyFont: { family: 'Roboto', size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.raw}% relative contribution to risk score`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...dataValues, 45) + 5,
        grid: {
          color: '#e7e0d3',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Roboto', size: 13, weight: '600' },
          color: '#544637',
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 13.5, weight: '700' },
          color: '#1a1612',
        },
      },
    },
  };

  // Plain-English physical interpretation helper
  const getFactorExplanation = (factorName, index) => {
    const nameLower = factorName.toLowerCase();
    if (nameLower.includes('snow')) {
      return 'Fresh snowfall rate creates tensile stress on older crust layers, escalating slab release propensity.';
    }
    if (nameLower.includes('wind')) {
      return 'Ridge crest winds actively strip windward slopes and pack fragile wind-slabs into lee couloirs.';
    }
    if (nameLower.includes('slope')) {
      return 'Slopes between 30° and 45° retain maximum snowpack while exceeding critical gravitational shear angles.';
    }
    if (nameLower.includes('rain')) {
      return 'Rainfall introduces liquid water into the snowpack, destroying ice grains and causing wet avalanches / GLOFs.';
    }
    if (nameLower.includes('temperature')) {
      return 'Thermal fluctuation induces shear-plane metamorphic faceting and thermal-shock instabilities.';
    }
    return 'Secondary environmental trigger contributing to overall slope destabilization.';
  };

  return (
    <div className="bg-earth-50 rounded-2xl p-6 sm:p-7 border border-earth-200 shadow-sm space-y-6 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="border-b border-earth-200 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-terracotta-600" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-terracotta-700 font-heading">
            Model Explainability
          </span>
        </div>
        <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-earth-950 mt-1">
          Key Contributing Hazard Drivers
        </h3>
        <p className="text-xs sm:text-sm text-earth-700 font-medium mt-0.5">
          Feature-importance decomposition from the predictive model for {villageName}
        </p>
      </div>

      {/* Enlarged Chart.js Container */}
      <div className="w-full h-64 sm:h-72 bg-white p-4 sm:p-5 rounded-2xl border border-earth-200/90 shadow-sm">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Narrative Breakdown for Local Officials / Judges */}
      <div className="space-y-3">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 flex items-center gap-2 font-heading">
          <span>Physical Factor Interpretation</span>
        </h4>

        <div className="space-y-2.5">
          {sortedFactors.slice(0, 3).map((factor, idx) => (
            <div
              key={factor.name}
              className="bg-white p-4 rounded-xl border border-earth-200/80 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm hover:border-earth-300 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-white flex-shrink-0 mt-0.5 font-heading shadow-sm"
                style={{ backgroundColor: backgroundColors[idx] }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-earth-950 text-sm sm:text-base font-heading truncate">{factor.name}</span>
                  <span className="font-mono font-extrabold text-terracotta-700 text-xs sm:text-sm bg-terracotta-50 border border-terracotta-200/80 px-2.5 py-0.5 rounded-md flex-shrink-0">
                    {(factor.importance * 100).toFixed(1)}% influence
                  </span>
                </div>
                <p className="text-earth-800 mt-1.5 leading-relaxed text-xs sm:text-sm font-medium">
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
