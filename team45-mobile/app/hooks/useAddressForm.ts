import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../service/user";

export interface AddressFormData {
	place_id: string;
	address_line1: string;
	address_line2: string;
	city: string;
	province: string;
	postal_code: string;
	country: string;
}

export type AddressFormErrors = {
	[K in keyof AddressFormData]?: string;
};

interface UseAddressFormProps {
	initialData?: Partial<AddressFormData>;
	onSuccess: () => void;
	onError?: (error: string) => void;
}

interface UseAddressFormReturn {
	formData: AddressFormData;
	errors: AddressErrors;
	isLoading: boolean;
	isSaving: boolean;
	updateField: (field: keyof AddressFormData, value: string) => void;
	updateFormData: (data: Partial<AddressFormData>) => void;
	validateForm: () => boolean;
	saveAddress: (latitude: number, longitude: number) => Promise<boolean>;
	resetForm: () => void;
	clearErrors: () => void;
}

const initialFormData: AddressFormData = {
	place_id: "",
	address_line1: "",
	address_line2: "",
	city: "",
	postal_code: "",
	province: "",
	country: "",
};

export const useAddressForm = ({
	initialData = {},
	onSuccess,
	onError,
}: UseAddressFormProps): UseAddressFormReturn => {
	const { user } = useAuth();
	const [errors, setErrors] = useState<AddressFormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<AddressFormData>({
		...initialFormData,
		...initialData,
	});

	const updateField = useCallback(
		(field: keyof AddressFormData, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));

			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: undefined }));
			}
		},
		[errors]
	);

	const updateFormData = useCallback((data: Partial<AddressFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	}, []);

	const validateForm = useCallback(() => {
		const newErrors: Partial<AddressFormData> = {};

		if (!formData.address_line1.trim())
			newErrors.address_line1 = "Street address is required";

		if (!formData.address_line2.trim())
			newErrors.address_line2 = "Suburb is required";

		if (!formData.city.trim()) newErrors.city = "city is required";

		if (!formData.province.trim())
			newErrors.province = "Province is required";

		if (!formData.country.trim())
			newErrors.country = "Country is required.";

		if (
			!formData.postal_code.trim() ||
			(formData.postal_code &&
				!/^\d{4-5}$/.test(formData.postal_code.trim()))
		)
			newErrors.postal_code = "Please enter a valid postal code.";

		return Object.keys(newErrors).length === 0;
	}, []);

	const saveAddress = useCallback(
		async (latitude: number, longitude: number): Promise<boolean> => {
			if (!user?.id) {
				onError?.("User not authenticated");
				return false;
			}
			if (!validateForm()) return false;

			setIsSaving(true);

			try {
				const addressReq = {
					...formData,
					user_id: user.id,
					latitude,
					longitude,
				};

				const response = await userApi.addAddress(addressReq);
				if (response.status === "success") {
					onSuccess?.();
					return true;
				} else {
					throw new Error(
						response.message || "Failed to save address"
					);
				}
				return false;
			} catch (error) {
				const errorMsg =
					error instanceof Error
						? error.message
						: "Could not save address. please try again";
				onError?.(errorMsg);
				return false;
			} finally {
				setIsSaving(false);
			}
		},
		[user, formData, validateForm, onSuccess, onError]
	);

	const resetForm = useCallback(() => {
		setFormData({ ...initialFormData, ...initialData });
		setErrors({});
	}, [initialData]);

	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	return {
		formData,
		errors,
		isLoading,
		isSaving,
		updateField,
		updateFormData,
		validateForm,
		saveAddress,
		resetForm,
		clearErrors,
	};
};
