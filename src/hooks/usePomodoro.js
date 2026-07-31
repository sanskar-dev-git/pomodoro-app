import { useState, useEffect, useRef } from 'react';
import { SESSION_TYPES, DEFAULT_CONFIG } from '../constants/timerConfig';

export function usePomodoro(customConfig = DEFAULT_CONFIG) {
  const [sessionType, setSessionType] = useState(SESSION_TYPES.WORK);
  const [timeLeft, setTimeLeft] = useState(customConfig[SESSION_TYPES.WORK]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  // Reset time when user updates config settings
  useEffect(() => {
    setTimeLeft(customConfig[sessionType]);
  }, [customConfig, sessionType]);

  // Timer Engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, sessionType, completedSessions]);

  const handleSessionCompletion = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);

    if (sessionType === SESSION_TYPES.WORK) {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);

      // Every 4th work session, initiate a Long Break
      if (nextCount % 4 === 0) {
        setSessionType(SESSION_TYPES.LONG_BREAK);
        setTimeLeft(customConfig[SESSION_TYPES.LONG_BREAK]);
      } else {
        setSessionType(SESSION_TYPES.SHORT_BREAK);
        setTimeLeft(customConfig[SESSION_TYPES.SHORT_BREAK]);
      }
    } else {
      setSessionType(SESSION_TYPES.WORK);
      setTimeLeft(customConfig[SESSION_TYPES.WORK]);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customConfig[sessionType]);
  };

  const switchSession = (type) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(customConfig[type]);
  };

  return {
    sessionType,
    timeLeft,
    isRunning,
    completedSessions,
    toggleTimer,
    resetTimer,
    switchSession,
  };
}