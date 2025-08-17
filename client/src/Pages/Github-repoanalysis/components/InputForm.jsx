import React from 'react';

export default function InputForm({ repoUrl, setRepoUrl, running, startAnalysis }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-indigo-500/10">
      <input
        type="url"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="flex-1 p-3 text-sm rounded-lg bg-gray-950 border-2 border-indigo-500/20 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        placeholder="Paste GitHub repo URL (e.g. https://github.com/facebook/react)"
        disabled={running}
      />
      <button
        onClick={startAnalysis}
        disabled={running || !repoUrl}
        className={`
          px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300
          ${running 
            ? 'bg-gray-600 cursor-not-allowed animate-pulse' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-indigo-500/40'
          }
        `}
      >
        {running ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
}
