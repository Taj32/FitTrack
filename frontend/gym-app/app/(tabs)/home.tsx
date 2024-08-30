import { Image, StyleSheet, Platform, View, TouchableOpacity, Text, ScrollView, useWindowDimensions, Dimensions, ActivityIndicator } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CartesianChart, CartesianChartRenderArg, Line } from "victory-native";
import { LineChart } from "react-native-gifted-charts";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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

// types
type WorkoutDate = string;



export default function HomeScreen() {
    const font = useFont(inter, 8);
    const ref = useRef(null)
    const width = Dimensions.get('window').width //window').width;

    const [selected, setSelected] = useState('');
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [benchPressData, setBenchPressData] = useState([]);
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [workoutDates, setWorkoutDates] = useState<WorkoutDate[]>([]);
    const [groupedStreaks, setGroupedStreaks] = useState<string[][]>([]);
    const [isCalendarLoading, setIsCalendarLoading] = useState(true);


    useEffect(() => {
        const fetchDataAndGroupDates = async () => {
            try {
                await fetchUserName();
                await fetchRecentWorkouts();
                await fetchWorkouts();
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchDataAndGroupDates();
    }, []);
    
    useEffect(() => {
        if (workoutDates.length > 0) {
            const grouped = groupDatesIntoStreaks(workoutDates);
            setGroupedStreaks(grouped);
            console.log('Grouped:', grouped);
            console.log("groupedStreaks: ", groupedStreaks);
            console.log("workoutdates: ", workoutDates);
        }
    }, [workoutDates]);

const fetchUserName = async () => {
    try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
        }
    } catch (error) {
        console.error('Error fetching user name:', error);
    } 
};

const fetchWorkouts = async () => {
    try {
        const userToken = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/workouts/user-workouts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response:', JSON.stringify(data, null, 2));

        if (!Array.isArray(data)) {
            console.error('API response is not an array:', data);
            return;
        }

        const workoutDates = data.map((workout: any) => workout.date_created as string);
        const uniqueSortedDates = [...new Set(workoutDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        console.log('Workout dates:', uniqueSortedDates);
        setWorkoutDates(prevDates => {
            console.log("Setting workout dates:", uniqueSortedDates);
            return uniqueSortedDates;
        });
    } catch (error) {
        console.error('Error fetching workouts:', error);
    }
};

const fetchRecentWorkouts = async () => {

    try {
        
        const token = await AsyncStorage.getItem('userToken');
        console.log("token: ", token );
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
        //console.log("done loading!");
        //setIsLoading(false);
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

const formatStreaks = (streaks: string[][]) => {
    const markedDates = {};

    streaks.forEach(streak => {
        if (streak.length === 1) {
            // Singleton array
            markedDates[streak[0]] = { marked: true, dotColor: '#ffa368' };
        } else {
            // Non-singleton array
            streak.forEach((date, index) => {
                if (index === 0) {
                    markedDates[date] = { startingDay: true, color: '#ffa368', dotColor: '#50cebb' };
                } else if (index === streak.length - 1) {
                    markedDates[date] = { endingDay: true, color: '#ffa368' };
                } else {
                    markedDates[date] = { selected: true, color: '#ffa368' };
                }
            });
        }
    });

    return markedDates;
};

const markedDates = useMemo(() => {
    return formatStreaks(groupedStreaks);
}, [groupedStreaks]);

// if (isLoading) {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <ActivityIndicator size="large" color="0000ff" />
//         </View>
//     );
// }

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
        title: 'Average Weight',
        img: require('@/assets/images/running-man.png'),
        color: '#177AD5',
    },
    {
        id: 'item-2',
        title: 'Average steps',
        img: require('@/assets/images/heart.png'),
        color: '#FF6700',
    },
    // Add more items as needed
];

const scrollX = useSharedValue(0);
const onScrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
});

const WorkoutChart = ({ workout }) => {
    console.log("[Making workout chart....]");
    ///console.log("Received workout:", JSON.stringify(workout, null, 2));

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

    console.log("Finished making chart!");
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
                        {/* /* , workout.exercise_name */}
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

function groupDatesIntoStreaks(dates: string[]): string[][] {
    if (dates.length === 0) return [];

    const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const streaks: string[][] = [];
    let currentStreak: string[] = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);

        // Check if the current date is one day after the previous date
        if (currentDate.getTime() - previousDate.getTime() === 86400000) {
            currentStreak.push(sortedDates[i]);
        } else {
            streaks.push(currentStreak);
            currentStreak = [sortedDates[i]];
        }
    }

    streaks.push(currentStreak);

    return streaks;
}

//const markedDates = formatStreaks(groupedStreaks);
//console.log("groupedStreaks", groupedStreaks);
//console.log("markedDates: ", markedDates);

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
                borderColor: 'gray',
                height: 380,
                borderRadius: 30,
            }}
            onDayPress={day => {
                setSelected(day.dateString);
            }}

            markingType={'period'}
            markedDates={markedDates}
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

        <View >
            <StatusBar style="auto" />
            <Animated.FlatList
                horizontal
                onScroll={onScrollHandler}
                data={items}

                keyExtractor={(item) => item.id}
                pagingEnabled={true}
                renderItem={({ item, index }) => {
                    return <CarouselItem info={item} index={index} scrollX={scrollX} />;
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


