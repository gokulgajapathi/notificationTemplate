// src/Home.js
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
