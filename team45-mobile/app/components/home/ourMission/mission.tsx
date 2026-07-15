import React from 'react'
import { View, Text, StyleSheet,Pressable } from 'react-native';
import { COLORS, SIZES } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';

import styles from './mission.style'

const Mission = () => {
  return (
     <View style={styles.container}>
      <Ionicons name="earth" size={40} color={COLORS.primary} />
      <Text style={styles.title}>Our Mission</Text>
      <Text style={styles.description}>
        At RescueProduce,

       our mission is to combat food waste and hunger
       in South Africa by creating an inclusive, 
       transparent, and technology-driven platform that connects food donors, NGOs, volunteers, and communities in real-time. We strive to reduce environmental impact, foster community engagement, and ensure equitable access to nutritious food through efficient, 
       scalable, and accountable food redistribution systems.
      </Text>
      <Pressable 
        style={styles.button}
        onPress={() => console.log('Learn More')}
      >
        <Text style={{color: 'white' }}>donate with us</Text>
      </Pressable>
    </View>
  );
}

export default Mission