# 🚀 Complete FCM + Notifee + Sound Notification Setup
*Beginner-Friendly Guide - Just Copy, Paste & Build!*

---

## 📋 What You'll Build
- ✅ Push notifications with custom sound
- ✅ Smart navigation when tapped
- ✅ Works in all app states (open, background, closed)
- ✅ Professional setup ready for production

---

## 🎯 Quick Start Checklist

### Before You Begin:
- [ ] React Native project created
- [ ] Firebase account (free)
- [ ] Android device/emulator

### Files You'll Create/Modify:
- [ ] `google-services.json` (from Firebase)
- [ ] `vendor_notify.wav` (custom sound)
- [ ] 7 code files (copy-paste ready!)

---

## 🔥 STEP 1: Firebase Setup (5 minutes)

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "MyAppNotifications")
4. Follow the wizard (Google Analytics optional)

### 1.2 Add Android App
1. In your project, click **Android icon** 
2. **Android package name**: `com.yourapp.notifications` (use your actual package name!)
3. **App nickname**: Your app name
4. **SHA-1**: Skip for now
5. Click **"Register app"**

### 1.3 Download Config File
1. Download `google-services.json`
2. Place it here: `android/app/google-services.json`

**✅ File Structure Should Look Like:**
```
your-project/
├── android/
│   └── app/
│       └── google-services.json  ← PLACE IT HERE
├── src/
└── App.js
```

---

## 🔊 STEP 2: Add Custom Sound (2 minutes)

### 2.1 Create Sound Directory
Create this folder if it doesn't exist:
```
android/app/src/main/res/raw/
```

### 2.2 Add Sound File
1. Find or create a sound file (WAV, MP3, OGG)
2. Rename it to: `vendor_notify.wav`
3. Place it in: `android/app/src/main/res/raw/vendor_notify.wav`

**✅ Sound File Location:**
```
android/app/src/main/res/raw/vendor_notify.wav  ← PLACE SOUND HERE
```

---

## ⚙️ STEP 3: Android Configuration Files

### 3.1 Update `android/build.gradle`

**📍 File: `android/build.gradle`**
```gradle
// ADD THIS inside buildscript > dependencies
buildscript {
    dependencies {
        classpath("com.android.tools.build:gradle:7.3.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
        
        // 🔥 ADD THIS LINE:
        classpath("com.google.gms:google-services:4.4.0")
    }
}
```

### 3.2 Update `android/app/build.gradle`

**📍 File: `android/app/build.gradle`**
```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// 🔥 ADD THESE DEPENDENCIES inside dependencies { }
dependencies {
    implementation("com.facebook.react:react-android")
    
    // 🔥 ADD THESE 3 LINES:
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-messaging'
    
    // ... other dependencies
}

// 🔥 ADD THIS AT THE VERY BOTTOM OF FILE:
apply plugin: 'com.google.gms.google-services'
```

### 3.3 Update `android/app/src/main/AndroidManifest.xml`

**📍 File: `android/app/src/main/AndroidManifest.xml`**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- 🔥 ADD THESE PERMISSIONS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTop"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 🔥 ADD FIREBASE SERVICE -->
        <service
            android:name="io.invertase.notifee.NotifeeFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- 🔥 ADD NOTIFICATION CONFIG -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="default"
            tools:replace="android:value" />
            
        <!-- 🔥 ADD NOTIFICATION ICON (use app icon) -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />

    </application>
</manifest>
```

---

## 📱 STEP 4: Install React Native Packages

**Run these commands in your project root:**
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native

cd android && ./gradlew clean && cd ..
```

---

## 🎨 STEP 5: Create React Native Files

### 5.1 Create Navigation Helper

**📍 File: `src/navigationRef.js`**
```javascript
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null;

export function safeNavigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pendingRoute = { name, params };
  }
}

export function flushPending() {
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.navigate(pendingRoute.name, pendingRoute.params);
    pendingRoute = null;
  }
}
```

### 5.2 Create Notification Helper

**📍 File: `src/notification.js`**
```javascript
export function normalizePayload(remoteMessage) {
  const data = remoteMessage.data || {};
  const notification = remoteMessage.notification || {};
  return {
    ...data,
    title: notification.title,
    body: notification.body,
  };
}
```

### 5.3 Create Demo Screens

**📍 File: `src/Home.js`**
```javascript
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>🏠 Home Screen</Text>
      <Button
        title="Go to Order Details (demo)"
        onPress={() => navigation.navigate('OrderDetails', { orderId: '12345' })}
      />
    </View>
  );
}
```

**📍 File: `src/OrderDetails.js`**
```javascript
import React from 'react';
import { View, Text } from 'react-native';

export default function OrderDetails({ route }) {
  const { orderId } = route.params || {};
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>📦 Order Details</Text>
      <Text>Order ID: {orderId || 'N/A'}</Text>
    </View>
  );
}
```

### 5.4 Update Main App File

**📍 File: `App.js`** - REPLACE ENTIRE CONTENT:
```javascript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus, EventType, AndroidImportance } from '@notifee/react-native';

import Home from './src/Home';
import OrderDetails from './src/OrderDetails';
import { navigationRef, flushPending, safeNavigate } from './src/navigationRef';
import { normalizePayload } from './src/notification';

const Stack = createNativeStackNavigator();

function handleNavigationFromData(data) {
  if (data && data.route === 'OrderDetails' && data.orderId) {
    safeNavigate('OrderDetails', { orderId: String(data.orderId) });
  }
}

async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'vendor_notify',
      importance: AndroidImportance.HIGH,
    });
    console.log('✅ Android notification channel created');
  }
}

async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  console.log('✅ Notification permission:', granted);
  return granted;
}

async function getFcmToken() {
  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }
  const token = await messaging().getToken();
  console.log('✅ FCM Token:', token);
  return token;
}

function setupForegroundHandler() {
  return messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground notification received');

    if (remoteMessage?.notification) {
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        android: {
          channelId: 'default',
          sound: 'vendor_notify',
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'vendor_notify',
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
        await createNotificationChannel();
        const hasPermission = await requestNotificationPermission();
        
        if (hasPermission) {
          await getFcmToken();
          unsubOnMessage = setupForegroundHandler();

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
        }
      } catch (error) {
        console.error('❌ Setup error:', error);
      }
    };

    setupNotifications();

    unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      const normalized = normalizePayload(remoteMessage);
      handleNavigationFromData(normalized);
    });

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
```

### 5.5 Update Index File

**📍 File: `index.js`** - REPLACE ENTIRE CONTENT:
```javascript
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification received');
  
  if (remoteMessage?.data) {
    await notifee.displayNotification({
      title: remoteMessage.data.title || 'New update',
      body: remoteMessage.data.body || '',
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        sound: 'vendor_notify',
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'vendor_notify',
      },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
```

---

## 🧪 STEP 6: Build and Test

### 6.1 Build Your App
```bash
npx react-native run-android
```

### 6.2 Check Console for Success
Look for these logs in Metro bundler:
```
✅ Android notification channel created
✅ Notification permission: true
✅ FCM Token: YOUR_UNIQUE_TOKEN
```

### 6.3 Test with This Payload
Use [Firebase Console](https://console.firebase.google.com/) or any API tool:

**Notification Payload:**
```json
{
  "notification": {
    "title": "Order Update!",
    "body": "Your order #12345 is ready for pickup",
    "sound": "vendor_notify"
  },
  "data": {
    "route": "OrderDetails",
    "orderId": "12345"
  },
  "to": "PASTE_YOUR_FCM_TOKEN_HERE"
}
```

---

## 🎯 How It Works - Simple Explanation

### 3 App States Covered:

1. **🔵 App OPEN** (Foreground)
   - Notification pops up with sound
   - Tap → goes to OrderDetails screen

2. **🟡 App in BACKGROUND** 
   - Notification shows in system tray with sound
   - Tap → opens app + goes to OrderDetails

3. **🔴 App CLOSED** (Cold Start)
   - Notification shows in system tray with sound  
   - Tap → opens app + immediately goes to OrderDetails

### What Happens When:
- **Notification arrives**: Custom sound plays
- **User taps**: Smart navigation to right screen
- **App loading**: Waits patiently then navigates

---

## 🔧 Troubleshooting

### ❌ Build Fails
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### ❌ No Sound
- Check `vendor_notify.wav` is in `android/app/src/main/res/raw/`
- Verify file name matches exactly

### ❌ No Notifications
- Check FCM token in console
- Verify `google-services.json` is in correct location
- Ensure all AndroidManifest changes are applied

### ❌ Navigation Not Working
- Check payload has `route: "OrderDetails"` and `orderId: "123"`

---

## 🎉 You're Done!

**What you've built:**
- ✅ Professional notification system
- ✅ Custom sound alerts  
- ✅ Smart navigation from notifications
- ✅ Works in all app states
- ✅ Production-ready code

**Save this guide!** You can reuse it for future projects. 🚀
