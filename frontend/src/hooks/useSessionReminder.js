import { useState, useEffect } from 'react';

export const useSessionReminder = (sessionsData) => {
  const [remindedSessions, setRemindedSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('remindedSessions') || '{}');
    } catch {
      return {};
    }
  });

  const [activeReminder, setActiveReminder] = useState(null);

  useEffect(() => {
    const checkReminders = () => {
      if (!sessionsData || activeReminder) return;

      const now = new Date();

      const upcomingSessions = sessionsData.filter(s => {
        if (s.status !== 'SCHEDULED') return false;
        if (!s.rawSession.scheduledStart) return false;
        
        // Skip if we already reminded them
        if (remindedSessions[s.id]) return false;

        const scheduledStart = new Date(s.rawSession.scheduledStart);
        // Trigger reminder if the start time is in the past, or within the next 5 minutes
        const timeDiffMs = scheduledStart.getTime() - now.getTime();
        return timeDiffMs <= 5 * 60 * 1000;
      });

      if (upcomingSessions.length > 0) {
        setActiveReminder(upcomingSessions[0]);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [sessionsData, remindedSessions, activeReminder]);

  const dismissReminder = (sessionId) => {
    const updated = { ...remindedSessions, [sessionId]: true };
    setRemindedSessions(updated);
    localStorage.setItem('remindedSessions', JSON.stringify(updated));
    setActiveReminder(null);
  };

  return {
    activeReminder,
    dismissReminder
  };
};
