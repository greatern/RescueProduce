const COLORS = {
	primary: "#353c32ff",
	secondary: "#b6eb70ff",
	tertiary: "#fbe332ff",

	gray: "#83829A",
	gray2: "#C1C0C8",
	lightGray: "#5d5d6cff",

	white: "#F3F4F8",
	lightWhite: "#FAFAFC",
	green: "#22ed29ff",
	orange: "#eebd1fff",

	black: "#000",

	error: "#780505ff",
	success: "#14f10cff",
};

const FONT = {
	regular: "DMRegular",
	medium: "DMMedium",
	bold: "DMBold",
};

const SIZES = {
	xxSmall: 8,
	xSmall: 10,
	small: 12,
	medium: 16,
	large: 20,
	xLarge: 24,
	xxLarge: 32,
};

const SHADOWS = {
	small: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 2,
	},
	medium: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 5.84,
		elevation: 5,
	},
};

export { COLORS, FONT, SIZES, SHADOWS };
