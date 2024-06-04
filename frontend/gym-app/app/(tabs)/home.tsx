import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CartesianChart, CartesianChartRenderArg, Line } from "victory-native";
import { ReactNode } from 'react';

const DATA = Array.from({ length: 31 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
  }));

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Hello, Taj</ThemedText>
                <HelloWave />
            </ThemedView>

            <View style={{ height: 300 }}>
                <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]}>
                    {/* 👇 render function exposes various data, such as points. */}
                    {({ points }) => (
                    // 👇 and we'll use the Line component to render a line path.
                    <Line points={points.highTmp} color="red" strokeWidth={3} />
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
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
