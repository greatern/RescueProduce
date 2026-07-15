import { registerRootComponent } from "expo";

import App from "./App";

/* const firebaseConfig = {
	apiKey: "AIzaSyAdNYZB4OrmNjqMSnDIHDMIg7RKU03q_Uc",
	authDomain: "rescue-f2593.firebaseapp.com",
	projectId: "rescue-f2593",
	storageBucket: "rescue-f2593.firebasestorage.app",
	messagingSenderId: "416449164853",
	appId: "1:416449164853:android:ecf778027db3032084e37c",
};

if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
} */

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
