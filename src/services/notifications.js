/**
 * Notification Service
 * 
 * This module provides the structure for Firebase Cloud Messaging (FCM)
 * push notifications. Currently prepared for future implementation.
 * 
 * To fully implement push notifications:
 * 1. Enable Cloud Messaging in Firebase Console
 * 2. Generate VAPID key and add to .env
 * 3. Create firebase-messaging-sw.js service worker
 * 4. Request notification permissions from user
 * 5. Get FCM token and store it for the user
 * 6. Set up Cloud Functions to send notifications for reminders
 */

import { initializeMessaging } from '../config/firebase'

// Request permission for push notifications
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('Notification permission granted')
      return true
    }
    console.log('Notification permission denied')
    return false
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

// Get FCM token for push notifications
export const getFCMToken = async () => {
  try {
    const messaging = await initializeMessaging()
    if (!messaging) {
      console.log('Messaging not supported')
      return null
    }

    // Note: getToken requires VAPID key from Firebase Console
    // const token = await getToken(messaging, {
    //   vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    // })
    // return token

    console.log('FCM token retrieval not yet implemented')
    return null
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Schedule a local notification (browser notification)
export const scheduleLocalNotification = (title, body, scheduledTime) => {
  const now = new Date().getTime()
  const delay = new Date(scheduledTime).getTime() - now

  if (delay <= 0) {
    console.log('Scheduled time is in the past')
    return null
  }

  const timeoutId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
      })
    }
  }, delay)

  return timeoutId
}

// Cancel a scheduled notification
export const cancelScheduledNotification = (timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}
