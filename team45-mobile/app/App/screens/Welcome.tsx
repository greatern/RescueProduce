import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';

interface WelcomeProps {
  mission?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ mission }) => {
  return (
    <ImageBackground
      source={require('../assets/icon.png')} 
      style={styles.heroImage}
      resizeMode="cover"
    >
      <View style={styles.textContainer}>
        <Text style={styles.heroText}>
          {mission || 'Welcome to My App'}
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  heroImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
  },
  heroText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Welcome;