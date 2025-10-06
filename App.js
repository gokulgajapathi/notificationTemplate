// // App.js
// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
// import { Platform, Alert, Linking } from 'react-native';

// import Home from './src/Home';
// import OrderDetails from './src/OrderDetails';
// import { navigationRef, flushPending, safeNavigate } from './src/navigationRef';
// import { normalizePayload } from './src/notification';

// const Stack = createNativeStackNavigator();

// function handleNavigationFromData(data) {
//   if (data && data.route === 'OrderDetails' && data.orderId) {
//     safeNavigate('OrderDetails', { orderId: String(data.orderId) });
//   }
// }

// async function requestUserPermission() {
//   try {
//     // Check current permission status first
//     const currentStatus = await messaging().hasPermission();
//     console.log('Current notification permission status:', currentStatus);

//     // If already authorized, return early
//     if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED) {
//       console.log('Notifications already authorized');
//       return true;
//     }

//     // If denied previously, show helpful message
//     if (currentStatus === messaging.AuthorizationStatus.DENIED) {
//       if (Platform.OS === 'ios') {
//         Alert.alert(
//           'Notifications Disabled',
//           'To receive order updates, please enable notifications in Settings.',
//           [
//             { text: 'Not Now', style: 'cancel' },
//             { 
//               text: 'Open Settings', 
//               onPress: () => Linking.openSettings() 
//             }
//           ]
//         );
//       } else {
//         Alert.alert(
//           'Enable Notifications',
//           'Get real-time order updates and important alerts.',
//           [
//             { text: 'Not Now', style: 'cancel' },
//             { 
//               text: 'Enable', 
//               onPress: () => directPermissionRequest() 
//             }
//           ]
//         );
//       }
//       return false;
//     }

//     // For first-time request, show explanation then request
//     return await directPermissionRequest();
    
//   } catch (error) {
//     console.error('Error checking notification permission:', error);
//     return false;
//   }
// }

// async function directPermissionRequest() {
//   try {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     console.log('Permission result:', authStatus, 'Enabled:', enabled);

//     if (!enabled) {
//       console.log('User declined notification permission');
//     }

//     return enabled;
//   } catch (error) {
//     console.error('Error requesting permission:', error);
//     return false;
//   }
// }

// async function getFcmToken() {
//   try {
//     // Check if token is available
//     if (!messaging().isDeviceRegisteredForRemoteMessages) {
//       await messaging().registerDeviceForRemoteMessages();
//     }
    
//     const token = await messaging().getToken();
//     console.log('FCM Token:', token);
    
//     // You might want to send this token to your backend
//     // await storeFcmTokenOnServer(token);
    
//     return token;
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//     return null;
//   }
// }

// // Setup foreground message handler
// async function setupForegroundHandler() {
//   try {
//     return messaging().onMessage(async remoteMessage => {
//       console.log('Foreground FCM message:', JSON.stringify(remoteMessage));
      
//       // Display the notification using Notifee when app is in foreground
//       if (remoteMessage.notification) {
//         await notifee.displayNotification({
//           title: remoteMessage.notification.title,
//           body: remoteMessage.notification.body,
//           data: remoteMessage.data,
//           android: {
//             channelId: 'default',
//             sound: 'vendor_notify', // Ensure default sound
//             pressAction: {
//               id: 'default',
//             },
//           },
//           ios: {
//             sound: 'vendor_notify', // Ensure default sound on iOS
//           },
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error setting up foreground handler:', error);
//   }
// }

// // Setup background message handler
// async function setupBackgroundHandler() {
//   try {
//     messaging().setBackgroundMessageHandler(async remoteMessage => {
//       console.log('Background FCM message:', JSON.stringify(remoteMessage));
      
//       // Display notification when app is in background
//       if (remoteMessage.notification) {
//         await notifee.displayNotification({
//           title: remoteMessage.notification.title,
//           body: remoteMessage.notification.body,
//           data: remoteMessage.data,
//           android: {
//             channelId: 'default',
//             sound: 'vendor_notify',
//             pressAction: {
//               id: 'default',
//             },
//           },
//           ios: {
//             sound: 'vendor_notify',
//           },
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error setting up background handler:', error);
//   }
// }

// // Create notification channel (Android)
// async function createNotificationChannel() {
//   if (Platform.OS === 'android') {
//     try {
//       await notifee.createChannel({
//         id: 'default',
//         name: 'Default Channel',
//         sound: 'default', // This ensures default sound
//         importance: AndroidImportance.HIGH,
//       });
//       console.log('Android notification channel created');
//     } catch (error) {
//       console.error('Error creating notification channel:', error);
//     }
//   }
// }

// export default function App() {
//   useEffect(() => {
//     const setupNotifications = async () => {
//       try {
//         // 1. Create notification channel first (Android)
//         await createNotificationChannel();
        
//         // 2. Request permissions
//         const hasPermission = await requestUserPermission();
        
//         if (hasPermission) {
//           // 3. Get FCM token
//           await getFcmToken();
          
//           // 4. Setup message handlers
//           await setupForegroundHandler();
//           await setupBackgroundHandler();
//         }

//         // 5. Handle COLD START (app killed) opens
//         const initialNotifee = await notifee.getInitialNotification();
//         if (initialNotifee?.notification?.data) {
//           console.log('App opened from Notifee notification (cold start)');
//           const normalized = normalizePayload({
//             data: initialNotifee.notification.data,
//             notification: initialNotifee.notification,
//           });
//           handleNavigationFromData(normalized);
//           return;
//         }

//         const initialFirebase = await messaging().getInitialNotification();
//         if (initialFirebase?.data) {
//           console.log('App opened from FCM notification (cold start)');
//           const normalized = normalizePayload(initialFirebase);
//           handleNavigationFromData(normalized);
//         }
//       } catch (error) {
//         console.error('Error setting up notifications:', error);
//       }
//     };

//     setupNotifications();

//     // Handle BACKGROUND → tap → open (FCM console notifications)
//     const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
//       console.log('App opened from FCM notification (background)');
//       const normalized = normalizePayload(remoteMessage);
//       handleNavigationFromData(normalized);
//     });

//     // Handle taps on Notifee notifications while app is FOREGROUND
//     const unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
//       if (type === EventType.PRESS && detail.notification) {
//         console.log('Notifee notification tapped in foreground');
//         const normalized = normalizePayload({
//           data: detail.notification.data,
//           notification: detail.notification,
//         });
//         handleNavigationFromData(normalized);
//       }
//     });

//     return () => {
//       unsubOpened();
//       unsubNotifeeFg();
//     };
//   }, []);

//   return (
//     <NavigationContainer ref={navigationRef} onReady={flushPending}>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen name="Home" component={Home} />
//         <Stack.Screen name="OrderDetails" component={OrderDetails} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Alert, Linking } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus, EventType, AndroidImportance } from '@notifee/react-native';

import Home from './src/Home';
import OrderDetails from './src/OrderDetails';
import { navigationRef, flushPending, safeNavigate } from './src/navigationRef';
import { normalizePayload } from './src/notification';

const Stack = createNativeStackNavigator();

/**
 * Navigate based on notification payload
 */
function handleNavigationFromData(data) {
  if (data && data.route === 'OrderDetails' && data.orderId) {
    safeNavigate('OrderDetails', { orderId: String(data.orderId) });
  }
}

/**
 * ✅ Create Android channel with custom sound
 */
async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'vendor_notify', // custom sound
        importance: AndroidImportance.HIGH,
      });
      console.log('[Notifications] Android channel created ✅');
    } catch (err) {
      console.warn('[Notifications] createChannel error:', err);
    }
  }
}

/**
 * ✅ Ask for notification permission (iOS + Android 13+)
 */
async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();
    const granted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    console.log('[Notifications] Permission settings:', settings);
    console.log('[Notifications] Permission granted:', granted);
    


    return granted;
  } catch (err) {
    console.error('[Notifications] requestPermission error:', err);
    return false;
  }
}

/**
 * ✅ Get FCM token
 */
async function getFcmToken() {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    console.log('✅ FCM Token:', token);
    return token;
  } catch (err) {
    console.error('[Notifications] getFcmToken error:', err);
    return null;
  }
}

/**
 * ✅ Foreground message handler
 */
function setupForegroundHandler() {
  return messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground FCM message:', JSON.stringify(remoteMessage));

    if (remoteMessage?.notification) {
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        android: {
          channelId: 'default',
          sound: 'vendor_notify', // custom sound
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'vendor_notify', // custom sound iOS
        },
      });
    }
  });
}

export default function App() {
  useEffect(() => {
    let unsubOnMessage, unsubOpened, unsubNotifeeFg;

    const setupNotifications = async () => {
      try {
        // 1️⃣ Create channel before displaying any notification
        await createNotificationChannel();

        // 2️⃣ Ask permission
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;

        // 3️⃣ Get FCM token
        await getFcmToken();

        // 4️⃣ Setup foreground message listener
        unsubOnMessage = setupForegroundHandler();

        // 5️⃣ Handle cold start (app opened from notification)
        const initialNotifee = await notifee.getInitialNotification();
        if (initialNotifee?.notification?.data) {
          const normalized = normalizePayload({
            data: initialNotifee.notification.data,
            notification: initialNotifee.notification,
          });
          handleNavigationFromData(normalized);
          return;
        }

        const initialFirebase = await messaging().getInitialNotification();
        if (initialFirebase?.data) {
          const normalized = normalizePayload(initialFirebase);
          handleNavigationFromData(normalized);
        }
      } catch (error) {
        console.error('[Notifications] setup error:', error);
      }
    };

    setupNotifications();

    // ✅ Background → foreground tap
    unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📨 App opened from FCM (background)');
      const normalized = normalizePayload(remoteMessage);
      handleNavigationFromData(normalized);
    });

    // ✅ Foreground tap (Notifee)
    unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        const normalized = normalizePayload({
          data: detail.notification.data,
          notification: detail.notification,
        });
        handleNavigationFromData(normalized);
      }
    });

    return () => {
      if (unsubOnMessage) unsubOnMessage();
      if (unsubOpened) unsubOpened();
      if (unsubNotifeeFg) unsubNotifeeFg();
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
