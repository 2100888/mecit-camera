import React from 'react';
import Main from './components/Camera';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View>
      <StatusBar hidden />
      <Main />
    </View>
  );
};
