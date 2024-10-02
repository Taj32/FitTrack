import { Image, StyleSheet, Platform, View, TouchableOpacity, Text, ScrollView, useWindowDimensions, Dimensions, ActivityIndicator, Alert } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LineChart } from "react-native-gifted-charts";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { BicepEmoji } from '@/components/BicepEmoji';
import { useFont } from "@shopify/react-native-skia";
import inter from '@/public/fonts/SpaceMono-Regular.ttf'; //frontend/gym-app/public/fonts/inter-medium.ttf
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';
import { Modal } from 'react-native';

const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';

// types
type WorkoutDate = string;

export default function HomeScreen() {

    const [selected, setSelected] = useState('');
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [workoutDates, setWorkoutDates] = useState<WorkoutDate[]>([]);
    const [groupedStreaks, setGroupedStreaks] = useState<string[][]>([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
    const [chartStates, setChartStates] = useState({});
    const [showImageUploadModal, setShowImageUploadModal] = useState(false);

    
    const generateUniqueColors = (count) => {
        const goldenRatio = 0.618033988749895;
        const saturation = 0.75; // Lowered saturation for softer colors
        const lightness = 0.6; // Increased lightness for pastel shades

        return Array.from({ length: count }, (_, i) => {
            const hue = (i * goldenRatio * 360) % 360;
            return `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`;
        });
    };

    const workoutColors = useMemo(() => {
        return generateUniqueColors(recentWorkouts.length);
    }, [recentWorkouts.length]);

    useEffect(() => {
        // Initialize chart states
        const initialChartStates = recentWorkouts.reduce((acc, workout, index) => {
            acc[index] = {
                timeFrame: 'all',
                filteredData: workout.data,
                color: workoutColors[index]
            };
            return acc;
        }, {});
        setChartStates(initialChartStates);
    }, [recentWorkouts, workoutColors]);

    useEffect(() => {
        const checkProfileImage = async () => {
            const imageURL = await AsyncStorage.getItem('userImageURL');
            if (imageURL === 'null') {
                setShowImageUploadModal(true);
            }
        };

        checkProfileImage();
    }, []);

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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        const formData = new FormData();
        formData.append('image', {
            uri: uri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        });

        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/auth/upload-profile-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                await AsyncStorage.setItem('userImageURL', result.imageUrl);
                setShowImageUploadModal(false);
                Alert.alert('Success', 'Profile picture uploaded successfully!');
            } else {
                Alert.alert('Error', 'Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'An error occurred while uploading the image');
        }
    };

    const filterDataByTimeFrame = (data, timeFrame) => {
        const currentDate = new Date();
        let startDate;

        switch (timeFrame) {
            case 'week':
                startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                break;
            case '6months':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                break;
            case 'year':
                startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                return data; // Show all data
        }

        return data.filter(item => {
            const itemDate = new Date(item.label);
            return itemDate >= startDate && itemDate <= currentDate;
        });
    };

    const updateChartTimeFrame = (index, timeFrame) => {
        setChartStates(prevStates => {
            const workout = recentWorkouts[index];
            const filteredData = filterDataByTimeFrame(workout.data, timeFrame);

            // If no data is available for the selected time frame, revert to 'all'
            if (filteredData.length === 0 && timeFrame !== 'all') {
                return {
                    ...prevStates,
                    [index]: {
                        ...prevStates[index],
                        timeFrame: 'all',
                        filteredData: workout.data
                    }
                };
            }

            return {
                ...prevStates,
                [index]: {
                    ...prevStates[index],
                    timeFrame: timeFrame,
                    filteredData: filteredData
                }
            };
        });
    };

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
            console.log("token: ", token);
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
        }
    };

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

    const options = ["Week", "Month", "6 Months", "Year"]

    const showOrHidePointer = (timeFrame) => {
        setSelectedTimeFrame(timeFrame);
        const filtered = filterDataByTimeFrame(timeFrame);
        setFilteredData(filtered);
    };

    const items = [
        {
            id: 'item-1',
            title: 'Average Weight',
            img: require('@/public/images/running-man.png'),
            color: '#177AD5',
        },
        {
            id: 'item-2',
            title: 'Average steps',
            img: require('@/public/images/heart.png'),
            color: '#FF6700',
        },
        // Add more items as needed
    ];

    const scrollX = useSharedValue(0);
    const onScrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const WorkoutChart = ({ workout, index }) => {
        const chartState = chartStates[index] || {
            timeFrame: 'all',
            filteredData: workout.data,
            color: workoutColors[index]
        };

        const transformedData = chartState.filteredData.map(item => ({
            value: typeof item.value === 'number' ? item.value : 0,
            label: new Date(item.label).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
        })).filter(Boolean);

        // If less than 10 data points, show all. Otherwise, show the 10 most recent.
        const dataToShow = transformedData.length <= 10 ? transformedData : transformedData.slice(-10);

        return (
            <View style={styles.chart}>
                <ThemedText type="subtitle">{workout.exercise_name}</ThemedText>
                {dataToShow.length > 0 ? (
                    <LineChart
                        data={dataToShow}
                        curved
                        isAnimated
                        height={150}
                        focusEnabled
                        showTextOnFocus
                        color={chartState.color}
                    />
                ) : (
                    <ThemedText>No data available for the selected time frame</ThemedText>
                )}
                <View style={{ flexDirection: 'row', marginLeft: 30, marginTop: 5 }}>
                    {['all', 'week', 'month', '6months', 'year'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={{
                                padding: 6,
                                margin: 4,
                                backgroundColor: chartState.timeFrame === item ? chartState.color : 'lightgray',
                                borderRadius: 8,
                            }}
                            onPress={() => updateChartTimeFrame(index, item)}>
                            <Text>{item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}</Text>
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

    return (
        <>
            <ParallaxScrollView

                headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
                headerImage={
                    <Image
                        source={require('@/public/images/running-man.png')}
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
                        <WorkoutChart key={index} workout={workout} index={index} />
                    ))
                ) : (
                    <ThemedView style={styles.noWorkoutsContainer}>
                        <ThemedText style={styles.noWorkoutsText}>
                            Start your fitness journey by adding your workouts!
                        </ThemedText>
                    </ThemedView>
                )}

            </ParallaxScrollView >

            <Modal
                animationType="slide"
                transparent={true}
                visible={showImageUploadModal}
                onRequestClose={() => setShowImageUploadModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Upload Profile Picture</Text>
                        <Text style={styles.modalText}>Would you like to upload a profile picture?</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                            <Text style={styles.modalButtonText}>Choose from Camera Roll</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowImageUploadModal(false)}>
                            <Text style={styles.modalButtonText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>

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


    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});


