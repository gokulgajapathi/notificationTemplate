// src/notification.js
export function normalizePayload(remoteMessage) {
  if (!remoteMessage) return {};
  const data = (remoteMessage.data || {});
  const notification = (remoteMessage.notification || {});
  return {
    title: notification.title || data.title || 'Notification',
    body: notification.body || data.body || '',
    route: data.route || null,      // e.g., 'OrderDetails'
    orderId: data.orderId || null,  // e.g., '84723'
    ...data,
  };
}
