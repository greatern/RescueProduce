import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./App/navigation/RootNavigator";

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<StatusBar style="dark" backgroundColor="#FAFAFC" />
			<RootNavigator />
		</GestureHandlerRootView>
	);
}
