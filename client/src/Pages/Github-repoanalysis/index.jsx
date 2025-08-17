import React, { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import 'chart.js/auto';
// All components are now imported directly from their individual files
import Header from './components/Header.jsx';
import InputForm from './components/InputForm.jsx';
import ProgressDisplay from './components/ProgressDisplay.jsx';
import AnalysisCards from './components/AnalysisCards.jsx';


// Register all Chart.js components once for the entire application
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

export default function GithubRepoAnalysisPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [progressMsgs, setProgressMsgs] = useState([]);
  const [result, setResult] = useState(null);
  const evtRef = useRef(null);

  useEffect(() => {
    // Cleanup function to close the event source connection
    return () => {
      if (evtRef.current) {
        evtRef.current.close();
      }
    };
  }, []);

  const startAnalysis = () => {
    // Reset state and start a new analysis
    setProgressMsgs([]);
    setResult(null);
    setRunning(true);
    const url = `/api/analyze-stream?repoUrl=${encodeURIComponent(repoUrl)}&llm=1`;
    const es = new EventSource(url);
    evtRef.current = es;

    es.addEventListener('progress', (e) => {
      try {
        const d = JSON.parse(e.data);
        setProgressMsgs(prev => [...prev, d.message]);
      } catch (err) {}
    });

    es.addEventListener('result', (e) => {
      try {
        const d = JSON.parse(e.data);
        setResult(d);
      } catch (err) {}
    });

    es.addEventListener('error', (e) => {
      try {
        const d = JSON.parse(e.data || '{}');
        setProgressMsgs(prev => [...prev, 'Error: ' + (d.error || 'unknown')]);
      } catch (err) {
        setProgressMsgs(prev => [...prev, 'Error occurred']);
      }
      setRunning(false);
      es.close();
    });

    es.addEventListener('done', (e) => {
      setRunning(false);
      es.close();
    });
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans antialiased p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <InputForm 
          repoUrl={repoUrl} 
          setRepoUrl={setRepoUrl} 
          running={running} 
          startAnalysis={startAnalysis} 
        />
        <ProgressDisplay 
          progressMsgs={progressMsgs} 
          running={running}
        />
        {result && (
          <>
            
            <AnalysisCards result={result} />
          </>
        )}
      </div>
    </div>
  );
}
