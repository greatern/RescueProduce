import axios from "axios";

interface DistanceResult {
	distance: {
		text: string;
		value: number;
	};
	duration: {
		text: string;
		value: number;
	};
	status: string;
}

interface DistanceMatrixResponse {
	rows: {
		elements: DistanceResult[];
	}[];
	status: string;
}

interface Coordinates {
	lat: number;
	lng: number;
}

class MapUtils {
	private api_key: string | null = process.env.GOOGLE_MAPS_API_KEY ?? null;
	calculateDistance = async (
		origin: Coordinates,
		destination: Coordinates
	): Promise<{ distance: number; duration: number } | null> => {
		try {
			if (!this.api_key) {
				throw new Error("Google maps api key not found");
			}

			const originCoords = `${origin.lat},${origin.lng}`;
			const destCoords = `${destination.lat},${destination.lng}`;

			const response = await axios.get<DistanceMatrixResponse>(
				"https://maps.googleapis.com/maps/api/distancematrix/json",
				{
					params: {
						origins: originCoords,
						destinations: destCoords, // Fixed: was "destination"
						units: "metric",
						mode: "driving",
						key: this.api_key,
					},
				}
			);

			const result = response.data.rows[0]?.elements[0];

			if (result?.status === "OK") {
				return {
					distance: result.distance.value,
					duration: result.duration.value,
				};
			}

			return null;
		} catch (error) {
			console.error("Error calculating distance:", error);
			return null;
		}
	};

	metersToKm = (meters: number) => {
		return Math.round(meters / 1000);
	};

	secondsToMinutes = (secs: number) => {
		return Math.round(secs / 60);
	};
}

export const mapUtils = new MapUtils();
