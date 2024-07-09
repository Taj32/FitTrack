import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface ExerciseItemProps {
  exercise: {
    id: number;
    name: string;
    set: number;
  };
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise }) => {
  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {[...Array(exercise.set)].map((_, setIndex) => (
        <View key={setIndex} style={styles.setContainer}>
          <Text>Set {setIndex + 1}: </Text>
          <TextInput
            style={styles.input}
            placeholder="weight"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="reps"
            keyboardType="numeric"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginRight: 10,
    width: 60,
    textAlign: 'center',
  },
});

export default ExerciseItem;
