import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../../../constants";

const Styles = StyleSheet.create({
   container: {
    padding: SIZES.large,
    backgroundColor: COLORS.lightBackground,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.small,
    marginBottom: SIZES.xxLarge,
  },
  sectionTitle: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xxLarge,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xLarge,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: SIZES.medium,
    tintColor: COLORS.primary, 
  },
  textContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  stepDescription: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 24,
  },
});
export default Styles;
