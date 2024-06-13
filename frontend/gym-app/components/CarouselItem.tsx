import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { BarChart, LineChart } from 'react-native-gifted-charts';

type Props = {
  item: {
    id: string;
    title: string;
    img: any;
  };
  index: number;
  scrollX: Animated.SharedValue<number>;
};
const { width } = Dimensions.get('window');

const data = [{ value: 15, label: '6/9' },
  { value: 10, label: '6/10' },
  { value: 20, label: '6/11' },
  { value: 25, label: '6/12' },
  { value: 30, label: '6/13' },
  { value: 70, label: '6/14' },
  { value: 100, label: '6/15' },

  { value: 15, label: '6/16' },
  { value: 10, label: '6/17' },
  { value: 20, label: '6/18' },
  { value: 25, label: '6/19' },
  { value: 30, label: '6/20' },
  { value: 70, label: '6/21' },
  { value: 100, label: '6/22' },

  { value: 15, label: '6/23' },
  { value: 10, label: '6/24' },
  { value: 20, label: '6/25' },
  { value: 25, label: '6/26' },
  { value: 30, label: '6/27' },
  { value: 70, label: '6/28' },
  { value: 100, label: '6/29' },
  { value: 100, label: '6/30' },

  ];

  const options = ["Week", "Month", "6 Months", "Year"]



const CarouselItem = ({ item, index, scrollX }: Props) => {
  const rnStyle = useAnimatedStyle(() => {
    return {
      //get the previous and next item on the view of the active item, only a little bit
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [-width * 0.15, 0, width * 0.15],
            'clamp'
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.9, 1, 0.9],
            'clamp'
          ),
        },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        { width, height: 300, justifyContent: 'left', alignItems: 'center' },
        rnStyle,
      ]}
      key={item.id}
    >
      {/* <Image
        source={item.img}
        style={{
          width: '85%',
          height: '100%',
        }}
        resizeMode="cover"
      /> */}

      <View style={[styles.scrollChart, { marginRight: 0 }]}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <BarChart
          data={data}
          isAnimated
          height={150}
          showTextOnFocus
          animateOnDataChange
          color={item.color}
        />
        
        <View style={{ flexDirection: 'row', marginLeft: 30, marginTop: 5, }}>
          {options.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 6,
                  margin: 4,
                  backgroundColor: '#98FB98',
                  borderRadius: 8,
                }}
                onPress={() => showOrHidePointer(index)}>
                <Text>{options[index]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* <Text>{item.title}</Text> */}
    </Animated.View>
  );
};

export default CarouselItem;

const styles = StyleSheet.create({
  scrollChart: {
    rowGap: 10,
    borderRadius: 30,
    padding: 16,
    height: 300,
    width: 300,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginLeft: -35
  },
});