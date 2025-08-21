// index.js
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// (Optional) If you send data-only messages, you can show a local notification here
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Example (only if you need to surface a tray notification from data-only):
  // await notifee.displayNotification({
  //   title: remoteMessage.data?.title || 'New message',
  //   body: remoteMessage.data?.body || '',
  //   data: remoteMessage.data,
  //   android: { channelId: 'default' },
  // });
});

// If you must react to Notifee background events, you can also:
// notifee.onBackgroundEvent(async ({ type, detail }) => { ... });

AppRegistry.registerComponent(appName, () => App);
