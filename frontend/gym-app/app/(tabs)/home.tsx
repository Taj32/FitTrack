import { Image, StyleSheet, Platform, View, TouchableOpacity, Text, ScrollView, useWindowDimensions, Dimensions, ActivityIndicator } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CartesianChart, CartesianChartRenderArg, Line } from "victory-native";
import { LineChart } from "react-native-gifted-charts";
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { BicepEmoji } from '@/components/BicepEmoji';
import { useFont } from "@shopify/react-native-skia";

import inter from '@/assets/fonts/SpaceMono-Regular.ttf'; //frontend/gym-app/assets/fonts/inter-medium.ttf
import { red } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
//  @/assets/fonts/inter-medium.ttf
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import CarouselItem from '@/components/CarouselItem';

import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';




const DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
}));

const API_URL = 'http://192.168.1.205:5000';


export default function HomeScreen() {
    const font = useFont(inter, 8);
    const ref = useRef(null)
    const width = Dimensions.get('window').width //window').width;

    const [selected, setSelected] = useState('');
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [benchPressData, setBenchPressData] = useState([]);
    const [recentWorkouts, setRecentWorkouts] = useState([]);






    useEffect(() => {
        fetchUserName();
        //fetchExerciseData('Bench Press').then(setBenchPressData);
        fetchRecentWorkouts();

    }, []);

    const fetchExerciseData = async (exerciseName: any) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/exercises/get?exercise_name=${exerciseName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch exercise data');
            }
            const data = await response.json();
            return data.map(item => ({
                value: item.weight,
                label: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
            }));
        } catch (error) {
            console.error('Error fetching exercise data:', error);
            return [];
        }
    };

    const fetchUserName = async () => {
        try {
            const storedName = await AsyncStorage.getItem('userName');
            if (storedName) {
                setUserName(storedName);
            }
        } catch (error) {
            console.error('Error fetching user name:', error);
        } finally {
            //setIsLoading(false);
        }
    };

    const fetchRecentWorkouts = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/exercises/recent`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch recent workouts');
            }
            const data = await response.json();
            setRecentWorkouts(data);
        } catch (error) {
            console.error('Error fetching recent workouts:', error);
        } finally {
            console.log("done loading!");
            setIsLoading(false);
        }
    };

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

    const showOrHidePointer = (index: number) => {
        const currentDate = new Date();
        let startDate;

        switch (index) {
            case 0: // Week
                startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 1: // Month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                break;
            case 2: // 6 Months
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                break;
            case 3: // Year
                startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                startDate = new Date(0); // Show all data
        }

        const filteredData = benchPressData.filter(item => {
            const itemDate = new Date(item.label);
            return itemDate >= startDate && itemDate <= currentDate;
        });

        setBenchPressData(filteredData);
    };

    const items = [
        {
            id: 'item-1',
            title: 'weight',
            img: require('@/assets/images/running-man.png'),
            color: 'blue',
        },
        {
            id: 'item-2',
            title: 'steps',
            img: require('@/assets/images/heart.png'),
            color: 'red',
        },
        // Add more items as needed
    ];

    const scrollX = useSharedValue(0);
    const onScrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const WorkoutChart = ({ workout }) => {
        console.log("--------")
        console.log("Received workout:", JSON.stringify(workout, null, 2));

        if (!workout || !workout.data || workout.data.length === 0) {
            return null;
        }

        // Check if all data points are valid
        // Transform and ensure all data points are valid
        const transformedData = workout.data.map(item => {
            if (typeof item !== 'object' || item === null) {
                console.warn('Invalid data item:', item);
                return null;
            }
            return {
                value: typeof item.value === 'number' ? item.value : 0,
                label: new Date(item.label).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
            };
        }).filter(Boolean); // Remove any null items

        if (transformedData.length === 0) {
            console.log("No valid data points in workout");
            return null;
        }

        console.log(transformedData);
        // Remove the last element
        //const dataWithoutLast = transformedData.slice(0, -1);
       // console.log('Transformed data for LineChart (without last):', dataWithoutLast);


        const dataTemp = [
            { value: 15, label: 'Mon' },
            { value: 30, label: 'Tue' },
            { value: -23, label: 'Wed' },
            { value: 40, label: 'Thu' },
            { value: -16, label: 'Fri' },
            { value: 40, label: 'Sat' },
        ];


        return (
            <View style={styles.chart}>
                <ThemedText type="subtitle">{workout.exercise_name}</ThemedText>
                <LineChart
                    data={transformedData}
                    curved
                    isAnimated
                    height={150}
                    focusEnabled
                    showTextOnFocus
                    //animateOnDataChange //--> Why was this causing the error?
                    color={workout.color}
                />

                <View style={{ flexDirection: 'row', marginLeft: 30, marginTop: 5 }}>
                    {options.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                padding: 6,
                                margin: 4,
                                backgroundColor: workout.color,
                                borderRadius: 8,
                            }}
                            onPress={() => showOrHidePointer(index)}>
                            {/* /* , workout.exercise_name */ }
                            <Text>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

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
                <ThemedText type="title">Hello, {userName || 'User'}...</ThemedText>
                <BicepEmoji />
            </ThemedView>


            <Calendar
                style={{
                    //borderWidth: 1,
                    borderColor: 'gray',
                    height: 380,
                    borderRadius: 30,
                }}
                onDayPress={day => {
                    setSelected(day.dateString);
                }}

                markingType={'period'}
                markedDates={{
                    //'2024-06-10': { textColor: 'green' },
                    '2024-06-11': { startingDay: true, color: '#33B3A6', dotColor: '#50cebb' },
                    '2024-06-12': { selected: true, color: '#39C9BB', dotColor: '#50cebb' },
                    '2024-06-13': { selected: true, color: '#39C9BB' },
                    '2024-06-14': { disabled: true, color: '#33B3A6', endingDay: true }
                }}
            >

            </Calendar>

            <View
                style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: 1,
                }}
            />

            {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout, index) => (
                    <WorkoutChart key={index} workout={workout} />
                ))
            ) : (
                <ThemedView style={styles.noWorkoutsContainer}>
                    <ThemedText style={styles.noWorkoutsText}>
                        Start your fitness journey by adding your workouts!
                    </ThemedText>
                </ThemedView>
            )}

            {/* <ThemedView style={styles.stepContainer}>
                <ThemedText>texttext</ThemedText>
            </ThemedView> */}



            <View >
                <StatusBar style="auto" />
                <Animated.FlatList
                    horizontal
                    onScroll={onScrollHandler}
                    data={items}
                    keyExtractor={(item) => item.id}
                    pagingEnabled={true}
                    renderItem={({ item, index }) => {
                        return <CarouselItem item={item} index={index} scrollX={scrollX} />;
                    }}
                    //decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                />

            </View>


        </ParallaxScrollView >
    );
}

const styles = StyleSheet.create({
    parallax: {
        backgroundColor: '#f2f1f6',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f1f6',
        gap: 8,
        paddingTop: 10,
        paddingBottom: 10,
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
    scrollChart: {
        rowGap: 10,
        borderRadius: 30,
        padding: 16,
        height: 300,
        width: 300,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    scroll: {
        marginLeft: 30,
    },
    carousel: {
        height: 300,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    calendar: {
        color: 'red',
    },
    noWorkoutsContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    noWorkoutsText: {
        textAlign: 'center',
        fontSize: 18,
    },
});
function setIsLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}

