import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { showLocalNotification } from './src/notification';

// Runs when message is received in background/killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background message:', remoteMessage);
  await showLocalNotification(remoteMessage.data);
});

// Runs when user taps notification in background (not cold start)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('📌 Notification tapped (background)');
    // nothing to navigate here, App handles it via getInitialNotification
  }
});

AppRegistry.registerComponent(appName, () => App);
