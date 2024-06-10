import { Image, StyleSheet, Platform, View, TouchableOpacity, Text} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CartesianChart, CartesianChartRenderArg, Line } from "victory-native";
import { LineChart } from "react-native-gifted-charts";
import { ReactNode, useRef } from 'react';
import { BicepEmoji } from '@/components/BicepEmoji';
import { useFont } from "@shopify/react-native-skia";

import inter from '@/assets/fonts/SpaceMono-Regular.ttf'; //frontend/gym-app/assets/fonts/inter-medium.ttf
import { red } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
//  @/assets/fonts/inter-medium.ttf

const DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
}));




export default function HomeScreen() {
    const font = useFont(inter, 8);
    const ref = useRef(null)

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

    const showOrHidePointer = (ind) => {
        ref.current?.scrollTo({
            x: ind * 400 - 25
        }); // adjust as per your UI
    };

    return (

        <ParallaxScrollView

            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/running-man.png')}
                    style={styles.reactLogo}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Hello, Taj..</ThemedText>
                <BicepEmoji />
            </ThemedView>


            <View style={styles.chart}>
                <ThemedText type="subtitle">Bench Press</ThemedText>
                <LineChart
                    data={data}
                    curved
                    isAnimated
                    height={150}
                    focusEnabled
                    showTextOnFocus
                    animateOnDataChange
                    color={'orange'}
                    scrollRef={ref}
                />
                <View style={{ flexDirection: 'row', marginLeft: 30, marginTop: 5, }}>
                    {options.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={{
                                    padding: 6,
                                    margin: 4,
                                    backgroundColor: 'orange',
                                    borderRadius: 8,
                                }}
                                onPress={() => showOrHidePointer(index)}>
                                <Text>{options[index]}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.chart}>
                <ThemedText type="subtitle">Deadlift</ThemedText>
                <LineChart
                    data={data}
                    curved
                    isAnimated
                    height={150}
                    focusEnabled
                    showTextOnFocus
                    animateOnDataChange
                    color={'#C8A2C8'}
                    
                />
                <View style={{ flexDirection: 'row', marginLeft: 30, marginTop: 5, }}>
                    {options.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={{
                                    padding: 6,
                                    margin: 4,
                                    backgroundColor: '#C8A2C8',
                                    borderRadius: 8,
                                }}
                                onPress={() => showOrHidePointer(index)}>
                                <Text>{options[index]}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.chart}>
                <ThemedText type="subtitle">Squat</ThemedText>
                <LineChart
                    data={data}
                    curved
                    isAnimated
                    height={150}
                    focusEnabled
                    showTextOnFocus
                    animateOnDataChange
                    color={'#98FB98'}
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

            <ThemedView style={styles.stepContainer}>
                <ThemedText>texttext</ThemedText>
            </ThemedView>



        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    parallax: {
        backgroundColor: '#f0f0f0',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        gap: 8,
        paddingTop: 10,
        margin: 0,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    chart: {
        rowGap: 10,
        borderRadius: 30,
        padding: 16,
        height: 300,
        backgroundColor: 'white',
        overflow: 'hidden',
        //flex: 1, //'white',//
    },
    reactLogo: {
        height: 190,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    emoji: {
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
    },
});
