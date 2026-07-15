import { COLORS } from "./theme";

interface StatusInfo {
	color: string;
	text: string;
}

export enum Status {
	CLAIM_STATUS_READY = "ready",
	CLAIM_STATUS_PENDING = "pending",
	CLAIM_STATUS_EN_ROUTE = "en_route",
	CLAIM_STATUS_COMPLETED = "completed",
	CLAIM_STATUS_CONFIRMED = "confirmed",
	CLAIM_STATUS_COLLECTED = "collected",
	CLAIM_STATUS_CANCELLED = "cancelled",
}

export const STATUS_MAP: { [key: string]: StatusInfo } = {
	[Status.CLAIM_STATUS_READY]: { color: "#ff4444", text: "Ready to collect" },
	[Status.CLAIM_STATUS_PENDING]: {
		color: "#FFA500",
		text: "Pending Confirmation",
	},
	[Status.CLAIM_STATUS_EN_ROUTE]: { color: "#007AFF", text: "On the way" },
	[Status.CLAIM_STATUS_CONFIRMED]: {
		color: "#007AFF",
		text: "Delivery Confirmed",
	},
	[Status.CLAIM_STATUS_CANCELLED]: { color: "#ff4444", text: "Cancelled" },
	[Status.CLAIM_STATUS_COMPLETED]: {
		color: "#ff6a00ff",
		text: "Delivery Completed",
	},
	[Status.CLAIM_STATUS_COLLECTED]: { color: "#0e772cff", text: "Collected" },
	default: { color: COLORS.gray, text: "Unknown" },
};
