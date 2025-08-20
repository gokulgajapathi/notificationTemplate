import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// Handle messages in the background/killed state (Android)
// ⚠️ This file runs in a separate JS context
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Ensure channel exists
  await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });

  // Show a local notification yourself (great for data-only)
  await notifee.displayNotification({
    title: remoteMessage.data?.title ?? 'New message',
    body: remoteMessage.data?.body ?? '',
    android: { channelId: 'default' },
    data: remoteMessage.data,
  });
});

AppRegistry.registerComponent(appName, () => App);
