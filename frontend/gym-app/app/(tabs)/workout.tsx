import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View, ScrollView, Button } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { SetStateAction, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.205:5000';

export default function WorkoutScreen() {

  type ExerciseData = {
    weights: number[];
    reps: number[];
  };

  type WorkoutCompletionData = {
    exerciseData: ExerciseData[];
  };

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

  //   {
  //     id: 1, name: 'Full Body Workout', exercises: [
  //       { id: 1, name: 'Bench Press', set: 1 },
  //       { id: 2, name: 'Squats', set: 1 },
  //       { id: 3, name: 'Deadlifts', set: 1 },
  //     ]
  //   },
  //   {
  //     id: 2, name: 'Upper Body Workout', exercises: [
  //       { id: 4, name: 'Overhead Press', set: 3 },
  //       { id: 5, name: 'Pull-ups', set: 3 },
  //       { id: 6, name: 'Bicep Curls', set: 3 },
  //     ]
  //   },
  //   {
  //     id: 3, name: 'Lower Body Workout', exercises: [
  //       { id: 7, name: 'Squats', set: 4 },
  //       { id: 8, name: 'Lunges', set: 3 },
  //       { id: 9, name: 'Leg Press', set: 3 },
  //     ]
  //   },
  //   {
  //     id: 4, name: 'Ab Workout', exercises: [
  //       { id: 10, name: 'Crunches', set: 3 },
  //       { id: 11, name: 'Planks', set: 3 },
  //       { id: 12, name: 'Russian Twists', set: 3 },
  //     ]
  //   },
  //   {
  //     id: 5, name: 'Leg Workout', exercises: [
  //       { id: 13, name: 'Squats', set: 4 },
  //       { id: 14, name: 'Deadlifts', set: 3 },
  //       { id: 15, name: 'Calf Raises', set: 3 },
  //     ]
  //   },
  //   {
  //     id: 6, name: 'HIIT Workout', exercises: [
  //       { id: 16, name: 'Burpees', set: 4 },
  //       { id: 17, name: 'Mountain Climbers', set: 4 },
  //       { id: 18, name: 'Jump Squats', set: 4 },
  //     ]
  //   },
  // ]);

  const [userToken, setUserToken] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [exerciseData, setExerciseData] = useState<{ [exerciseId: number]: { [setIndex: number]: { weight: string, reps: string } } }>({});


  const handleAddWorkoutPress = () => {
    setShowAddWorkoutModal(true);
  };

  useEffect(() => {
    console.log("------ workout.tsx starts here.. ----");
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token !== null) {
          console.log("setting...");
          setUserToken(token);
        }
      } catch (e) {
        console.error('Failed to load user token.');
      }
    };

    getToken();
    console.log("xxx");
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchWorkouts();
    }
  }, [userToken]);


  const addWorkoutTemp = async (payload: { name: string; exercises: { name: string; sets: number; }[]; }) => {
    try {
      console.log('Sending workout data:', JSON.stringify(payload));
      console.log('User token:', userToken);

      if (!userToken) {
        throw new Error('User token is missing');
      }

      const response = await fetch(`${API_URL}/workouts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      await fetchWorkouts();

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };


  const addWorkout = async (workoutName: string, exercises: { name: string; sets: number }[]) => {
    try {
      const workoutData = {
        name: workoutName,
        exercises: exercises
      };

      console.log('Sending workout data:', JSON.stringify(workoutData));
      console.log('User token:', userToken);

      if (!userToken) {
        throw new Error('User token is missing');
      }

      const response = await fetch(`${API_URL}/workouts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(workoutData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      await fetchWorkouts();

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
    setExerciseData([]);
  };

  async function completeWorkout(workoutId: string, data: WorkoutCompletionData) {
    try {

      console.log("id:", workoutId);
      console.log("data:", JSON.stringify(data));

      const response = await fetch(`${API_URL}/workouts/complete/${workoutId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }

  const fetchWorkouts = async () => {

    console.log(userToken);
    try {
      const response = await fetch(`${API_URL}/workouts/user-workouts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
        //body: JSON.stringify({ exerciseData }),
      });

      const data = await response.json();

      console.log('Fetched data:', JSON.stringify(data, null, 2));

      // Filter workouts to ensure unique names
      const uniqueWorkouts = data.filter(
        (workout, index, self) => index === self.findIndex((w) => w.name === workout.name)
      );

      setWorkouts(uniqueWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };


  // Dynamic cases
  const handleWorkoutPress = (workout: Workout) => {
    // Create a unique copy of the workout
    const uniqueWorkout = {
      id: Date.now(), // Using current timestamp as a unique ID
      name: `${workout.name}`,
      exercises: workout.exercises.map(exercise => ({
        name: exercise.name,
        set: exercise.sets
      }))
    };

    // Set the selected workout and show the modal
    setSelectedWorkout(uniqueWorkout);
    setModalVisible(true);



    // Print the unique workout details
    console.log('reference id', workout.id);
    console.log('Unique Workout:', uniqueWorkout);
  };

  // dynamic 

  const handleInputChange = (exerciseId: number, setIndex: number, field: string, value: string) => {
    setExerciseData(prevState => {
      const updatedExercise = { ...prevState[exerciseId], [setIndex]: { ...prevState[exerciseId]?.[setIndex], [field]: value } };
      return { ...prevState, [exerciseId]: updatedExercise };
    });
  };

  const transformExerciseData = (exerciseData) => {
    return {
      exerciseData: Object.values(exerciseData).map(exercise => {
        const weights = [];
        const reps = [];
        
        Object.values(exercise).forEach(set => {
          weights.push(Number(set.weight));
          reps.push(Number(set.reps));
        });
  
        return { weights, reps };
      })
    };
  };
  
  const handleSave = async () => {
    // if (!areAllInputsFilled()) {
    //   alert('Please fill in all weight and rep fields before saving.');
    //   return;
    // }
  
    if (selectedWorkout) {
      const workoutPayload = {
        name: selectedWorkout.name,
        exercises: selectedWorkout.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.set,
        })),
      };
  
      const workoutCompletionData = transformExerciseData(exerciseData);
  
      console.log('workoutCompletionData before API call:', workoutCompletionData);
  
      try {
        const response = await addWorkoutTemp(workoutPayload);
        console.log('Workout added successfully.', response);
        const workoutId = response.workout.id;
  
        console.log("workoutCompletionData", workoutCompletionData);
        const completionResult = await completeWorkout(workoutId, workoutCompletionData);
        console.log("Workout completed successfully");
      } catch (error) {
        console.error('Error adding workout:', error);
      }
  
      console.log('Workout Name:', selectedWorkout.name);
      selectedWorkout.exercises.forEach(exercise => {
        console.log('Exercise:', exercise.name);
        [...Array(exercise.set)].forEach((_, setIndex) => {
          const setData = exerciseData[exercise.id]?.[setIndex];
          console.log(`Set ${setIndex + 1}: Weight: ${setData?.weight || ''}, Reps: ${setData?.reps || ''}`);
        });
      });
    }
    setModalVisible(false); // Close the modal
  };
  
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

        <View style={styles.spacer} />

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

      {/* Dynamic cases */}
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
            <View style={styles.workoutContainer}>
              <Text style={styles.workoutOptions}>{item.name}</Text>
              <Ionicons name="caret-forward" size={16} color="gray" />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.separator} />}
      ></FlatList>

      {/* Dynamic modal */}

      {selectedWorkout && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <ThemedView style={[styles.modalContainer, { flex: 1 }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCloseModal} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.modalTitle}>
                  {selectedWorkout ? selectedWorkout.name : 'No Workout Selected'}
                </ThemedText>
              </View>

              <ScrollView
                // style={{ flex: 1 }}
                contentContainerStyle={styles.modalContent}
              >
                {(() => {
                  let cumulativeSetIndex = 0;
                  let prevExerciseName = '';

                  return selectedWorkout.exercises.map((exercise, exerciseIndex) => {
                    if (exercise.name !== prevExerciseName) {
                      cumulativeSetIndex = 0;
                      prevExerciseName = exercise.name;
                    }

                    return (
                      <View key={exercise.id || exerciseIndex} style={styles.exerciseContainer}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        {[...Array(exercise.set)].map((_, localSetIndex) => {
                          cumulativeSetIndex++;
                          return (
                            <View key={`${exercise.id || exerciseIndex}-${localSetIndex}`} style={styles.setContainer}>
                              <Text>Set {cumulativeSetIndex}: </Text>
                              <TextInput
                                style={styles.input}
                                placeholder="weight"
                                onChangeText={(value) => handleInputChange(exercise.id || exerciseIndex, localSetIndex, 'weight', value)}
                              />
                              <TextInput
                                style={styles.input}
                                placeholder="reps"
                                onChangeText={(value) => handleInputChange(exercise.id || exerciseIndex, localSetIndex, 'reps', value)}
                              />
                            </View>
                          );
                        })}
                      </View>
                    );
                  });
                })()}
                {/* <Button title="Save" onPress={handleSave} disabled={!areAllInputsFilled} /> */}

              </ScrollView>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <ThemedText>Save</ThemedText>
              </TouchableOpacity>
              {/* <Button title="Save" onPress={handleSave} /> */}
            </ThemedView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>


  );
}


const styles = StyleSheet.create({

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
  },
  modalContainer: {
    marginTop: 32,
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: '#f2f1f6',
    borderRadius: 30,
  },
  saveButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
    backgroundColor: '#f2f1f6',
  },
  editButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  spacer: {
    flex: 1,
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
    marginTop: 16,
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
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 20,
    paddingBottom: 0,
    //marginBottom: 0,

  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
