import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, Text, View } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SetStateAction, useState } from 'react';
import { ScreenContainer } from 'react-native-screens';

export default function WorkoutScreen() {

  interface ExerciseData {
    sets: string;
    reps: string;
    weight: string;
  }

  interface Workout {
    id: number;
    name: string;
    exercises: Exercise[];
  }

  interface Exercise {
    id: number;
    name: string;
  }

  const [workouts, setWorkouts] = useState([
    {
      id: 1, name: 'Full Body Workout', exercises: [
        { id: 1, name: 'Bench Press' },
        { id: 2, name: 'Squats' },
        { id: 3, name: 'Deadlifts' },
      ]
    },
    {
      id: 2, name: 'Upper Body Workout', exercises: [
        { id: 4, name: 'Overhead Press' },
        { id: 5, name: 'Pull-ups' },
        { id: 6, name: 'Bicep Curls' },
      ]
    },
  ]);

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);


  const handleWorkoutSelect = (workout: any) => {
    setSelectedWorkout(workout);
    setShowModal(true);
    setExerciseData(workout.exercises.map(() => ({ sets: '', reps: '', weight: '' })));
  };

  const handleSaveWorkout = () => {
    // Save workout data with exerciseData
    console.log('Saved workout:', selectedWorkout, exerciseData);
    setShowModal(false);
  };

  const handleExerciseDataChange = (index: number, field: keyof ExerciseData, value: string) => {
    const updatedExerciseData = [...exerciseData];
    updatedExerciseData[index][field] = value;
    setExerciseData(updatedExerciseData);
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity onPress={() => handleWorkoutSelect(item)}>
      <ThemedText>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item, index }: { item: Exercise; index: number }) => (
    <ThemedView style={styles.exerciseContainer}>
      <ThemedText>{item.name}</ThemedText>
      <TextInput
        placeholder="Sets"
        value={exerciseData[index].sets}
        onChangeText={(text) => handleExerciseDataChange(index, 'sets', text)}
      />
      <TextInput
        placeholder="Reps"
        value={exerciseData[index].reps}
        onChangeText={(text) => handleExerciseDataChange(index, 'reps', text)}
      />
      <TextInput
        placeholder="Weight"
        value={exerciseData[index].weight}
        onChangeText={(text) => handleExerciseDataChange(index, 'weight', text)}
      />
    </ThemedView>
  );


  return (

    <SafeAreaView style={styles.container}>
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
      />
      <Modal visible={showModal} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="title">{selectedWorkout ? selectedWorkout.name : 'No Workout Selected'}</ThemedText>
          <FlatList
            data={selectedWorkout ? selectedWorkout.exercises : []}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
                <ThemedText>Save Workout</ThemedText>
              </TouchableOpacity>
            }
          />
        </ThemedView>
      </Modal>

      <Text>Hello</Text>
      <Text>Hello</Text>

      <Text>Hello</Text>
      <Text>Hello</Text>


      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>


      {/* <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/running-man.png')}
            style={styles.headerImage}
          />
        }
      >
        
      </ParallaxScrollView> */}
    </SafeAreaView>


  );
}



const styles = StyleSheet.create({
  // titleText: {
  //   backgroundColor: 'red',
  // },
  container: {
    backgroundColor:  '#f2f1f6',
  },
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 10,

    paddingLeft: 15,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'f2f1f6',
  },
  screenContainer: {
    flex: 1,
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    //backgroundColor: 'red',
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  separator: {
    height: 1,
    width: '50%',
    backgroundColor: '#ccc', // light gray color
  },
});
