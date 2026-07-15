const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

let scriptLoadingPromise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
	if (scriptLoadingPromise) {
		return scriptLoadingPromise;
	}

	scriptLoadingPromise = new Promise((resolve, reject) => {
		if (window.google && window.google.maps) {
			resolve();
			return;
		}

		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () =>
			reject(new Error("Could not load Google Maps script."));

		document.head.appendChild(script);
	});

	return scriptLoadingPromise;
};
