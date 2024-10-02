import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View, ScrollView, Button, ActivityIndicator, Animated, LayoutAnimation, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { SetStateAction, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});


  const handleAddWorkoutPress = () => {
    setShowAddWorkoutModal(true);
  };

  useEffect(() => {
    // console.log("------ workout.tsx starts here.. ----");
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

  const confirmDelete = (name: String) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteWorkout(name),
          style: "destructive"
        }
      ]
    );
  };

  const deleteWorkout = async (workoutName: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/user-workouts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Ensure userToken is defined
        }
      });

      const data = await response.json();
      console.log('Fetched data:', JSON.stringify(data, null, 2));

      // Filter workouts by name (e.g., "Mini workout")
      const workoutsToDelete = data.filter(workout => workout.name === workoutName);

      if (workoutsToDelete.length === 0) {
        alert('No workouts found with that name');
        return;
      }

      // Delete each workout instance
      for (let workout of workoutsToDelete) {
        const deleteResponse = await fetch(`${API_URL}/workouts/remove/${workout.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete workout with ID ${workout.id}`);
        }
      }

      await fetchWorkouts();
      alert(`${workoutsToDelete.length - 1} workout(s) deleted successfully`);

      // Optionally, refresh the workout list after deletion
    } catch (error) {
      console.error('Error deleting workouts:', error);
      alert('Failed to delete workouts');
    }
  };

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
      if (exercises.length < 8) {
        setExercises([...exercises, { name: '', sets: 1 }]);
      } else {
        Alert.alert("Exercise Limit Reached", "You can add a maximum of 8 exercises per workout.");
      }
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
            placeholderTextColor="#999"
            placeholder="Workout Name"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseInput}>
              <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                placeholderTextColor="#999"
                value={exercise.name}
                id="inputID"
                onChangeText={(text) => handleExerciseChange(index, 'name', text)}
              />

              <View style={styles.setsContainer}>
                <ThemedText style={styles.setsLabel}>Sets:</ThemedText>
                <TextInput
                  style={styles.setsInput}
                  placeholder="Sets"
                  placeholderTextColor="#999"
                  value={exercise.sets.toString()}
                  onChangeText={(text) => handleExerciseChange(index, 'sets', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
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
        <TouchableOpacity onPress={() => setEditMode(!isEditMode)}>
          <ThemedText style={styles.editButton}>
            {isEditMode ? 'Done' : 'Edit'}
          </ThemedText>
        </TouchableOpacity>

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

          await fetchWorkouts();

        }}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" >Start Workout</ThemedText>
        <Ionicons name="fitness" size={50} color="black" />
      </ThemedView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.workoutLogContainer}>
              <Animated.View style={[
                styles.deleteButtonContainer,
                {
                  transform: [{
                    translateX: animatedValues[item.id].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, 0],
                    }),
                  }],
                },
              ]}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item.name)}
                >
                  <Ionicons name="remove-circle" size={24} color="red" />
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={[
                styles.workoutLog,
                {
                  transform: [{
                    translateX: animatedValues[item.id].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 40],
                    })
                  }],
                },
              ]}>
                <TouchableOpacity onPress={() => !isEditMode && handleWorkoutPress(item)}>
                  <View style={styles.workoutContainer}>
                    <Text style={styles.workoutOptions}>{item.name}</Text>
                    <Ionicons name="caret-forward" size={16} color="gray" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
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
                                placeholderTextColor="#999"
                                id="inputID"
                                onChangeText={(value) => handleInputChange(exercise.id || exerciseIndex, localSetIndex, 'weight', value)}
                              />
                              <TextInput
                                style={styles.input}
                                placeholder="reps"
                                placeholderTextColor="#999"
                                id="inputID"
                                onChangeText={(value) => handleInputChange(exercise.id || exerciseIndex, localSetIndex, 'reps', value)}
                              />
                            </View>
                          );
                        })}
                      </View>
                    );
                  });
                })()}

              </ScrollView>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <ThemedText>Save</ThemedText>
              </TouchableOpacity>
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
    marginTop: 85,
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
  placeholder: {
    color: 'red',
    opacity: 1,
  },
  // exerciseInput: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  // },
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

  workoutItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  deleteButtonContainer: {
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButton: {
    padding: 10,
  },
  workoutContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white', // or any background color that matches your design
  },
  workoutTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  exerciseInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  exerciseNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 40,
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setsLabel: {
    marginRight: 10,
    marginLeft: 95,
  },
  setsInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },

});
