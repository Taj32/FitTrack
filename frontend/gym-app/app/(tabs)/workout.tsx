import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { SetStateAction, useState } from 'react';
import * as FileSystem from 'expo-file-system';



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
    
    let fileContent = `Saved workout: ${selectedWorkout.name}\n\n`;
    console.log('Saved workout:', selectedWorkout.name);
    
    selectedWorkout.exercises.forEach((exercise, index) => {
      console.log(`\nExercise: ${exercise.name}`);
      console.log('Set\tReps\t\tWeight');
      exerciseData[index].logs.forEach((log, setIndex) => {
        console.log(`${setIndex + 1}\t\t${log.reps}\t\t${log.weight}`);
      });
    });

    selectedWorkout.exercises.forEach((exercise, index) => {
      fileContent += `Exercise: ${exercise.name}\n`;
      fileContent += 'Set\tReps\tWeight\n';
      exerciseData[index].logs.forEach((log, setIndex) => {
        fileContent += `${setIndex + 1}\t${log.reps}\t${log.weight}\n`;
      });
      fileContent += '\n';
    });
  
    const fileName = `workout_${selectedWorkout.id}_${Date.now()}.txt`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
  
    try {
      await FileSystem.writeAsStringAsync(filePath, fileContent);
      console.log(`Workout saved to ${filePath}`);
      
      // Optional: Read the file back to verify
      const savedContent = await FileSystem.readAsStringAsync(filePath);
      console.log('Saved workout data:', savedContent);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  
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
        <Text style={styles.workoutOptions} >{item.name}</Text>
        <Ionicons name="caret-forward" size={16} color="gray" />
      </View>

      {/* <RightOutlined /> */}
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
          {/* <TextInput
          placeholder="Lbs"
          value={exerciseData[index].lbs[setIndex]}
          style={styles.cell}
          onChangeText={(text) => handleExerciseDataChange(index, 'lbs', text)}
        />
        <TextInput
          placeholder="Reps"
          value={exerciseData[index].reps[setIndex]}
          style={styles.cell}
          onChangeText={(text) => handleExerciseDataChange(index, 'reps', text, setIndex)}
        /> */}
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

      <Modal visible={showModal} animationType="slide" >
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="title">{selectedWorkout ? selectedWorkout.name : 'No Workout Selected'}</ThemedText>
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

});
