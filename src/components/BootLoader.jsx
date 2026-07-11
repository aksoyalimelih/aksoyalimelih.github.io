import React, { useState, useEffect } from 'react';
import sfx from '../utils/sfx';

const BootLoader = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const rawLogs = [
    '» INITIALIZING CORE MEMORY BUFFER...',
    '» CONNECTING TO COMPILER MAIN LINK...',
    '» RESOLVING TARGET CORPUS: aksoyalimelih/ayethadisilmihal...',
    '» COMPILING CIRCUITS: OK.',
    '» MOUNTING VIRTUAL GRAPHICS PIPELINE...',
    '» LOADED COMPACT DEV ENVIRONMENT.',
    '» STATUS: SYSTEM ONLINE & SECURE.'
  ];

  useEffect(() => {
    let logIndex = 0;
    
    // Add logs one by one with a random short delay
    const logInterval = setInterval(() => {
      if (logIndex < rawLogs.length) {
        const nextLog = rawLogs[logIndex];
        setLogs(prev => [...prev, nextLog]);
        sfx.playTick();
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 200);

    // Progress bar speedup
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Play a sweep sound on boot complete and callback
          setTimeout(() => {
            sfx.playSweep();
            onComplete();
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="boot-loader-overlay font-mono">
      <div className="boot-terminal-wrapper glass-card">
        <div className="boot-terminal-header">
          <div className="boot-header-dots">
            <span className="b-dot b-red"></span>
            <span className="b-dot b-yellow"></span>
            <span className="b-dot b-green"></span>
          </div>
          <span className="boot-title text-muted text-xs">AMA_CORE_LOADER.sh</span>
        </div>
        
        <div className="boot-terminal-body">
          <pre className="boot-ascii text-gradient font-heavy mb-4">
{`   /\\_/\\     ALI MELIH AKSOY
  ( o.o )    ---------------
   > ^ <     PORTFOLIO CORE v2.0.26`}
          </pre>

          <div className="boot-logs-list mb-4">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`boot-log-line ${log && (log.includes('OK') || log.includes('SECURE')) ? 'text-success' : 'text-muted'}`}
              >
                {log || ''}
              </div>
            ))}
          </div>

          <div className="boot-progress-container mb-2">
            <div className="boot-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="boot-status text-gradient-purple text-xs text-right">
            LOADING: {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootLoader;
