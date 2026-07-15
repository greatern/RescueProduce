import { useCallback, useEffect, useState } from "react";
import { mapApi, PlaceDetails, Prediction, Region } from "../service/map";

interface UseAddressSearchProps {
	onPlaceSelect?: (address: any, region: Region) => void;
}

interface UseAddressSearchReturn {
	searchText: string;
	setSearchText: (text: string) => void;
	predictions: Prediction[];
	showSuggestions: boolean;
	setShowSuggestions: (show: boolean) => void;
	isSearching: boolean;
	searchError: string | null;
	handlePlaceSelect: (place_id: string) => Promise<void>;
	clearSearch: () => void;
}

export const useAddressSearch = ({
	onPlaceSelect,
}: UseAddressSearchProps): UseAddressSearchReturn => {
	const [searchText, setSearchText] = useState("");
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [shouldFetch, setShouldFetch] = useState(false);

	useEffect(() => {
		if (searchText.length > 2 && shouldFetch) {
			const timer = setTimeout(() => {
				fetchPredictions();
			}, 500);
			return () => clearTimeout(timer);
		} else {
			setPredictions([]);
			setShowSuggestions(false);
		}
	}, [searchText, shouldFetch]);

	useEffect(() => {
		console.log(searchText);
	}, [setSearchText]);

	const fetchPredictions = async () => {
		setIsSearching(true);
		setSearchError(null);
		try {
			const response = await mapApi.getPredictions(searchText);
			if (response?.predictions) {
				setShowSuggestions(true);
				setPredictions(response?.predictions);
			}
		} catch (error) {
			console.error("Error searching", error);
			setSearchError("Failed to search addresses, please try again");
			setPredictions([]);
		} finally {
			setIsSearching(false);
		}
	};

	const handlePlaceSelect = useCallback(
		async (place_id: string) => {
			setIsSearching(true);
			setSearchError(null);

			try {
				const response = await mapApi.placeSelect(place_id);

				if (!response?.result) {
					throw new Error("No place details found");
				}

				const result = response.result;

				const region: Region = {
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				};

				const placeDetail: PlaceDetails = { result };
				const address = parseAddressComponents(placeDetail, place_id); // Pass place_id here

				setShouldFetch(false);
				setSearchText(result.formatted_address);

				onPlaceSelect?.(address, region);
				setShowSuggestions(false);
			} catch (error) {
				console.error("Error selecting place: ", error);
				setSearchError("Failed to select address. Please try again.");
			} finally {
				setIsSearching(false);
			}
		},
		[onPlaceSelect]
	);

	const setSearchTextExternal = useCallback((text: string) => {
		setShouldFetch(true);
		setSearchText(text);
	}, []);

	const parseAddressComponents = (
		placeDetail: PlaceDetails,
		place_id: string
	) => {
		const getComponent = (types: string[]) => {
			return (
				placeDetail.result.address_components.find((comp) =>
					types.some((type: string) => comp.types.includes(type))
				)?.long_name || ""
			);
		};

		// Use address components instead of formatted address split
		return {
			place_id: place_id, // Add the place_id here
			address_line1:
				[getComponent(["street_number"]), getComponent(["route"])]
					.filter(Boolean)
					.join(" ") ||
				getComponent(["establishment"]) ||
				placeDetail.result.formatted_address.split(",")[0],
			address_line2: getComponent(["sublocality", "neighborhood"]) || "",
			city:
				getComponent(["locality", "administrative_area_level_2"]) || "",
			province: getComponent(["administrative_area_level_1"]) || "",
			postal_code: getComponent(["postal_code"]) || "",
			country: getComponent(["country"]) || "South Africa",
			latitude: placeDetail.result.geometry.location.lat,
			longitude: placeDetail.result.geometry.location.lng,
		};
	};

	const clearSearch = useCallback(() => {
		setShouldFetch(false);
		setSearchText("");
		setPredictions([]);
		setShowSuggestions(false);
		setSearchError("");
		setTimeout(() => {
			setShouldFetch(true);
		}, 100);
	}, []);

	return {
		handlePlaceSelect,
		isSearching,
		predictions,
		searchError,
		setSearchText: setSearchTextExternal,
		searchText,
		setShowSuggestions,
		showSuggestions,
		clearSearch,
	};
};
