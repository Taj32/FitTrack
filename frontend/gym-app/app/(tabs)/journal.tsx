import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DateWidget } from '@/components/DateWidget';
import { NavigationContainer } from '@react-navigation/native';
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns';

import { useState, useEffect, useRef } from 'react';
import { Animated, } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.205:5000';

// const workoutLogs = [
//   { day: 'Mon', dateDigit: '9', name: 'Strength Training', exercises: ['3x10 Bench Press', '3x12 Squats', '3x15 Deadlifts'] },
//   { day: 'Tue', dateDigit: '10', name: 'Cardio Day', exercises: ['30 min Treadmill Run', '20 min Jump Rope', '10 min Cool Down Stretch'] },
//   { day: 'Wed', dateDigit: '11', name: 'Upper Body Focus', exercises: ['4x8 Pull-ups', '3x12 Shoulder Press', '3x15 Tricep Dips', '3x12 Bicep Curls'] },
//   { day: 'Thur', dateDigit: '12', name: 'Leg Day', exercises: ['4x10 Leg Press', '3x12 Lunges', '3x15 Calf Raises', '3x20 Leg Extensions'] },
//   { day: 'Fri', dateDigit: '13', name: 'HIIT Workout', exercises: ['5 rounds of: 30s Burpees', '30s Mountain Climbers', '30s High Knees', '30s Rest'] },
//   { day: 'Sat', dateDigit: '14', name: 'Core and Flexibility', exercises: ['3x20 Crunches', '3x30s Planks', '15 min Yoga Flow', '10 min Foam Rolling'] },
//   { day: 'Sun', dateDigit: '15', name: 'Active Recovery', exercises: ['45 min Brisk Walk', '20 min Light Stretching', '15 min Meditation'] },
// ];

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
    setIsEditMode(value);
    Object.keys(animatedValues).forEach(id => {
      animateSlide(id, value ? 1 : 0);
    });
  };

  const openWorkoutDetails = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
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

      // Remove the workout from the local state
      console.log("deleted the workout!");
      setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      setEditMode(false);
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

  const logWorkoutStructure = (workout) => {
    console.log('Workout structure:', JSON.stringify(workout, null, 2));
  };



  const ExerciseDetails = ({ exercise }) => {
    // Group the sets by exercise name
    const groupedSets = exercise.sets.reduce((acc, set) => {
      if (!acc[set.exercise_name]) {
        acc[set.exercise_name] = [];
      }
      acc[set.exercise_name].push(set);
      return acc;
    }, {});

    return (
      <View style={styles.exerciseDetails}>
        {Object.entries(groupedSets).map(([exerciseName, sets], index) => (
          <View key={index}>
            <Text style={styles.exerciseTitle}>{exerciseName}</Text>
            {sets.map((set, setIndex) => (
              <Text key={setIndex} style={styles.setDetails}>
                Set {setIndex + 1} - {set.weight || 'N/A'} lbs - {set.reps || 'N/A'} reps
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
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

  const formatMonthYear = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'MMMM yyyy');
  };



  return (
    <SafeAreaView style={styles.container}>

      <ThemedView style={styles.buttonContainer}>
        <ThemedText
          style={styles.editButton}
          onPress={() => setEditMode(!isEditMode)}
        >
          {isEditMode ? 'Done' : 'Edit'}
        </ThemedText>

        <Ionicons
          name="add-circle-outline"
          size={24}
          color='#007AFF'
          style={{ marginRight: 16 }}
          onPress={() => alert('"+" pressed')}
        />
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
                      onPress={() => deleteWorkout(workout.id)}
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
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,

    backgroundColor: '#f2f1f6',
  },
  editButton: {
    flex: 1,
    fontSize: 17,
    color: '#007AFF',
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
  workoutLog: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top
    borderRadius: 30,
    padding: 16,
    backgroundColor: 'white',
    flex: 1,
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
    marginRight: 30,
  },


});
