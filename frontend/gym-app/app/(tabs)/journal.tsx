import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DateWidget } from '@/components/DateWidget';
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Animated, } from 'react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';



import { LayoutAnimation } from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.205:5000';



export default function JournalScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});


  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    setGroupedWorkouts(groupWorkoutsByMonth(workouts));
  }, [workouts]);

  useEffect(() => {
    const newAnimatedValues = {};
    workouts.forEach(workout => {
      newAnimatedValues[workout.id] = new Animated.Value(0);
    });
    setAnimatedValues(newAnimatedValues);
  }, [workouts]);

  const animateSlide = (id, toValue) => {
    Animated.spring(animatedValues[id], {
      toValue,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  };

  const setEditMode = (value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditMode(value);
    Object.keys(animatedValues).forEach(id => {
      animateSlide(id, value ? 1 : 0);
    });
  };

  const openWorkoutDetails = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const confirmDelete = (workoutId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteWorkout(workoutId),
          style: "destructive"
        }
      ]
    );
  };

  const deleteWorkout = async (workoutId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`${API_URL}/workouts/remove/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      // Animate edit mode off
      setEditMode(false);

      // Wait for the edit mode animation to complete
      setTimeout(() => {
        // Configure the layout animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // Remove the workout from the local state
        console.log("deleted the workout!");
        setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      }, 300); // Adjust this timeout to match your edit mode animation duration

      // // Configure the animation
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // // Remove the workout from the local state
      // console.log("deleted the workout!");
      // setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      // setEditMode(false);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`${API_URL}/workouts/user-workouts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      setWorkouts(data);

    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const WorkoutDetailsModal = () => {
    const groupExercises = (exercises) => {
      return exercises.reduce((acc, exercise) => {
        if (!acc[exercise.name]) {
          acc[exercise.name] = [];
        }
        acc[exercise.name].push(exercise);
        return acc;
      }, {});
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
            <ScrollView>
              {selectedWorkout?.exercises && selectedWorkout.exercises.length > 0 ? (
                Object.entries(groupExercises(selectedWorkout.exercises)).map(([exerciseName, sets], index) => (
                  <View key={index} style={styles.exerciseDetails}>
                    <Text style={styles.exerciseTitle}>{exerciseName}</Text>
                    {sets.map((set, setIndex) => (
                      <Text key={setIndex} style={styles.setDetails}>
                        Set {setIndex + 1} - {set.weight || 'N/A'} lbs - {set.reps || 'N/A'} reps
                      </Text>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noExercisesText}>No exercises recorded for this workout.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const groupExercises = (exercises) => {
    const grouped = [];
    let currentExercise = null;
    let setCount = 0;

    exercises.forEach((exercise) => {
      if (currentExercise && currentExercise.name === exercise.name) {
        setCount++;
      } else {
        if (currentExercise) {
          grouped.push({ ...currentExercise, sets: setCount });
        }
        currentExercise = exercise;
        setCount = 1;
      }
    });

    if (currentExercise) {
      grouped.push({ ...currentExercise, sets: setCount });
    }

    return grouped;
  };

  const formatDay = (dateString) => {
    console.log('Original dateString:', dateString);
    const date = parseISO(dateString);
    console.log('Parsed date object:', date);
    const formattedDay = format(date, 'EEE');
    console.log('Formatted day:', formattedDay);
    return formattedDay;
  };

  const formatDateDigit = (dateString) => {
    const date = parseISO(dateString);
    const dateDigit = format(date, 'd');
    console.log('Formatted date digit:', dateDigit);
    return dateDigit;
  };


  const groupWorkoutsByMonth = (workouts) => {
    const grouped = {};
    workouts.forEach(workout => {
      const date = parseISO(workout.date_created);
      const monthKey = format(date, 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(workout);
    });
    return grouped;
  };


  return (
    <SafeAreaView style={styles.container}>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => setEditMode(!isEditMode)}>
          <ThemedText style={styles.editButton}>
            {isEditMode ? 'Done' : 'Edit'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.replace('/workout')}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color='#007AFF'
          />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" >Log</ThemedText>
          {/* <Ionicons name="fitness" size={50} color="black" /> */}
        </ThemedView>

        {Object.entries(groupedWorkouts).map(([monthYear, monthWorkouts]) => (
          <View key={monthYear}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.monthSubText}>{monthYear}</Text>
              <Text style={styles.workoutNumberSubText}>{monthWorkouts.length} workouts</Text>
            </View>

            {monthWorkouts.map((workout, index) => {
              const translateX = animatedValues[workout.id]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 40],
              }) || new Animated.Value(0);

              return (
                <View key={workout.id} style={styles.workoutLogContainer}>
                  <Animated.View style={[
                    styles.deleteButtonContainer,
                    {
                      transform: [{
                        translateX: translateX.interpolate({
                          inputRange: [0, 40],
                          outputRange: [-40, 0],
                        }),
                      }],
                    },
                  ]}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmDelete(workout.id)}
                    >
                      <Ionicons name="remove-circle" size={24} color="red" />
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View style={[
                    styles.workoutLog,
                    {
                      transform: [{ translateX }],
                    },
                  ]}>
                    <TouchableOpacity
                      onPress={() => !isEditMode && openWorkoutDetails(workout)}
                      style={{ flexDirection: 'row', flex: 1 }}
                    >
                      <View style={styles.dateWidgetContainer}>
                        <DateWidget
                          day={formatDay(workout.date_created)}
                          dateDigit={formatDateDigit(workout.date_created)}
                        />
                      </View>

                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        {workout.exercises && workout.exercises.length > 0 ? (
                          groupExercises(workout.exercises).map((exercise, exIndex) => (
                            <Text key={exIndex} style={styles.exerciseName}>
                              {`${exercise.sets}x ${exercise.name}`}
                            </Text>
                          ))
                          // <View></View>
                        ) : (
                          <Text style={styles.incompleteWorkout}>Incomplete workout</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        ))}

      </ScrollView>
      <WorkoutDetailsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    paddingTop: 12,
    paddingBottom: 20,

    paddingLeft: 15,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#f2f1f6',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: '#f2f1f6',
  },
  editButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  spacer: {
    flex: 1,
  },
  subtitleContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  container: {
    backgroundColor: '#f2f1f6',
    flex: 1,
    flexGrow: 1,
  },
  monthSubText: {
    flex: 1,
    textAlign: 'left',
    color: 'gray',
    fontWeight: 'bold',
    fontSize: 15,
  },
  workoutNumberSubText: {
    color: 'gray',
    fontWeight: 'bold',
    fontSize: 15,
  },
  workoutInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workoutName: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 5,
  },
  exerciseName: {
    paddingBottom: 10,
    fontSize: 15,
  },
  incompleteWorkout: {
    paddingBottom: 15,
    fontSize: 15,
    fontStyle: 'italic',
    color: 'gray',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noExercisesText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
  },
  exerciseDetails: {
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 5,
  },
  setDetails: {
    fontSize: 16,
    marginLeft: 10,
  },
  workoutLogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 15,
    overflow: 'hidden',
    //columnGap: 20,
  },
  deleteButtonContainer: {
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 10,
  },
  workoutLog: {
    flexDirection: 'row',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
    flex: 1,
  },
  dateWidgetContainer: {
    // This will add space between the DateWidget and the workout info
    marginRight: 15,
    //width: 25,
    //height: 25,

  },


});
