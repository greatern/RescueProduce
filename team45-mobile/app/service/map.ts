import { externalApiClient } from "./api";

type Location = {
	lat: number;
	lng: number;
};

type Geometry = {
	location: Location;
};

export interface Region {
	latitude: number;
	longitude: number;
	latitudeDelta: number;
	longitudeDelta: number;
}

export interface Prediction {
	description: string;
	place_id: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

export interface PlaceDetails {
	result: {
		geometry: Geometry;
		formatted_address: string;
		address_components: AddressComponent[];
	};
}

interface AutoCompeleteResponse {
	predictions: Prediction[];
	status: string;
}

class MapApi {
	private API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

	async getPredictions(
		search_text: string
	): Promise<AutoCompeleteResponse | undefined> {
		try {
			const response = await externalApiClient.get<AutoCompeleteResponse>(
				`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
					search_text
				)}&key=${this.API_KEY}&components=country:za`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching predictions:", error);
			throw new Error("Error fetching suggestions", { cause: error });
		}
	}

	async placeSelect(placeId: string): Promise<PlaceDetails | undefined> {
		try {
			const response = await externalApiClient.get<PlaceDetails>(
				`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.API_KEY}`
			);

			return {
				result: response.data.result,
			};
		} catch (error) {
			console.error("Error selecting a place:", error);
			throw new Error("Error selecting a place:", { cause: error });
		}
	}
}

export const mapApi = new MapApi();