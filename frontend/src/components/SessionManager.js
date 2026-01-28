// SessionManager.js
import React, { useEffect, useState, useRef } from "react";

// Constants for session duration
const SESSION_DURATION_MS = 3600000; // 1 hour

// Helper to get today string
const getTodayKey = () => new Date().toISOString().slice(0, 10);

// Simulated topic generator
const generateTopic = (field) => `Auto topic for ${field} on ${getTodayKey()}`;

// Main logic hook
export function useFieldSession(field) {
  const [session, setSession] = useState(null); // { from, to, active, topic }
  const [topics, setTopics] = useState([]);
  const timerRef = useRef(null);

  // On mount, schedule session from localStorage or init new for today
  useEffect(() => {
    if (!field) return;

    const todayKey = getTodayKey();
    const savedSession = JSON.parse(localStorage.getItem(`session:${field}:${todayKey}`));
    const savedTopics = JSON.parse(localStorage.getItem(`topics:${field}`)) || [];
    setTopics(savedTopics);

    if (savedSession) {
      setSession(savedSession);
    } else {
      // New session for today
      const from = new Date();
      from.setHours(10, 0, 0, 0); // Daily start at 10:00
      const to = new Date(from.getTime() + SESSION_DURATION_MS);
      const sessionObj = {
        from: from.getTime(),
        to: to.getTime(),
        active: false,
        topicGenerated: false,
      };
      localStorage.setItem(`session:${field}:${todayKey}`, JSON.stringify(sessionObj));
      setSession(sessionObj);
    }
  }, [field]);

  // Poll and update session status
  useEffect(() => {
    if (!session) return;
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const isActive = now >= session.from && now <= session.to;
      if (isActive !== session.active) {
        setSession((prev) => ({ ...prev, active: isActive }));
        const todayKey = getTodayKey();
        localStorage.setItem(`session:${field}:${todayKey}`, JSON.stringify({ ...session, active: isActive }));

        // If session just became active, auto-generate topic if not present
        if (isActive && !session.topicGenerated) {
          addTopic();
        }
      }
      // End session after "to" time and lock out topic addition
      if (now > session.to && session.active) {
        setSession((prev) => ({ ...prev, active: false }));
        const todayKey = getTodayKey();
        localStorage.setItem(`session:${field}:${todayKey}`, JSON.stringify({ ...session, active: false }));
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session, field]);

  // Add topic only during session, one per session
  const addTopic = () => {
    const todayKey = getTodayKey();
    if (!session.active || session.topicGenerated) return false;

    const newTopic = generateTopic(field);
    const updatedTopics = [...topics, { field, topic: newTopic, date: todayKey }];
    setTopics(updatedTopics);
    localStorage.setItem(`topics:${field}`, JSON.stringify(updatedTopics));
    setSession((prev) => ({ ...prev, topicGenerated: true }));

    // Store topicGenerated flag in session
    localStorage.setItem(`session:${field}:${todayKey}`, JSON.stringify({ ...session, topicGenerated: true }));
    return true;
  };

  // Expose for UI control: session.active, topicGenerated, addTopic()
  return { session, topics, addTopic };
}
