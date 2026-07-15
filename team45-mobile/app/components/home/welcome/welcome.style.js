import { Dimensions, StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  hero:{
  width: '110%',
  height: '250%',
  resizeMode:'cover',
  marginBottom: SIZES.xxLarge,
  
  },

  container: {
    height:300,
  width: '100%', 
  alignItems: 'center',
  position: 'relative',
  },

  title: {
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.xxLarge,
  },
  textOverlay: {
    position: 'absolute',
    justifyContent: 'center',  
    alignItems: 'center',     
  },
   button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default styles;