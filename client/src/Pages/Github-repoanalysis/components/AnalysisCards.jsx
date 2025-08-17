import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';

const createPieChartData = (langs) => {
  const labels = Object.keys(langs || {});
  const values = labels.map(l => langs[l]);
  const backgroundColors = [
    '#6366f1', // Indigo 500
    '#facc15', // Amber 400
    '#f43f5e', // Rose 500
    '#22d3ee', // Cyan 400
    '#a855f7', // Purple 500
    '#10b981', // Emerald 500
    '#fb923c', // Orange 400
    '#ec4899', // Pink 500
    '#4f46e5', // Indigo 600
    '#d97706', // Yellow 600
  ];
  
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
      borderColor: '#000',
      borderWidth: 1,
    }],
  };
};


const HealthScoreCard = ({ score }) => {
  let scoreClass = 'text-gray-400';
  let message = 'Score not available';
  if (score >= 80) {
    scoreClass = 'text-green-400 drop-shadow-lg shadow-green-400/30';
    message = 'Excellent - A very healthy and active project.';
  } else if (score >= 60) {
    scoreClass = 'text-yellow-400 drop-shadow-lg shadow-yellow-400/30';
    message = 'Good - Active with a strong community.';
  } else if (score >= 40) {
    scoreClass = 'text-orange-400 drop-shadow-lg shadow-orange-400/30';
    message = 'Fair - Has potential but needs more activity.';
  } else if (score > 0) {
    scoreClass = 'text-red-400 drop-shadow-lg shadow-red-400/30';
    message = 'Needs Attention - Low activity or community engagement.';
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 transition-transform hover:scale-[1.01] duration-300 border border-gray-800 flex flex-col items-center">
      <h3 className="font-semibold text-gray-300 mb-4">Project Health Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            className="text-gray-700" 
            strokeWidth="8" 
            stroke="currentColor" 
            fill="transparent" 
            r="45" 
            cx="64" 
            cy="64" 
          />
          <circle 
            className={`${scoreClass.split(' ')[0]} transition-all duration-700`} 
            strokeWidth="8" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r="45" 
            cx="64" 
            cy="64" 
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className={`text-4xl font-bold ${scoreClass}`}>{score}</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-center text-gray-400">{message}</p>
    </div>
  );
};

export default function AnalysisCards({ result }) {
  const { meta, languages, contributors, commitActivity, files, llmSummary } = result;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#E2E8F0',
        bodyColor: '#A0AEC0',
      }
    },
    scales: {
      x: {
        ticks: { color: '#6B7280' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#6B7280' },
        grid: { color: '#374151' }
      },
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <HealthScoreCard score={meta.healthScore} />

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h2 className="text-2xl font-bold mb-2">
          <a href={meta.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            {meta.full_name}
          </a>
        </h2>
        <p className="text-gray-400 text-sm mb-4">{meta.description}</p>
        <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm">
          <div className="flex items-center gap-2">⭐ Stars: <span className="font-semibold text-indigo-300">{meta.stars}</span></div>
          <div className="flex items-center gap-2">🍴 Forks: <span className="font-semibold text-indigo-300">{meta.forks}</span></div>
          <div className="flex items-center gap-2">⚠ Issues: <span className="font-semibold text-indigo-300">{meta.open_issues}</span></div>
          {meta.license && <div className="flex items-center gap-2">📄 License: <span className="font-semibold text-indigo-300">{meta.license}</span></div>}
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-1 md:col-span-2 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">Languages</h3>
        <div className="h-48 flex justify-center items-center">
          <Pie data={createPieChartData(languages)} options={chartOptions} />
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-3 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">Commits (last 52 weeks)</h3>
        <div className="h-56">
          <Line
            data={{
              labels: (commitActivity || []).map(w => new Date(w.week * 1000).toLocaleDateString()),
              datasets: [{
                label: 'Commits',
                data: (commitActivity || []).map(w => w.total),
                fill: true,
                borderColor: 'rgb(129, 140, 248)',
                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                tension: 0.3
              }]
            }}
            options={chartOptions}
          />
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-3 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">Top contributors</h3>
        <div className="h-64 overflow-auto">
          <Bar
            data={{
              labels: (contributors || []).slice(0, 20).map(c => c.login),
              datasets: [{
                label: 'Contributions',
                data: (contributors || []).slice(0, 20).map(c => c.contributions),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
              }]
            }}
            options={{ ...chartOptions, indexAxis: 'y' }}
          />
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">LLM Summary</h3>
        <pre className="whitespace-pre-wrap font-sans text-gray-400 text-sm leading-relaxed p-4 bg-gray-950 rounded-lg overflow-x-auto">
          {llmSummary}
        </pre>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-1 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">Files of Interest (Snippets)</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(files || []).map((f, idx) => (
            <div key={idx} className="bg-gray-950 p-3 rounded-lg border border-gray-700">
              <div className="text-xs font-mono text-indigo-400 mb-1">{f.path}</div>
              <pre className="text-gray-500 text-xs overflow-auto max-h-40">{f.snippet}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
