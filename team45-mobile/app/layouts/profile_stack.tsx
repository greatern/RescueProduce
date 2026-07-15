import { createStackNavigator } from "@react-navigation/stack";
import Profile from "../App/screens/profile/index";
import EditAddress from "../App/screens/profile/AddressScreen";
import EditProfile from "../App/screens/profile/ProfileScreen";
import ReceiverHistory from "../App/screens/receiver/history";
const Stack = createStackNavigator();

interface ProfileStackProp {
	setHideTab?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileStack = ({ setHideTab }: ProfileStackProp) => {
	return (
		<Stack.Navigator
			screenOptions={{ headerShown: false }}
			screenListeners={{
				state: (e) => {
					const state = e.data.state;
					const currentRoute = state.routes[state.index];
					const currentScreen = currentRoute.name;

					const shouldHideTab = currentScreen === "EditAddress";
					setHideTab && setHideTab(shouldHideTab);
				},
			}}>
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="EditProfile" component={EditProfile} />
			<Stack.Screen name="EditAddress" component={EditAddress} />
			<Stack.Screen name="ReceiverHistory" component={ReceiverHistory} />
		</Stack.Navigator>
	);
};

export default ProfileStack;
