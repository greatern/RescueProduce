import { loadGoogleMapsApi } from "../utils/google_script";

export interface Address {
	id: string;
	address_line1: string;
	address_line2: string;
	city: string;
	province: string;
	postal_code: string;
	country: string;
	latitude: number;
	longitude: number;
	place_id?: string;
}

export interface GooglePlacePrediction {
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

class GoogleMapsService {
	private autocompleteService: google.maps.places.AutocompleteService | null =
		null;
	private placesService: google.maps.places.PlacesService | null = null;
	private initializationPromise: Promise<void>;

	constructor() {
		this.initializationPromise = loadGoogleMapsApi().then(() => {
			this.autocompleteService =
				new window.google.maps.places.AutocompleteService();
			const dummyDiv = document.createElement("div");
			this.placesService = new window.google.maps.places.PlacesService(
				dummyDiv
			);
		});
	}

	private async ensureInitialized(): Promise<void> {
		await this.initializationPromise;
		if (!this.autocompleteService || !this.placesService) {
			throw new Error("Google Maps services could not be initialized.");
		}
	}

	async getPlacePredictions(input: string): Promise<GooglePlacePrediction[]> {
		await this.ensureInitialized();
		if (!input) {
			return [];
		}

		return new Promise((resolve, reject) => {
			const center = new window.google.maps.LatLng(-26.2041, 28.0473);
			const radius = 500000;
			this.autocompleteService!.getPlacePredictions(
				{
					input,
					location: center,
					radius: radius,
					componentRestrictions: { country: "za" },
				},
				(predictions, status) => {
					if (
						status ===
							window.google.maps.places.PlacesServiceStatus.OK &&
						predictions
					) {
						const formattedPredictions: GooglePlacePrediction[] =
							predictions.map((p) => ({
								description: p.description,
								place_id: p.place_id,
								structured_formatting: {
									main_text:
										p.structured_formatting.main_text,
									secondary_text:
										p.structured_formatting.secondary_text,
								},
							}));
						resolve(formattedPredictions);
					} else if (
						status ===
						window.google.maps.places.PlacesServiceStatus
							.ZERO_RESULTS
					) {
						resolve([]);
					} else {
						console.error(
							"Google Places Autocomplete API error:",
							status
						);
						reject(
							new Error(
								`Places API request failed with status: ${status}`
							)
						);
					}
				}
			);
		});
	}

	async getPlaceDetails(place_id: string): Promise<Partial<Address> | null> {
		await this.ensureInitialized();

		return new Promise((resolve, reject) => {
			const request = {
				placeId: place_id,
				fields: ["address_component", "geometry", "place_id"],
			};

			this.placesService!.getDetails(request, (place, status) => {
				if (
					status ===
						window.google.maps.places.PlacesServiceStatus.OK &&
					place
				) {
					const addressComponents = place.address_components || [];
					const getComponent = (type: string) =>
						addressComponents.find((c) => c.types.includes(type))
							?.long_name || "";

					const address: Partial<Address> = {
						address_line1: `${getComponent(
							"street_number"
						)} ${getComponent("route")}`.trim(),
						address_line2:
							getComponent("sublocality_level_1") ||
							getComponent("neighborhood"),
						city:
							getComponent("locality") ||
							getComponent("postal_town"),
						province: getComponent("administrative_area_level_1"),
						postal_code: getComponent("postal_code"),
						country: getComponent("country"),
						latitude: place.geometry?.location?.lat(),
						longitude: place.geometry?.location?.lng(),
						place_id: place.place_id,
					};
					resolve(address);
				} else {
					console.error("Google Place Details API error:", status);
					reject(
						new Error(
							`Place Details request failed with status: ${status}`
						)
					);
				}
			});
		});
	}
}

export const googleMapsService = new GoogleMapsService();
