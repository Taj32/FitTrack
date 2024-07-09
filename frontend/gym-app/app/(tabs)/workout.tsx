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

  // const [workouts, setWorkouts] = useState([
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


  //const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showModal, setShowModal] = useState(false);
  // const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
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



  const addWorkout = async (workout: { name: string; exercises: { name: string; sets: number }[] }) => {
    try {
      const response = await fetch(`${API_URL}/workouts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(workout)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      //console.log(response.id);

      //const data = await response.json();
      //console.log('Workout structure:', JSON.stringify(data, null, 2));
      //const data = await response.json();

      //console.log('Fetched data1:', JSON.stringify(data, null, 2));

      // console.log(data.id);
      return await response.json();
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
        //id: exercise.id,
        //weight: "",
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

  const handleSave = async () => {

    if (!areAllInputsFilled()) {
      alert('Please fill in all weight and rep fields before saving.');
      return;
    }
  
    const workoutCompletionData: WorkoutCompletionData = {
      exerciseData: [],
    };

    if (selectedWorkout) {
      const workoutPayload = {
        name: selectedWorkout.name,
        exercises: selectedWorkout.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.set
        }))
      };

      const workoutCompletionData: WorkoutCompletionData = {
        exerciseData: [],
      };
    
      selectedWorkout.exercises.forEach((exercise) => {
        const exerciseInfo: ExerciseData = {
          weights: [],
          reps: [],
        };
    
        [...Array(exercise.set)].forEach((_, setIndex) => {
          const setData = exerciseData[exercise.id]?.[setIndex];
          if (setData) {
            exerciseInfo.weights.push(Number(setData.weight) || 0);
            exerciseInfo.reps.push(Number(setData.reps) || 0);
          }
        });
    
        workoutCompletionData.exerciseData.push(exerciseInfo);
      });

      try {
        const response = await addWorkout(workoutPayload);
        //console.log(response.exercises.id);
        console.log('Workout added successfully.', response);
        console.log(response.workout.id);
        const workoutId = response.workout.id;

        console.log("popopopopopopopopopopop");
        console.log("workoutCompletionData", workoutCompletionData);
        const completionResult = await completeWorkout(workoutId, workoutCompletionData);
        console.log("workout completed successfully");
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

  //Unique worko

  // function areAllInputsFilled(): boolean {
  //   return selectedWorkout.exercises.every((exercise) => {
  //     return [...Array(exercise.set)].every((_, setIndex) => {
  //       const setData = exerciseData[exercise.id]?.[setIndex];
  //       return setData && setData.weight !== '' && setData.reps !== '';
  //     });
  //   });
  // }

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


      {/* static workouts
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.separator} />}
      /> */}

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
          <ThemedView style={styles.modalContainer}>

            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <ThemedText type="title" style={styles.modalTitle}>
                {selectedWorkout ? selectedWorkout.name : 'No Workout Selected'}
              </ThemedText>
            </View>


            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
              {selectedWorkout.exercises.map(exercise => (
                <View key={exercise.id} style={styles.exerciseContainer}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {[...Array(exercise.set)].map((_, setIndex) => (
                    <View key={setIndex} style={styles.setContainer}>
                      <Text>Set {setIndex + 1}: </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="weight"
                        //keyboardType="numeric"
                        onChangeText={(value) => handleInputChange(exercise.id, setIndex, 'weight', value)}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="reps"
                        //keyboardType="numeric"
                        onChangeText={(value) => handleInputChange(exercise.id, setIndex, 'reps', value)}
                      />
                    </View>
                  ))}
                </View>
              ))}
              <Button title="Save" onPress={handleSave} disabled={!areAllInputsFilled} />
            </ScrollView>
          </ThemedView>
        </Modal>
      )}

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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxHeight: '100%',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },


});
