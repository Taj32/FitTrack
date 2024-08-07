import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { SetStateAction, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function WorkoutScreen() {

  interface ExerciseData {
    logs: { reps: string; weight: string }[];
  }

  interface Workout {
    id: number;
    name: string;
    exercises: Exercise[];
  }

  interface Exercise {
    id: number;
    name: string;
    set: number;
  }

  const [workouts, setWorkouts] = useState([
    {
      id: 1, name: 'Full Body Workout', exercises: [
        { id: 1, name: 'Bench Press', set: 1 },
        { id: 2, name: 'Squats', set: 1 },
        { id: 3, name: 'Deadlifts', set: 1 },
      ]
    },
    {
      id: 2, name: 'Upper Body Workout', exercises: [
        { id: 4, name: 'Overhead Press', set: 3 },
        { id: 5, name: 'Pull-ups', set: 3 },
        { id: 6, name: 'Bicep Curls', set: 3 },
      ]
    },
    {
      id: 3, name: 'Lower Body Workout', exercises: [
        { id: 7, name: 'Squats', set: 4 },
        { id: 8, name: 'Lunges', set: 3 },
        { id: 9, name: 'Leg Press', set: 3 },
      ]
    },
    {
      id: 4, name: 'Ab Workout', exercises: [
        { id: 10, name: 'Crunches', set: 3 },
        { id: 11, name: 'Planks', set: 3 },
        { id: 12, name: 'Russian Twists', set: 3 },
      ]
    },
    {
      id: 5, name: 'Leg Workout', exercises: [
        { id: 13, name: 'Squats', set: 4 },
        { id: 14, name: 'Deadlifts', set: 3 },
        { id: 15, name: 'Calf Raises', set: 3 },
      ]
    },
    {
      id: 6, name: 'HIIT Workout', exercises: [
        { id: 16, name: 'Burpees', set: 4 },
        { id: 17, name: 'Mountain Climbers', set: 4 },
        { id: 18, name: 'Jump Squats', set: 4 },
      ]
    },
  ]);

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);

  const handleAddWorkoutPress = () => {
    setShowAddWorkoutModal(true);
  };

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token !== null) {
          setUserToken(token);
        }
      } catch (e) {
        console.error('Failed to load user token.');
      }
    };

    getToken();
  }, []);

  const addExerciseToDatabase = async (exerciseData: {
    exercise_name: string;
    weight: number;
    reps: number;
    sets: number;
    date: string;
  }) => {
    if (!userToken) {
      console.error('User token is not available.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.205:5000/exercises/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(exerciseData),
      });

      if (!response.ok) {
        throw new Error('Failed to add exercise');
      }

      const result = await response.json();
      console.log('Exercise added successfully:', result);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const addWorkout = async (workoutName: string, exercises: { name: string, sets: number }[]) => {
    if (!userToken) {
      console.error('User token is not available.');
      return null;
    }

    try {
      const response = await fetch('http://192.168.1.205:5000/workouts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: workoutName,
          exercises: exercises
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add workout');
      }

      const result = await response.json();
      console.log('Workout added successfully:', result);
      console.log(result.workout.id);
      return result.workout.id; // Assuming the API returns the workout ID
    } catch (error) {
      console.error('Error adding workout:', error);
      return null;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
    setExerciseData([]);
  };

  const completeWorkout = async (workoutId: number, exerciseData: Array<{
    weights: number[],
    reps: number[]
  }>) => {
    if (!userToken) {
      console.error('User token is not available.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.205:5000/workouts/complete/${workoutId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ exerciseData }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      const result = await response.json();
      console.log('Workout completed successfully:', result);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };



  const handleWorkoutSelect = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowModal(true);
    setExerciseData(workout.exercises.map(exercise => ({
      logs: Array(exercise.set).fill({ reps: '', weight: '' })
    })));
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkout) {
      console.log('No workout selected');
      return;
    }

    // Prepare exercises data for adding workout
    const exercisesForAdd = selectedWorkout.exercises.map(exercise => ({
      name: exercise.name,
      sets: exercise.set
    }));

    // Add the workout first
    const workoutId = await addWorkout(selectedWorkout.name, exercisesForAdd);
    if (!workoutId) {
      console.error('Failed to create workout');
      return;
    }

    // Prepare exercise data for completing workout
    const exerciseDataForComplete = selectedWorkout.exercises.map((exercise, index) => {
      const weights = [];
      const reps = [];
      for (let i = 0; i < exercise.set; i++) {
        const log = exerciseData[index].logs[i];
        if (log.weight && log.reps) {
          weights.push(parseFloat(log.weight));
          reps.push(parseInt(log.reps));
        }
      }
      return { weights, reps };
    });

    // Complete the workout with all exercise data
    await completeWorkout(workoutId, exerciseDataForComplete);

    // ... (rest of the function for saving to file system)

    setShowModal(false);
  };

  const handleExerciseDataChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setExerciseData(prevData => {
      const newData = [...prevData];
      newData[exerciseIndex].logs[setIndex] = {
        ...newData[exerciseIndex].logs[setIndex],
        [field]: value
      };
      return newData;
    });
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity onPress={() => handleWorkoutSelect(item)}>
      <View style={styles.workoutContainer}>
        <Text style={styles.workoutOptions}>{item.name}</Text>
        <Ionicons name="caret-forward" size={16} color="gray" />
      </View>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item, index }: { item: Exercise; index: number }) => (
    <ThemedView style={styles.exerciseContainer}>
      <ThemedText>{item.name}</ThemedText>
      <View style={styles.row}>
        <Text style={styles.cell}>Set</Text>
        <Text style={styles.cell}>Lbs</Text>
        <Text style={styles.cell}>Reps</Text>
      </View>

      {Array.from({ length: item.set }).map((_, setIndex) => (
        <View key={setIndex} style={styles.row}>
          <Text style={styles.cell}>{setIndex + 1}</Text>
          <TextInput
            placeholder="Reps"
            style={styles.cell}
            value={exerciseData[index].logs[setIndex].reps}
            onChangeText={(text) => handleExerciseDataChange(index, setIndex, 'reps', text)}
          />
          <TextInput
            placeholder="Weight"
            style={styles.cell}
            value={exerciseData[index].logs[setIndex].weight}
            onChangeText={(text) => handleExerciseDataChange(index, setIndex, 'weight', text)}
          />
        </View>
      ))}
    </ThemedView>
  );


  function handleModalToggle(): ((event: import("react-native").GestureResponderEvent) => void) | undefined {
    throw new Error('Function not implemented.');
  }

  const AddWorkoutModal = ({ visible, onClose, onAdd }) => {
    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState([{ name: '', sets: 1 }]);

    const addExercise = () => {
      setExercises([...exercises, { name: '', sets: 1 }]);
    };

    const handleExerciseChange = (index, field, value) => {
      const newExercises = [...exercises];
      newExercises[index][field] = value;
      setExercises(newExercises);
    };

    const handleSubmit = () => {
      onAdd(workoutName, exercises);
      setWorkoutName('');
      setExercises([{ name: '', sets: 1 }]);
      onClose();
    };

    return (
      <Modal visible={visible} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="title">Add New Workout</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Workout Name"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseInput}>
              <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                value={exercise.name}
                onChangeText={(text) => handleExerciseChange(index, 'name', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Sets"
                value={exercise.sets.toString()}
                onChangeText={(text) => handleExerciseChange(index, 'sets', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addExercise}>
            <ThemedText>Add Exercise</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <ThemedText>Save Workout</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <ThemedText>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
    );
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
          onPress={handleAddWorkoutPress}
        />
      </ThemedView>

      <AddWorkoutModal
        visible={showAddWorkoutModal}
        onClose={() => setShowAddWorkoutModal(false)}
        onAdd={async (name, exercises) => {
          const workoutId = await addWorkout(name, exercises);
          if (workoutId) {
            // Refresh workouts list here
            // You might want to fetch the updated list from the server
            // or add the new workout to the existing list
          }
        }}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" >Start Workout</ThemedText>
        <Ionicons name="fitness" size={50} color="black" />
      </ThemedView>

      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.separator} />}
      />

      <Modal visible={showModal} animationType="none">
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>
              {selectedWorkout ? selectedWorkout.name : 'No Workout Selected'}
            </ThemedText>
          </View>
          <FlatList
            data={selectedWorkout ? selectedWorkout.exercises : []}
            renderItem={renderExerciseItem}
            ListHeaderComponent={
              <View style={styles.workoutHeader}>
              </View>
            }
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
                <ThemedText>Save Workout</ThemedText>
              </TouchableOpacity>
            }
          />
        </ThemedView>
      </Modal>

    </SafeAreaView>


  );
}



const styles = StyleSheet.create({
  // titleText: {
  //   backgroundColor: 'red',
  // },
  container: {
    backgroundColor: '#f2f1f6',
    flex: 1,
    flexGrow: 1,
  },
  titleContainer: {
    paddingTop: 10,
    paddingBottom: 10,

    paddingLeft: 15,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#f2f1f6',
  },
  screenContainer: {
    flex: 1,
  },
  exerciseContainer: {
    marginVertical: 10,
    //flexDirection: 'row',
    //alignItems: 'center',
    //gap: 0,
  },
  modalContainer: {
    //flex: 1,
    marginTop: 128,
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: '#f2f1f6',
    borderRadius: 30,
    //backgroundColor: 'red',
  },
  saveButton: {
    //backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#A1CEDC',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc', // light gray color
  },
  workoutOptions: {
    color: 'black',
    fontSize: 15,
    flex: 1,
  },
  workoutContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  buttonContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16,
    marginLeft: 16,

    backgroundColor: '#f2f1f6',
  },
  editButton: {
    flex: 1,
    fontSize: 17,
    color: '#007AFF',
  },
  workoutHeader: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  cell: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,  // to offset the back button and center the title
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  exerciseInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },

});
