'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationPreferences, NotificationSound } from '@/types/notifications';

const DEFAULT_PREFERENCES: NotificationPreferences = {
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationTypes: {
        newMail: true,
        statusUpdates: true,
        workflowAssignments: true,
        systemAlerts: true,
    }
};

const STORAGE_KEY = 'notification-preferences';

export function useNotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((newPreferences: NotificationPreferences) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
            setPreferences(newPreferences);
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
        }
    }, []);

    // Update specific preference
    const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
        const newPreferences = { ...preferences, ...updates };
        savePreferences(newPreferences);
    }, [preferences, savePreferences]);

    // Update notification type preferences
    const updateNotificationTypes = useCallback((updates: Partial<NotificationPreferences['notificationTypes']>) => {
        const newPreferences = {
            ...preferences,
            notificationTypes: { ...preferences.notificationTypes, ...updates }
        };
        savePreferences(newPreferences);
    }, [preferences, savePreferences]);

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
        savePreferences(DEFAULT_PREFERENCES);
    }, [savePreferences]);

    // Check if a specific notification type is enabled
    const isNotificationTypeEnabled = useCallback((type: keyof NotificationPreferences['notificationTypes']) => {
        return preferences.notificationTypes[type];
    }, [preferences]);

    // Play notification sound (if enabled)
    const playNotificationSound = useCallback((sound: NotificationSound = 'default') => {
        if (!preferences.soundEnabled) return;

        try {
            // Create audio context for playing notification sounds
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Simple beep sound generation
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different sound types
            const frequencies = {
                default: 800,
                chime: 1000,
                bell: 600,
                none: 0
            };

            if (sound !== 'none') {
                oscillator.frequency.value = frequencies[sound];
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }, [preferences.soundEnabled]);

    // Request browser notification permission
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }, []);

    // Show browser notification
    const showBrowserNotification = useCallback(async (title: string, options?: NotificationOptions) => {
        if (!preferences.pushNotifications) return;

        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        } catch (error) {
            console.error('Failed to show browser notification:', error);
        }
    }, [preferences.pushNotifications, requestNotificationPermission]);

    return {
        preferences,
        isLoading,
        updatePreferences,
        updateNotificationTypes,
        resetToDefaults,
        isNotificationTypeEnabled,
        playNotificationSound,
        requestNotificationPermission,
        showBrowserNotification
    };
} 