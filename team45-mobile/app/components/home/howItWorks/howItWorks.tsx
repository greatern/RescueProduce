import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SIZES, icons, images } from '../../../constants';
import Styles from './HowitWorks.style';


interface Step {
  icon: keyof typeof icons; 
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: 'search', // Must match a key in your icons.js
    title: 'Discover',
    description: 'Browse nearby food rescue opportunities.',
  },
  {
    icon: 'location',
    title: 'Locate',
    description: 'Find collection points near you.',
  },
  {
    icon: 'heartOutline',
    title: 'Collect',
    description: 'Pick up surplus food to redistribute.',
  },
];

const HowItWorks = () => {
  return (
    <View style={Styles.container}>
      {/* Hero Image */}
      <Image 
        source={images.hero2}
        style={Styles.heroImage}
        resizeMode="cover"
      />

      <Text style={Styles.sectionTitle}>How It Works</Text>

      {steps.map((step, index) => (
        <View key={index} style={Styles.stepContainer}>
          <Image 
            source={icons[step.icon]} // Type-safe icon access
            style={Styles.icon}
            resizeMode="contain"
          />
          <View style={Styles.textContainer}>
            <Text style={Styles.stepTitle}>{step.title}</Text>
            <Text style={Styles.stepDescription}>{step.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};


export default HowItWorks;