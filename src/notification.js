// src/notification.js
import notifee, { AndroidImportance } from '@notifee/react-native';
import { getMessaging, getToken, onMessage, requestPermission, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { initializeApp } from '@react-native-firebase/app';

const app = initializeApp();
const messagingInstance = getMessaging(app);

// 1️⃣ Setup Android channel
export async function setupAndroidChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

// 2️⃣ Request push permission
export async function requestPushPermission() {
  const authStatus = await requestPermission(messagingInstance);
  const enabled =
    authStatus === 1 || // AUTHORIZED
    authStatus === 2;   // PROVISIONAL
  console.log('Push permission:', enabled);
}

// 3️⃣ Get FCM token
export async function getFcmToken() {
  const token = await getToken(messagingInstance);
  console.log('FCM Token:', token);
  return token;
}

// 4️⃣ Show local notification
export async function showLocalNotification(data) {
  console.log('local notifi ', data);
  
  await notifee.displayNotification({
    title: data.title || 'Demo Notification',
    body: data.body || 'This is a dummy notification',
    android: { channelId: 'default' },
    data,
  });
}

// 5️⃣ Listen to foreground FCM messages
export function subscribeForegroundMessages(callback) {
  return onMessage(messagingInstance, async remoteMessage => {
    console.log('Foreground message received:', remoteMessage);
    if (callback) callback(remoteMessage.data);
  });
}

// Add this at the bottom of your notification.js file
// background notificaiton redirect to orderDetails page
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('Background FCM message received:', remoteMessage);

  // Show local/system notification with data
  await showLocalNotification(remoteMessage.data);
});