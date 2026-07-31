import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [mode, setMode] = useState('WORK');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [ambientSound, setAmbientSound] = useState('off');

  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const activeSoundNodesRef = useRef([]);

  // Production Standard Mode Configurations
  const modes = {
    WORK: {
      label: 'WORK',
      time: 25 * 60,
      color: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      buttonBg: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25',
      activeTab: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
    },
    SHORT_BREAK: {
      label: 'SHORT BREAK',
      time: 5 * 60,
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
      buttonBg: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25',
      activeTab: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    },
    LONG_BREAK: {
      label: 'LONG BREAK',
      time: 15 * 60,
      color: '#6366F1',
      glow: 'rgba(99, 102, 241, 0.4)',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25',
      activeTab: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    },
  };

  const currentTheme = modes[mode];

  // Dynamic Starfield Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numStars = 200;
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      size: Math.random() * 1.5 + 0.5,
    }));

    let currentSpeed = 1.2;

    const render = () => {
      const targetSpeed = isRunning ? 8 : 1.2;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= currentSpeed;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        const k = 256 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.1, star.size * k * 0.6);
          const streak = isRunning ? star.x * k * 0.04 : 0;

          ctx.beginPath();
          ctx.strokeStyle = currentTheme.color;
          ctx.lineWidth = size;
          ctx.moveTo(px, py);
          ctx.lineTo(px - streak, py - streak);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, mode]);

  // Audio Feedback Synthesizer
  const playSound = (type = 'click') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      } else if (type === 'pause') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  };

  const stopAmbience = () => {
    activeSoundNodesRef.current.forEach((node) => {
      try { node.stop(); } catch (e) {}
    });
    activeSoundNodesRef.current = [];
  };

  const toggleAmbientSound = (type) => {
    playSound('click');
    stopAmbience();

    if (ambientSound === type) {
      setAmbientSound('off');
      return;
    }

    setAmbientSound(type);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'deepfocus') {
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const gain = ctx.createGain();

        oscLeft.type = 'sine';
        oscRight.type = 'sine';
        
        oscLeft.frequency.value = 200;
        oscRight.frequency.value = 240;

        gain.gain.value = 0.04;

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(ctx.destination);

        oscLeft.start();
        oscRight.start();

        activeSoundNodesRef.current = [oscLeft, oscRight];
      } else {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 250;

        const gain = ctx.createGain();
        gain.gain.value = 0.03;

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        activeSoundNodesRef.current = [whiteNoise];
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModeChange = (newMode) => {
    playSound('click');
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
    setIsRunning(false);
  };

  const handleStartPause = () => {
    if (isRunning) {
      playSound('pause');
      setIsRunning(false);
    } else {
      playSound('start');
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    playSound('click');
    setIsRunning(false);
    setTimeLeft(modes[mode].time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playSound('start');
      if (mode === 'WORK') {
        setCompletedSessions((prev) => prev + 1);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between items-center text-white select-none overflow-hidden p-4 sm:p-6 bg-[#020617] relative">
      
      {/* Background Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 text-center pt-1 sm:pt-2">
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to right, ${currentTheme.color}, #ffffff)`
          }}
        >
          Pomodoro
        </h1>
        <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 tracking-wider uppercase font-medium">
          Stay focused, stay productive.
        </p>
      </header>

      {/* Main Content (Fits tight to screen height) */}
      <main className="relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-5 my-auto w-full max-w-xl">
        
        {/* Mode Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
          {Object.keys(modes).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                mode === m
                  ? modes[m].activeTab
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {modes[m].label}
            </button>
          ))}
        </div>

        {/* Viewport-Scaled Dynamic Ring */}
        <div 
          className="relative flex items-center justify-center w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] max-h-[40vh] max-w-[40vh] rounded-full border-4 sm:border-[5px] transition-all duration-500 bg-slate-950/80 backdrop-blur-md"
          style={{
            borderColor: currentTheme.color,
            boxShadow: `0 0 40px ${currentTheme.glow}`
          }}
        >
          <div className="text-center">
            <span 
              className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase block mb-1 transition-colors duration-500"
              style={{ color: currentTheme.color }}
            >
              {mode.replace('_', ' ')}
            </span>
            <span className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartPause}
            className={`px-8 sm:px-12 py-2.5 sm:py-3 font-extrabold text-xs sm:text-sm tracking-widest rounded-full transition duration-300 shadow-xl active:scale-95 cursor-pointer uppercase ${currentTheme.buttonBg}`}
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 sm:p-3 bg-slate-900/80 border border-slate-800 text-gray-400 hover:text-white rounded-full transition duration-200 active:scale-95 cursor-pointer shadow-xl text-sm sm:text-base"
            title="Reset"
          >
            ↺
          </button>
        </div>

        {/* Ambience Control Center */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-900/70 px-4 py-2 rounded-2xl border border-slate-800/80 text-xs text-gray-300 backdrop-blur-md shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ambience:</span>
          
          <button
            onClick={() => toggleAmbientSound('deepfocus')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              ambientSound === 'deepfocus' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 shadow-sm' : 'hover:text-white text-gray-300'
            }`}
          >
            🧠 Deep Focus
          </button>

          <button
            onClick={() => toggleAmbientSound('space')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              ambientSound === 'space' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm' : 'hover:text-white text-gray-300'
            }`}
          >
            🚀 Cosmic
          </button>

          <button
            onClick={() => toggleAmbientSound('rain')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              ambientSound === 'rain' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-sm' : 'hover:text-white text-gray-300'
            }`}
          >
            🌧️ Rain
          </button>

          <div className="hidden sm:block h-3 w-[1px] bg-slate-800 mx-1"></div>
          
          <div className="text-[11px] text-gray-400">
            Completed: <span className="font-bold text-white ml-0.5">{completedSessions}</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide self-end pb-1">
        Made by <span className="text-cyan-400 font-semibold">Sanskar Soni</span>
      </footer>

    </div>
  );
}