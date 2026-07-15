import React from 'react';
import { TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import styles, {btnImg} from './screenheader.style';

interface ScreenHeaderBtnProps {
  iconUrl: ImageSourcePropType;
  dimension: string;
 onPress?: () => void;
}

const ScreenHeaderBtn = ({ iconUrl, dimension, onPress }: ScreenHeaderBtnProps) => {
  return (
    <TouchableOpacity 
      style={styles.btnContainer} 
      onPress={onPress}
    >
      <Image
        source={iconUrl}
        resizeMode="cover"
        style={btnImg(dimension)}
        />
    </TouchableOpacity>
  );
};

export default ScreenHeaderBtn;