// NavigationRef.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null; // { name, params }

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
