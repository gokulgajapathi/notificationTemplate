# 📱 FCM + Notifee + Sound Notifications Setup Guide
*Complete React Native Android Notification System*

---

## 🔄 Notification Workflow Explained

### 📊 Overall Notification Flow
```
FCM Server → Device → App State → Notification Display → User Action →   Navigation
     ↓          ↓          ↓             ↓                 ↓                 ↓
  Send     Receive   Determine      Show with        Tap/Interact        Route to
Message    Payload   App State      Sound/UI         with Notification   Specific Screen
```

---

## 🎯 Detailed Workflow Breakdown

### 1. 🔵 FOREGROUND NOTIFICATION WORKFLOW
*When your app is currently open and active*

#### 🔄 Flow Sequence:
```
1. FCM Server → Sends notification payload
2. Device → Receives payload through FCM
3. onMessage() → Triggered (app is in foreground)
4. Notifee → Creates and displays local notification
5. User → Sees notification with custom sound
6. User Tap → onForegroundEvent() triggered
7. Navigation → Routes to specified screen
```

#### 📱 Code Flow:
```javascript
// 1. Message received in foreground
messaging().onMessage(async remoteMessage => {
  console.log('📩 Foreground FCM message received');
  
  // 2. Display notification with sound
  await notifee.displayNotification({
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
    android: {
      channelId: 'default',
      sound: 'vendor_notify', // Custom sound plays
    },
  });
});

// 3. User taps the notification
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    // 4. Extract data and navigate
    const normalized = normalizePayload({
      data: detail.notification.data,
      notification: detail.notification,
    });
    handleNavigationFromData(normalized); // → OrderDetails screen
  }
});
```

#### ⏱️ Timing:
- **Notification shows**: Immediately (0-1 second)
- **Sound plays**: Instantly
- **User action**: Whenever they tap
- **Navigation**: Instant after tap

---

### 2. 🟡 BACKGROUND NOTIFICATION WORKFLOW  
*When your app is open but in background (user pressed home button)*

#### 🔄 Flow Sequence:
```
1. FCM Server → Sends notification payload
2. Device → Receives payload through FCM
3. System → Shows notification in tray (app not active)
4. User → Sees notification in system tray with sound
5. User Tap → System launches your app
6. onNotificationOpenedApp() → Triggered
7. Navigation → Routes to specified screen
```

#### 📱 Code Flow:
```javascript
// 1. App opened from background notification tap
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('📨 App opened from FCM (background)');
  
  // 2. Normalize payload data
  const normalized = normalizePayload(remoteMessage);
  
  // 3. Navigate to specific screen
  handleNavigationFromData(normalized); // → OrderDetails screen
});

// Background message handler (index.js)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // This creates the notification user sees in system tray
  await notifee.displayNotification({
    title: remoteMessage.data?.title,
    body: remoteMessage.data?.body,
    android: {
      channelId: 'default',
      sound: 'vendor_notify', // Sound plays here
    },
  });
});
```

#### ⏱️ Timing:
- **Notification shows**: Immediately in system tray
- **Sound plays**: When notification arrives
- **User action**: When they check phone and tap
- **Navigation**: After app re-opens from tap

---

### 3. 🔴 COLD START NOTIFICATION WORKFLOW
*When your app is completely closed/killed*

#### 🔄 Flow Sequence:
```
1. FCM Server → Sends notification payload
2. Device → Receives payload, app is closed
3. System → Shows notification in tray with sound
4. User → Sees notification, taps to open app
5. System → Launches your app from scratch
6. getInitialNotification() → Checks for pending notification
7. Navigation → Immediately routes to specified screen
```

#### 📱 Code Flow:
```javascript
// In your App.js useEffect - runs when app starts
const setupNotifications = async () => {
  // Check if app was opened from notification (COLD START)
  
  // 1. Check Notifee cold start
  const initialNotifee = await notifee.getInitialNotification();
  if (initialNotifee?.notification?.data) {
    console.log('🚀 App opened from Notifee notification (cold start)');
    const normalized = normalizePayload({
      data: initialNotifee.notification.data,
      notification: initialNotifee.notification,
    });
    handleNavigationFromData(normalized); // Navigate immediately
    return;
  }

  // 2. Check FCM cold start
  const initialFirebase = await messaging().getInitialNotification();
  if (initialFirebase?.data) {
    console.log('🚀 App opened from FCM notification (cold start)');
    const normalized = normalizePayload(initialFirebase);
    handleNavigationFromData(normalized); // Navigate immediately
  }
};
```

#### ⏱️ Timing:
- **Notification shows**: Immediately in system tray
- **Sound plays**: When notification arrives
- **User action**: When they tap to open app
- **Navigation**: Immediately after app finishes loading

---

## 🎛️ Notification State Management

### App State Detection:
```javascript
// Your code handles all three states automatically:

// FOREGROUND: onMessage() + onForegroundEvent()
// BACKGROUND: setBackgroundMessageHandler() + onNotificationOpenedApp()  
// COLD START: getInitialNotification() + navigation on app load
```

### Smart Navigation Handling:
```javascript
// Safe navigation handles all scenarios
export function safeNavigate(name, params) {
  if (navigationRef.isReady()) {
    // App is loaded - navigate immediately
    navigationRef.navigate(name, params);
  } else {
    // App still loading - store for later (COLD START)
    pendingRoute = { name, params };
  }
}

// Once app is ready, flush pending navigation
export function flushPending() {
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.navigate(pendingRoute.name, pendingRoute.params);
    pendingRoute = null;
  }
}
```

---

## 🔊 Sound Workflow

### Android Sound Flow:
```
1. Notification Received → FCM/Notifee processes payload
2. Channel Check → Looks for 'default' channel with 'vendor_notify' sound
3. Sound File → Loads from android/app/src/main/res/raw/vendor_notify.wav
4. Start to play sound in all types ( foreground, background and cold start )
