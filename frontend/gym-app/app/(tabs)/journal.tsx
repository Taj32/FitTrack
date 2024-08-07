import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DateWidget } from '@/components/DateWidget';
import { NavigationContainer } from '@react-navigation/native';
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns';



import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.205:5000';

const workoutLogs = [
  { day: 'Mon', dateDigit: '9', name: 'Strength Training', exercises: ['3x10 Bench Press', '3x12 Squats', '3x15 Deadlifts'] },
  { day: 'Tue', dateDigit: '10', name: 'Cardio Day', exercises: ['30 min Treadmill Run', '20 min Jump Rope', '10 min Cool Down Stretch'] },
  { day: 'Wed', dateDigit: '11', name: 'Upper Body Focus', exercises: ['4x8 Pull-ups', '3x12 Shoulder Press', '3x15 Tricep Dips', '3x12 Bicep Curls'] },
  { day: 'Thur', dateDigit: '12', name: 'Leg Day', exercises: ['4x10 Leg Press', '3x12 Lunges', '3x15 Calf Raises', '3x20 Leg Extensions'] },
  { day: 'Fri', dateDigit: '13', name: 'HIIT Workout', exercises: ['5 rounds of: 30s Burpees', '30s Mountain Climbers', '30s High Knees', '30s Rest'] },
  { day: 'Sat', dateDigit: '14', name: 'Core and Flexibility', exercises: ['3x20 Crunches', '3x30s Planks', '15 min Yoga Flow', '10 min Foam Rolling'] },
  { day: 'Sun', dateDigit: '15', name: 'Active Recovery', exercises: ['45 min Brisk Walk', '20 min Light Stretching', '15 min Meditation'] },
];

export default function JournalScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState({});

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    setGroupedWorkouts(groupWorkoutsByMonth(workouts));
  }, [workouts]);

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
        <ThemedText style={styles.editButton} onPress={() => alert('Edit pressed')}>
          Edit
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

            {monthWorkouts.map((workout, index) => (
              <View key={index} style={styles.workoutLog}>
                <DateWidget
                  day={formatDay(workout.date_created)}
                  dateDigit={formatDateDigit(workout.date_created)}
                />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  {workout.exercises && workout.exercises.length > 0 ? (
                    groupExercises(workout.exercises).map((exercise, exIndex) => (
                      <Text key={exIndex} style={styles.exerciseName}>
                        {`${exercise.sets}x ${exercise.name}`}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.incompleteWorkout}>Incomplete workout</Text>
                  )}
                  <Text></Text>
                </View>
              </View>
            ))}
          </View>
        ))}

      </ScrollView>

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

    marginVertical: 10,
    marginHorizontal: 15,


    borderRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    //flex: 1, //'white',//
  },
  workoutInfo: {
    marginLeft: 10,
  },
  workoutName: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 0,
  },
  exerciseName: {
    paddingTop: 5,
    fontSize: 15,
  },
  incompleteWorkout: {
    paddingTop: 5,
    fontSize: 15,
    fontStyle: 'italic',
    color: 'gray',
  },
});
