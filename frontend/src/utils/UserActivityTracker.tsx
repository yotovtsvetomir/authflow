'use client';

import { useEffect, useRef } from 'react';

const ACTIVE_WINDOW = 15 * 60 * 1000;

export default function UserActivityTracker() {
  const lastPingRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ping backend
  const pingBackend = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/mark-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      lastPingRef.current = Date.now();
    } catch (err) {
      console.error('Failed to ping backend', err);
    }
  };

  // Handle user activity
  const markActive = async () => {
    localStorage.setItem('active', 'true');

    // Only ping if 15 minutes have passed since last ping
    if (Date.now() - lastPingRef.current > ACTIVE_WINDOW) {
      await pingBackend();
    }

    // Reset inactivity timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startInactivityTimer();
  };

  // Start inactivity timer
  const startInactivityTimer = () => {
    timeoutRef.current = setTimeout(async () => {
      localStorage.setItem('active', 'false');
      await pingBackend(); // ping on inactivity
    }, ACTIVE_WINDOW);
  };

  useEffect(() => {
    const events = ['click', 'keydown', 'scroll'];

    events.forEach((e) => window.addEventListener(e, markActive));

    // Initial activity on mount, but don't ping backend immediately
    startInactivityTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}
