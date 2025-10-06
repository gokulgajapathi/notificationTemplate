// src/notification.js
/**
 * ✅ Normalize notification payload for navigation
 */
export function normalizePayload(remoteMessage) {
  const data = remoteMessage.data || {};
  const notification = remoteMessage.notification || {};
  return {
    // title: notification.title || data.title || 'Notification',
    // body: notification.body || data.body || '',
    // route: data.route || null,      // e.g., 'OrderDetails'
    // orderId: data.orderId || null,  // e.g., '84723'

    ...data,
    title: notification.title,
    body: notification.body,
  };
}