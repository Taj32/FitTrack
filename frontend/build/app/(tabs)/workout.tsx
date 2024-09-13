import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View, ScrollView, Button, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { SetStateAction, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_URL = 'http://192.168.1.205:5000';
const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';


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


  const [userToken, setUserToken] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [exerciseData, setExerciseData] = useState<{ [exerciseId: number]: { [setIndex: number]: { weight: string, reps: string } } }>({});

  const [isLoading, setIsLoading] = useState(true);



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

      const formattedPayload = {
        name: payload.name,
        exercises: payload.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets
        }))
      };

      console.log('Sending workout data:', JSON.stringify(formattedPayload));
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
        body: JSON.stringify(formattedPayload)
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
      console.error('Error adding workout [addWorkoutTemp]:', error);
      throw error;
    }
  };

//For the initally created workouts --> dummy workout
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
    setIsLoading(true);
    console.log(userToken);
    try {
      const response = await fetch(`${API_URL}/workouts/user-workouts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      const data = await response.json();

      console.log('Fetched data:', JSON.stringify(data, null, 2));

      const uniqueWorkouts = data.filter(
        (workout, index, self) => index === self.findIndex((w) => w.name === workout.name)
      );

      setWorkouts(uniqueWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic cases
  const handleWorkoutPress = (workout: Workout) => {
    // Create a unique copy of the workout

    console.log("workout: " + workout);
    console.log("reference workouts: " + workout.exercises);
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
        const weights = Object.values(exercise).map(set => Number(set.weight));
        const reps = Object.values(exercise).map(set => Number(set.reps));
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
        console.error('Error adding workout [handleSave]:', error);
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

    const handleSubmit = async () => {
      try {
        // First, add the workout
        const workoutPayload = {
          name: workoutName,
          exercises: exercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets,
          })),
        };
  
        const response = await fetch(`${API_URL}/workouts/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(workoutPayload)
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
  
        const result = await response.json();
        const workoutId = result.workout.id;
  
        // Now, complete the workout with dummy data
        const dummyCompletionData = {
          exerciseData: exercises.map(exercise => ({
            weights: Array(exercise.sets).fill(-1),
            reps: Array(exercise.sets).fill(-1),
          }))
        };
  
        const completionResponse = await fetch(`${API_URL}/workouts/complete/${workoutId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(dummyCompletionData),
        });
  
        if (!completionResponse.ok) {
          throw new Error('Failed to complete dummy workout');
        }
  
        // Call the onAdd function to update the UI
        onAdd(workoutName, exercises);
  
        // Reset the form
        setWorkoutName('');
        setExercises([{ name: '', sets: 1 }]);
        onClose();
      } catch (error) {
        console.error('Error adding and completing workout:', error);
        // You might want to show an error message to the user here
      }
    };

    return (
      <Modal visible={visible} animationType="slide">
        <ThemedView style={styles.addModalContainer}>
          <ThemedText type="title">Add New Workout</ThemedText>
          <TextInput
            style={styles.nameInput}
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
          // const workoutId = await addWorkout(name, exercises);
          // if (workoutId) {
          //   // Refresh workouts list here
          //   // You might want to fetch the updated list from the server
          //   // or add the new workout to the existing list
          // }
          await fetchWorkouts();

        }}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" >Start Workout</ThemedText>
        <Ionicons name="fitness" size={50} color="black" />
      </ThemedView>

      {/* Dynamic cases */}
      {/* <FlatList
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
      ></FlatList> */}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
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
        />
      )}

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
    marginTop: 64,
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: '#f2f1f6',
    borderRadius: 30,
  },
  addModalContainer: {
    marginTop: 128,
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
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    //paddingTop: 100,
    //marginTop: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    //paddingTop: 100,
    //marginTop: 10,
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
