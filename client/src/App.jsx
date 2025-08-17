// import React, { useState, useRef, useEffect } from 'react';
// import { Pie, Bar, Line } from 'react-chartjs-2';
// import 'chart.js/auto';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

// /**
//  * Helper function to create chart data for the languages pie chart.
//  * @param {object} langs - An object with language names as keys and byte counts as values.
//  * @returns {object} - The Chart.js data object.
//  */
// const createPieChartData = (langs) => {
//   const labels = Object.keys(langs || {});
//   const values = labels.map(l => langs[l]);
//   const backgroundColors = [
//     '#6366f1', // Indigo 500
//     '#facc15', // Amber 400
//     '#f43f5e', // Rose 500
//     '#22d3ee', // Cyan 400
//     '#a855f7', // Purple 500
//     '#10b981', // Emerald 500
//     '#fb923c', // Orange 400
//     '#ec4899', // Pink 500
//     '#4f46e5', // Indigo 600
//     '#d97706', // Yellow 600
//   ];
//   return {
//     labels,
//     datasets: [{
//       data: values,
//       backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
//       borderColor: '#000',
//       borderWidth: 1,
//     }],
//   };
// };

// /**
//  * A component for the app's main header.
//  */
// const Header = () => (
//   <div className="text-center mb-12">
//     <h1 className="text-4xl md:text-5xl font-bold text-indigo-300 drop-shadow-lg animate-pulse-slow">Gitify</h1>
//     <p className="mt-4 text-xl text-gray-400">
//       Quick analysis without cloning the repository.
//     </p>
//   </div>
// );

// /**
//  * A component for the URL input and analysis button.
//  * @param {object} props - Component props.
//  * @param {string} props.repoUrl - The current value of the input field.
//  * @param {function} props.setRepoUrl - State setter for the repoUrl.
//  * @param {boolean} props.running - Whether the analysis is in progress.
//  * @param {function} props.startAnalysis - The function to start the analysis.
//  */
// const InputForm = ({ repoUrl, setRepoUrl, running, startAnalysis }) => (
//   <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-indigo-500/10">
//     <input
//       type="url"
//       value={repoUrl}
//       onChange={(e) => setRepoUrl(e.target.value)}
//       className="flex-1 p-3 text-sm rounded-lg bg-gray-950 border-2 border-indigo-500/20 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
//       placeholder="Paste GitHub repo URL (e.g. https://github.com/facebook/react)"
//       disabled={running}
//     />
//     <button
//       onClick={startAnalysis}
//       disabled={running || !repoUrl}
//       className={`
//         px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300
//         ${running 
//           ? 'bg-gray-600 cursor-not-allowed animate-pulse' 
//           : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-indigo-500/40'
//         }
//       `}
//     >
//       {running ? 'Analyzing...' : 'Analyze'}
//     </button>
//   </div>
// );

// /**
//  * A component to display the analysis progress.
//  * @param {object} props - Component props.
//  * @param {string[]} props.progressMsgs - An array of progress messages.
//  * @param {boolean} props.running - Whether the analysis is in progress.
//  */
// const ProgressDisplay = ({ progressMsgs, running }) => (
//   <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-indigo-500/10">
//     <div className="flex items-center gap-4 mb-4">
//       <div className={`w-6 h-6 rounded-full flex items-center justify-center ${running ? 'bg-indigo-500' : 'bg-gray-700'}`}>
//         <div className={`w-3 h-3 rounded-full ${running ? 'bg-white animate-ping-slow' : 'bg-gray-500'}`} />
//       </div>
//       <h3 className="text-lg font-semibold text-gray-300">Analysis Status</h3>
//     </div>
//     <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
//       <div
//         className="h-full bg-indigo-500 transition-all duration-500 ease-in-out rounded-full"
//         style={{ width: `${Math.min(95, 10 + progressMsgs.length * 18)}%` }}
//       />
//     </div>
//     <p className="mt-4 text-sm text-gray-400">
//       {progressMsgs[progressMsgs.length - 1] || 'Idle, waiting for a repo URL.'}
//     </p>
//     <div className="mt-4 max-h-40 overflow-y-auto">
//       {progressMsgs.map((m, i) => (
//         <div key={i} className="text-xs text-gray-500">{m}</div>
//       ))}
//     </div>
//   </div>
// );

// /**
//  * A component to display the analysis results in cards.
//  * @param {object} props - Component props.
//  * @param {object} props.result - The analysis result object.
//  */
// const AnalysisCards = ({ result }) => {
//   const { meta, languages, contributors, commitActivity, files, llmSummary } = result;

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800
//         titleColor: '#E2E8F0', // gray-200
//         bodyColor: '#A0AEC0', // gray-400
//       }
//     },
//     scales: {
//       x: {
//         ticks: { color: '#6B7280' },
//         grid: { color: '#374151' }
//       },
//       y: {
//         ticks: { color: '#6B7280' },
//         grid: { color: '#374151' }
//       },
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
//       {/* Repo Summary Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h2 className="text-2xl font-bold mb-2">
//           <a href={meta.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
//             {meta.full_name}
//           </a>
//         </h2>
//         <p className="text-gray-400 text-sm mb-4">{meta.description}</p>
//         <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm">
//           <div className="flex items-center gap-2">⭐ Stars: <span className="font-semibold text-indigo-300">{meta.stars}</span></div>
//           <div className="flex items-center gap-2">🍴 Forks: <span className="font-semibold text-indigo-300">{meta.forks}</span></div>
//           <div className="flex items-center gap-2">⚠ Issues: <span className="font-semibold text-indigo-300">{meta.open_issues}</span></div>
//           {meta.license && <div className="flex items-center gap-2">📄 License: <span className="font-semibold text-indigo-300">{meta.license}</span></div>}
//         </div>
//       </div>

//       {/* Languages Pie Chart Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-1 md:col-span-2 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h3 className="font-semibold text-gray-300 mb-4">Languages</h3>
//         <div className="h-48 flex justify-center items-center">
//           <Pie data={createPieChartData(languages)} options={chartOptions} />
//         </div>
//       </div>

//       {/* Commits Line Chart Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-3 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h3 className="font-semibold text-gray-300 mb-4">Commits (last 52 weeks)</h3>
//         <div className="h-56">
//           <Line
//             data={{
//               labels: (commitActivity || []).map(w => new Date(w.week * 1000).toLocaleDateString()),
//               datasets: [{
//                 label: 'Commits',
//                 data: (commitActivity || []).map(w => w.total),
//                 fill: true,
//                 borderColor: 'rgb(129, 140, 248)', // indigo-400
//                 backgroundColor: 'rgba(129, 140, 248, 0.1)',
//                 tension: 0.3
//               }]
//             }}
//             options={chartOptions}
//           />
//         </div>
//       </div>

//       {/* Contributors Bar Chart Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-3 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h3 className="font-semibold text-gray-300 mb-4">Top contributors</h3>
//         <div className="h-64 overflow-auto">
//           <Bar
//             data={{
//               labels: (contributors || []).slice(0, 20).map(c => c.login),
//               datasets: [{
//                 label: 'Contributions',
//                 data: (contributors || []).slice(0, 20).map(c => c.contributions),
//                 backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
//                 borderColor: 'rgba(59, 130, 246, 1)',
//                 borderWidth: 1,
//               }]
//             }}
//             options={{ ...chartOptions, indexAxis: 'y' }}
//           />
//         </div>
//       </div>

//       {/* LLM Summary Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h3 className="font-semibold text-gray-300 mb-4">LLM Summary</h3>
//         <pre className="whitespace-pre-wrap font-sans text-gray-400 text-sm leading-relaxed p-4 bg-gray-950 rounded-lg overflow-x-auto">
//           {llmSummary}
//         </pre>
//       </div>

//       {/* Files of Interest Card */}
//       <div className="bg-gray-900 p-6 rounded-xl shadow-2xl shadow-indigo-500/10 lg:col-span-1 transition-transform hover:scale-[1.01] duration-300 border border-gray-800">
//         <h3 className="font-semibold text-gray-300 mb-4">Files of Interest (Snippets)</h3>
//         <div className="space-y-4 max-h-96 overflow-y-auto">
//           {(files || []).map((f, idx) => (
//             <div key={idx} className="bg-gray-950 p-3 rounded-lg border border-gray-700">
//               <div className="text-xs font-mono text-indigo-400 mb-1">{f.path}</div>
//               <pre className="text-gray-500 text-xs overflow-auto max-h-40">{f.snippet}</pre>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };


// export default function App() {
//   const [repoUrl, setRepoUrl] = useState('');
//   const [running, setRunning] = useState(false);
//   const [progressMsgs, setProgressMsgs] = useState([]);
//   const [result, setResult] = useState(null);
//   const evtRef = useRef(null);

//   useEffect(() => {
//     // Cleanup function to close the event source connection
//     return () => {
//       if (evtRef.current) {
//         evtRef.current.close();
//       }
//     };
//   }, []);

//   const startAnalysis = () => {
//     // Reset state and start a new analysis
//     setProgressMsgs([]);
//     setResult(null);
//     setRunning(true);
//     // Create an EventSource connection to the backend
//     const url = `/api/analyze-stream?repoUrl=${encodeURIComponent(repoUrl)}&llm=1`;
//     const es = new EventSource(url);
//     evtRef.current = es;

//     // Listen for progress messages from the server
//     es.addEventListener('progress', (e) => {
//       try {
//         const d = JSON.parse(e.data);
//         setProgressMsgs(prev => [...prev, d.message]);
//       } catch (err) {}
//     });

//     // Listen for the final result
//     es.addEventListener('result', (e) => {
//       try {
//         const d = JSON.parse(e.data);
//         setResult(d);
//       } catch (err) {}
//     });

//     // Handle any errors from the stream
//     es.addEventListener('error', (e) => {
//       try {
//         const d = JSON.parse(e.data || '{}');
//         setProgressMsgs(prev => [...prev, 'Error: ' + (d.error || 'unknown')]);
//       } catch (err) {
//         setProgressMsgs(prev => [...prev, 'Error occurred']);
//       }
//       setRunning(false);
//       es.close();
//     });

//     // Handle the end of the stream
//     es.addEventListener('done', (e) => {
//       setRunning(false);
//       es.close();
//     });
//   };

//   return (
//     <div className="bg-gray-950 min-h-screen text-white font-sans antialiased p-4 sm:p-8">
//       <div className="max-w-7xl mx-auto">
//         <Header />
//         <InputForm 
//           repoUrl={repoUrl} 
//           setRepoUrl={setRepoUrl} 
//           running={running} 
//           startAnalysis={startAnalysis} 
//         />
//         <ProgressDisplay 
//           progressMsgs={progressMsgs} 
//           running={running}
//         />
//         {result && <AnalysisCards result={result} />}
//       </div>
//     </div>
//   );
// }


// This file represents the main entry point of your application.
// It is kept clean and only renders the main page component.

import React from 'react';
import GithubRepoAnalysisPage from './pages/Github-repoanalysis/index.jsx';

export default function App() {
  return <GithubRepoAnalysisPage />;
}
