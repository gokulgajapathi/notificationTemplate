// App.js
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import notifee, { EventType } from '@notifee/react-native';
import {
  setupAndroidChannel,
  requestPushPermission,
  getFcmToken,
  showLocalNotification,
  subscribeForegroundMessages,
} from './src/notification';
import { navigationRef, navigate } from './src/navigationRef';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Show Local Notification"
        onPress={() =>
          showLocalNotification({
            title: 'Demo Local Notification',
            body: 'Tap to see order details',
            route: 'OrderDetails',
            orderId: '0000',
          })
        }
      />
    </View>
  );
}

function OrderDetailsScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Order Details Screen</Text>
      <Text>Order ID: {route.params?.orderId}</Text>
    </View>
  );
}

export default function App() {
  // useEffect(() => {
  //   (async () => {
  //     await setupAndroidChannel();
  //     await requestPushPermission();
  //     await getFcmToken();

  //     // 1️⃣ Foreground FCM messages
  //     const unsubForeground = subscribeForegroundMessages(async data => {
  //       console.log('Foreground Demo', data);

  //       await showLocalNotification(
  //         data ?? {
  //           title: 'Foreground Demo',
  //           body: 'Received while app is open',
  //           route: 'OrderDetails',
  //           orderId: '22',
  //         },
  //       );
  //     });

  //     // 2️⃣ Background / cold-start notifications
  //     const unsubOpened = notifee.onBackgroundEvent(async ({ type, detail }) => {
  //       if (type === EventType.PRESS) {
  //         console.log('Background notification tapped');
  //         handleNotificationOpen(detail.notification?.data ?? {});
  //       }
  //     });

  //     // // Handles taps on notifications (foreground + background + local)
  //     // const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
  //     //   if (type === EventType.PRESS) {
  //     //     console.log('Notification tapped, navigating...');
  //     //     handleNotificationOpen(detail.notification?.data ?? {});
  //     //   }
  //     // });

  //     const initial = await notifee.getInitialNotification();
  //     if (initial?.notification?.data)
  //       handleNotificationOpen(initial.notification.data);

  //     // // 3️⃣ Local notification tap (foreground)
  //     // const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
  //     //   console.log('Local notification tap Demo');
  //     //   if (type === EventType.PRESS) {
  //     //     handleNotificationOpen(detail.notification?.data ?? {});
  //     //   }
  //     // });

  //     return () => {
  //       unsubForeground();
  //       unsubOpened();
  //       unsubNotifee();
  //     };
  //   })();
  // }, []);

//   useEffect(() => {
//   (async () => {
//     await setupAndroidChannel();
//     await requestPushPermission();
//     await getFcmToken();

//     // Foreground FCM → show local
//     const unsubForeground = subscribeForegroundMessages(async data => {
//       await showLocalNotification(data);
//     });

//     // Foreground taps
//     const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
//       if (type === EventType.PRESS) {
//         console.log('👉 Foreground tap, navigating');
//         handleNotificationOpen(detail.notification?.data ?? {});
//       }
//     });

//     // Cold start: check if app was opened from notification
//     const initial = await notifee.getInitialNotification();
//     if (initial?.notification?.data) {
//       console.log('🚀 App cold start from notification');
//       handleNotificationOpen(initial.notification.data);
//     }

//     return () => {
//       unsubForeground();
//       unsubNotifee();
//     };
//   })();
// }, []);

useEffect(() => {
  (async () => {
    await setupAndroidChannel();
    await requestPushPermission();
    await getFcmToken();

    // Foreground messages
    const unsubForeground = subscribeForegroundMessages(async data => {
      await showLocalNotification(data);
    });

    // Foreground tap events
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationOpen(detail.notification?.data ?? {});
      }
    });

    // 🚀 Handle cold-start notification tap
    const initial = await notifee.getInitialNotification();
    if (initial?.notification?.data) {
      const data = initial.notification.data;
      // Wait until navigation is ready
      const checkNavReady = setInterval(() => {
        if (navigationRef.isReady()) {
          clearInterval(checkNavReady);
          handleNotificationOpen(data);
        }
      }, 100); // check every 100ms
    }

    return () => {
      unsubForeground();
      unsubNotifee();
    };
  })();
}, []);



  // function handleNotificationOpen(data = {}) {
  //   const route = data.route;
  //   if (route) {
  //     const { route: _omit, ...params } = data;
  //     navigate(route, params);
  //   }
  // }

//   function handleNotificationOpen(data = {}) {
//   console.log('🔀 Handling navigation with data:', data);
//   const route = data.route;
//   if (route) {
//     const { route: _omit, ...params } = data;
//     navigate(route, params);  // orderId will be inside params
//   }
// }

function handleNotificationOpen(data = {}) {
  console.log('Navigating with data:', data);
  const route = data.route;
  if (route) {
    const { route: _omit, ...params } = data;
    navigate(route, params);  // => OrderDetails with { orderId: "12345" }
  }
}



  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
