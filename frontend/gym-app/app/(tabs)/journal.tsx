import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" >Log</ThemedText>
        {/* <Ionicons name="fitness" size={50} color="black" /> */}
      </ThemedView>

      <View style={styles.subtitleContainer}>
        <Text style={styles.monthSubText}>June 2024</Text>
        <Text style={styles.workoutNumberSubText}>4 workouts</Text>
        {/* <Ionicons name="caret-forward" size={16} color="gray" /> */}
      </View>

      <View style={styles.workoutLog}>
        <Text>hello</Text>
        <Text>hello</Text>
        <Text>hello</Text>
        <Text>hello</Text>
        <Text>hello</Text>
      </View>
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
    paddingTop: 20,
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
    marginVertical: 10,
    marginHorizontal: 10,
    rowGap: 10,
    borderRadius: 30,
    padding: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    //flex: 1, //'white',//
  },
});
