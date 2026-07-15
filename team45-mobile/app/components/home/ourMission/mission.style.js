import { StyleSheet } from "react-native";

import { FONT, SIZES, COLORS } from "../../../constants";

const styles = StyleSheet.create({
  container: {
     marginTop: 240,
    padding: SIZES.large,
    backgroundColor: COLORS.lightWhite,
    marginVertical: SIZES.medium,
    borderRadius: SIZES.small,
    elevation: 3, // Android 
    shadowColor: COLORS.gray, // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  description: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 24, 
  },
  button: {
  backgroundColor: 'orange',
  padding: SIZES.small,
  borderRadius: SIZES.small,
  marginTop: SIZES.medium,
  alignSelf: 'flex-start',
},
buttonText: {
  color: COLORS.white,
  fontWeight: 'bold',
},
});

export default styles;
