import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../../screens/profile/ProfileScreen";
import EditProfile from "../../screens/profile/EditProfile";
import ProfileHeader from "../../screens/profile/ProfileHeader";
import DeactivateAccount from "../../screens/profile/DeactivateAccount";
import ProfileInfo from "../../screens/profile/ProfileInfo";
import ProfileTabs from "../../screens/profile/ProfileTabs";
import PasswordChange from "../../screens/profile/PasswordChange";
import EditAddress from "../../screens/profile/AddressScreen";
import AvailabilityManagement from "../../screens/profile/AvailabilityManagement";
import ReceiverHistory from "../../screens/receiver/history";

const ProfileStack = createStackNavigator();

function ProfileStackScreen() {
	return (
		<ProfileStack.Navigator>
			<ProfileStack.Screen name="Profile" component={ProfileScreen} />
			<ProfileStack.Screen name="EditProfile" component={EditProfile} />
			<ProfileStack.Screen name="EditAddress" component={EditAddress} />
			<ProfileStack.Screen name="History" component={ReceiverHistory} />
		</ProfileStack.Navigator>
	);
}
