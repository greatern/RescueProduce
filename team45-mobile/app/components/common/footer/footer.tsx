import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES, icons } from '../../../constants';
import { useRouter } from 'expo-router';
import Style from '../footer/footer.style'
const Footer = () => {
  const router = useRouter();

  const footerLinks = [
    {
      icon: 'filter',
      label: 'Home',
      onPress: () => router.push('/'),
    },
    {
      icon: 'search',
      label: 'Discover',
      onPress: () => router.push('/discover'),
    },
    {
      icon: 'heartOutline',
      label: 'Saved',
      onPress: () => router.push('/saved'),
    },
    {
      icon: 'profile',
      label: 'Profile',
      onPress: () => router.push('/profile'),
    },
  ];

  return (
    <View style={Style.container}>
      {footerLinks.map((link, index) => (
        <Pressable
          key={index}
          style={Style.linkContainer}
          onPress={link.onPress}
        >
          <Image
            source={icons[link.icon]}
            style={Style.icon}
            resizeMode="contain"
          />
          <Text style={Style.linkText}>{link.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};


export default Footer;