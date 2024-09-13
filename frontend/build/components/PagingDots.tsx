// ./PagingDots.tsx
import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import ScalingDot from '@/components/ScalingDot';

type Props = {
    data: Array<Object>;
    scrollX: SharedValue<number>;
    dotStyle?: ViewStyle;
    inActiveDotOpacity?: number;
    inActiveDotColor?: string;
    activeDotScale?: number;
    activeDotColor?: string;
    style?: StyleProp<ViewStyle>;
  };
  
  const PagingDots = ({ data, style, ...rest }: Props) => {
    return (
      <View style={[styles.container, style]}>
        {data.map((_, index) => {
          return <ScalingDot key={`dot-${index}`} index={index} {...rest} />;
        })}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 20,
      flexDirection: 'row',
      alignSelf: 'center',
    },
  });
  
  export type { Props as ScalingDotProps };
  
  export default PagingDots;