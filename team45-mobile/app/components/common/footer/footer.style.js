import { StyleSheet } from "react-native";
import { COLORS,SIZES } from "../../../constants";

const Style= StyleSheet.create({
 container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  linkContainer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.small,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
    marginBottom: SIZES.small / 2,
  },
  linkText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
})

export default Style