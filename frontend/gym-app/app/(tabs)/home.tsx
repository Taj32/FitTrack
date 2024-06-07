import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CartesianChart, CartesianChartRenderArg, Line } from "victory-native";
import { ReactNode } from 'react';
import { BicepEmoji } from '@/components/BicepEmoji';
import { useFont } from "@shopify/react-native-skia";
import inter from '@/assets/fonts/SpaceMono-Regular.ttf'; //frontend/gym-app/assets/fonts/inter-medium.ttf
//  @/assets/fonts/inter-medium.ttf

const DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
  }));

export default function HomeScreen() {
    const font = useFont(inter, 8);
    return (

        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/running-man.png')} 
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Hello, Taj..</ThemedText>
                <BicepEmoji/>
            </ThemedView>

            <View style={styles.chart}>
                <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]} domain={{y:[0,100]}} axisOptions={{font}}  >
                    {/* 👇 render function exposes various data, such as points. */}
                    {({ points }) => (
                    // 👇 and we'll use the Line component to render a line path.
                    <Line points={points.highTmp} color="red" strokeWidth={3} curveType='natural' animate={{ type: "timing", duration: 300 }} />
                    )}
                </CartesianChart>
            </View>

            <View style={{ height: 200 }}>
                <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]}>
                    {/* 👇 render function exposes various data, such as points. */}
                    {({ points }) => (
                    // 👇 and we'll use the Line component to render a line path.
                    <Line points={points.highTmp} color="purple" strokeWidth={3}  />
                    )}
                </CartesianChart>
            </View>

            <View style={{ height: 200 }}>
                <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]}>
                    {/* 👇 render function exposes various data, such as points. */}
                    {({ points }) => (
                    // 👇 and we'll use the Line component to render a line path.
                    <Line points={points.highTmp} color="blue" strokeWidth={3} />
                    )}
                </CartesianChart>
            </View>

            <ThemedView style={styles.stepContainer}>
                <ThemedText>text</ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    chart: {
        
        height: 300, 
        backgroundColor: '#f0f0f0',
        flex: 1,
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
