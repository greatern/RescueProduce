import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { VolunteerProvider } from "../../contexts/VolunteerContext";

// Import volunteer screens (removed ReportFraud and Profile)
import VolunteerHome from "../screens/Volunteer/VolunteerHome";
import Tasks from "../screens/Volunteer/Tasks";
import ConfirmDelivery from "../screens/Volunteer/ConfirmDelivery";
import Availability from "../screens/Volunteer/Availability";

import { COLORS } from "../../constants";

export type VolunteerStackParamList = {
	VolunteerHome: undefined;
	Tasks: undefined;
	ConfirmDelivery: { taskId: string };
	Availability: undefined;
};

const Stack = createStackNavigator<VolunteerStackParamList>();

const VolunteerNavigator: React.FC = () => {
	return (
		<VolunteerProvider>
			<Stack.Navigator
				initialRouteName="VolunteerHome"
				screenOptions={{
					headerStyle: {
						backgroundColor: COLORS.lightWhite,
					},
					headerTintColor: COLORS.primary,
					headerTitleStyle: {
						fontWeight: "bold",
					},
				}}>
				<Stack.Screen
					name="Tasks"
					component={Tasks}
					options={{ title: "Available Tasks" }}
				/>

				<Stack.Screen
					name="Availability"
					component={Availability}
					options={{ title: "Set Availability" }}
				/>
			</Stack.Navigator>
		</VolunteerProvider>
	);
};

export default VolunteerNavigator;
