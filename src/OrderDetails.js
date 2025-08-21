// src/OrderDetails.js
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
