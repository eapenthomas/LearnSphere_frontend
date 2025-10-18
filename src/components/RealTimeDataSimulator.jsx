import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

const RealTimeDataSimulator = ({ onDataUpdate, isActive, onToggle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds between updates
  const [dataPoints, setDataPoints] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        // Generate realistic data variations
        const newData = {
          timestamp: new Date(),
          enrollments: Math.floor(Math.random() * 5) + 1,
          progress: Math.floor(Math.random() * 10) + 5,
          submissions: Math.floor(Math.random() * 8) + 2,
          activeStudents: Math.floor(Math.random() * 3) + 1,
        };
        
        onDataUpdate(newData);
        setDataPoints(prev => prev + 1);
      }, speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isActive, speed, onDataUpdate]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setDataPoints(0);
    onDataUpdate(null); // Reset data
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <h3 className="font-semibold">Real-time Data Simulator</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-white/80 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm">Speed:</span>
          <select
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm"
          >
            <option value={500}>Fast (0.5s)</option>
            <option value={1000}>Normal (1s)</option>
            <option value={2000}>Slow (2s)</option>
            <option value={5000}>Very Slow (5s)</option>
          </select>
        </div>

        {/* Stats */}
        <div className="text-sm">
          <div className="flex items-center space-x-2">
            <span>Updates:</span>
            <span className="font-bold">{dataPoints}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <span className={`font-bold ${isPlaying ? 'text-green-300' : 'text-yellow-300'}`}>
              {isPlaying ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-3 flex items-center space-x-2"
          >
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90">Live data streaming...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RealTimeDataSimulator;
