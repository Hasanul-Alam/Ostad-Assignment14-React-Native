// App.js OR app/index.tsx (for Expo Router)
// EXPO GO COMPATIBLE VERSION - No Reanimated import needed

import "../global.css";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import MainScreen from "@/src/screens/MainScreen";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <MainScreen />
    </View>
  );
}