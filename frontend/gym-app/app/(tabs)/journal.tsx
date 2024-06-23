import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DateWidget } from '@/components/DateWidget';
import { NavigationContainer } from '@react-navigation/native';


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

        <View style={styles.subtitleContainer}>
          <Text style={styles.monthSubText}>June 2024</Text>
          <Text style={styles.workoutNumberSubText}>{workoutLogs.length} workouts</Text>
          {/* <Ionicons name="caret-forward" size={16} color="gray" /> */}
        </View>

        {/* <View style={styles.workoutLog}>
          <DateWidget day={'Wed'} dateDigit={'9'}></DateWidget>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>Evening Workout</Text>
            <Text style={styles.exerciseName}>1x assisted dips</Text>
            <Text style={styles.exerciseName}>1x assisted dips</Text>
            <Text style={styles.exerciseName}>1x assisted dips</Text>
            <Text style={styles.exerciseName}>1x assisted dips</Text>
            <Text style={styles.exerciseName}>1x assisted dips</Text>
            <Text></Text>
          </View>
        </View> */}

        {/* workout logs */}
        {workoutLogs.map((log, index) => (
          <View key={index} style={styles.workoutLog}>
            <DateWidget day={log.day} dateDigit={log.dateDigit} />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{log.name}</Text>
              {log.exercises.map((exercise, exIndex) => (
                <Text key={exIndex} style={styles.exerciseName}>{exercise}</Text>
              ))}
              <Text></Text>
            </View>
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
  }
});
