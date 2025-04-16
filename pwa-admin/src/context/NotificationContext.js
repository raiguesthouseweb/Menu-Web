import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

// Create notification context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customSound, setCustomSound] = useState(null);
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [checkInterval, setCheckInterval] = useState(30); // in seconds
  const [audio, setAudio] = useState(null);

  // Initialize notification settings
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load notification settings from localStorage
    const storedSoundEnabled = localStorage.getItem('soundEnabled');
    if (storedSoundEnabled !== null) {
      setSoundEnabled(storedSoundEnabled === 'true');
    }

    const storedCustomSound = localStorage.getItem('customSound');
    if (storedCustomSound) {
      setCustomSound(storedCustomSound);
    }

    const storedCheckInterval = localStorage.getItem('checkInterval');
    if (storedCheckInterval) {
      setCheckInterval(parseInt(storedCheckInterval, 10));
    }

    const storedLastCheckTime = localStorage.getItem('lastCheckTime');
    if (storedLastCheckTime) {
      setLastCheckTime(new Date(storedLastCheckTime));
    } else {
      setLastCheckTime(new Date());
      localStorage.setItem('lastCheckTime', new Date().toISOString());
    }

    // Initialize audio
    initializeAudio();

    // Check if background sync is supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        setBackgroundSync(true);
      });
    }
  }, [isAuthenticated]);

  // Initialize audio with default or custom sound
  const initializeAudio = () => {
    try {
      const soundUrl = customSound || '/static/media/notification.wav';
      const newAudio = new Audio(soundUrl);
      newAudio.load();
      setAudio(newAudio);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  // Update audio when custom sound changes
  useEffect(() => {
    if (isAuthenticated) {
      initializeAudio();
    }
  }, [customSound, isAuthenticated]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || !audio) return;

    try {
      // Clone the audio to allow multiple simultaneous plays
      const soundClone = audio.cloneNode();
      soundClone.volume = 1.0; // Max volume
      soundClone.play().catch(err => {
        console.error('Error playing sound:', err);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Send a test notification
  const sendTestNotification = () => {
    if (notificationPermission !== 'granted') {
      requestNotificationPermission();
      return;
    }

    // Play sound
    playNotificationSound();

    // Create notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Test Notification', {
          body: 'This is a test notification with sound',
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          renotify: true,
          data: { test: true }
        });
      });
    } else {
      // Fallback to regular notification
      new Notification('Test Notification', {
        body: 'This is a test notification with sound',
        icon: '/logo192.png'
      });
    }
  };

  // Set custom notification sound
  const setNotificationSound = (soundUrl) => {
    localStorage.setItem('customSound', soundUrl);
    setCustomSound(soundUrl);
  };

  // Toggle sound enabled/disabled
  const toggleSound = (value) => {
    const newValue = value !== undefined ? value : !soundEnabled;
    localStorage.setItem('soundEnabled', newValue.toString());
    setSoundEnabled(newValue);
  };

  // Set check interval for new orders
  const setOrderCheckInterval = (seconds) => {
    localStorage.setItem('checkInterval', seconds.toString());
    setCheckInterval(seconds);
  };

  // Update last check time
  const updateLastCheckTime = () => {
    const now = new Date();
    localStorage.setItem('lastCheckTime', now.toISOString());
    setLastCheckTime(now);
  };

  return (
    <NotificationContext.Provider value={{
      notificationPermission,
      soundEnabled,
      customSound,
      backgroundSync,
      lastCheckTime,
      checkInterval,
      requestNotificationPermission,
      playNotificationSound,
      sendTestNotification,
      setNotificationSound,
      toggleSound,
      setOrderCheckInterval,
      updateLastCheckTime
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};