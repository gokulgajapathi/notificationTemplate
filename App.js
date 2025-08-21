// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import Home from './src/Home';
import OrderDetails from './src/OrderDetails';
// import { navigationRef, flushPending, safeNavigate } from './NavigationRef';
import { navigationRef, flushPending, safeNavigate } from './src/navigationRef';
import { normalizePayload } from './src/notification';

const Stack = createNativeStackNavigator();

function handleNavigationFromData(data) {
  if (data && data.route === 'OrderDetails' && data.orderId) {
    safeNavigate('OrderDetails', { orderId: String(data.orderId) });
  }
}

export default function App() {
  useEffect(() => {
    // Handle COLD START (app killed) opens
    (async () => {
      // If app launched by a Notifee notification tap
      const initialNotifee = await notifee.getInitialNotification();
      if (initialNotifee && initialNotifee.notification && initialNotifee.notification.data) {
        const normalized = normalizePayload({
          data: initialNotifee.notification.data,
          notification: initialNotifee.notification,
        });
        handleNavigationFromData(normalized);
        return;
      }

      // If app launched by an FCM (console) notification tap
      const initialFirebase = await messaging().getInitialNotification();
      if (initialFirebase && initialFirebase.data) {
        const normalized = normalizePayload(initialFirebase);
        handleNavigationFromData(normalized);
      }
    })();

    // Handle BACKGROUND → tap → open (FCM console notifications)
    const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      const normalized = normalizePayload(remoteMessage);
      handleNavigationFromData(normalized);
    });

    // Optional: handle taps on Notifee notifications while app is FOREGROUND
    const unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        const normalized = normalizePayload({
          data: detail.notification.data,
          notification: detail.notification,
        });
        handleNavigationFromData(normalized);
      }
    });

    return () => {
      unsubOpened();
      unsubNotifeeFg();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPending}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
