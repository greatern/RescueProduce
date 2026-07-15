import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ReceiverHome from "./LiveDonationsPage";
import ClaimScreen from "./ClaimScreen";
import ReceiverLayout from "../../../layouts/receiver";

const Stack = createStackNavigator();

const ReceiverNavigation = () => {
	return <ReceiverLayout />;
};

export default ReceiverNavigation;
