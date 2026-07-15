import "bootstrap-icons/font/bootstrap-icons.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./styles/App.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
	window.addEventListener("load", async () => {
		try {
			const registration = await navigator.serviceWorker.register(
				"/sw.js"
			);
			console.log("SW registered: ", registration);
		} catch (registrationError) {
			console.log("SW registration failed: ", registrationError);
		}
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
);
