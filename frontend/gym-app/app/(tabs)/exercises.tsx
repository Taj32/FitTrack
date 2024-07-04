import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet, Button, Alert, Dimensions, Image, TouchableOpacity, Modal } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.1.205:5000';


const App = () => {

  const languages = [
    {
      id: 1,
      title: 'Bench Press',
      imageSource: require('@/assets/images/workouts/benchPress.jpg'),
    },
    {
      id: 2,
      title: 'Squat',
      imageSource: require('@/assets/images/workouts/squat.png'),
    },
    {
      id: 3,
      title: 'Deadlift',
      imageSource: require('@/assets/images/workouts/deadLift.png'),
    },
    {
      id: 4,
      title: 'Pull Up',
      imageSource: require('@/assets/images/workouts/pullup.png'),
    },
    {
      id: 5,
      title: 'Leg Press',
      imageSource: require('@/assets/images/workouts/legPress.png'),
    },
    {
      id: 6,
      title: 'Shoulder Press',
      imageSource: require('@/assets/images/workouts/shoulderPress.png'),
    },
    {
      id: 7,
      title: 'Ab Crunch',
      //imageSource: require('@/assets/images/workouts/abCrunch.png'),
    },
    {
      id: 8,
      title: 'Leg Curl',
      //imageSource: require('@/assets/images/workouts/legCurl.png'),
    },
    {
      id: 9,
      title: 'Leg Extension',
      //imageSource: require('@/assets/images/workouts/legExtension.png'),
    },
    {
      id: 10,
      title: 'Bicep Curl',
      //imageSource: require('@/assets/images/workouts/bicepCurl.png'),
    },
  ];

  const [data, setData] = useState(languages);
  const [searchText, setSearchText] = useState('');

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseData, setExerciseData] = useState([]);

  const fetchExerciseData = async (exerciseName) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/exercises/get?exercise_name=${exerciseName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercise data');
      }
      const data = await response.json();
      return data.map(item => ({
        value: item.weight,
        label: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }));
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      return [];
    }
  };

  const getExerciseStats = (data) => {
    if (!data || data.length === 0) {
      return { pr: '---', weight: '---', volume: '---' };
    }

    let pr = 0;
    let totalVolume = 0;

    data.forEach(item => {
      const weight = Number(item.value);
      if (weight > pr) {
        pr = weight;
      }
      totalVolume += weight;
    });

    return {
      pr: pr.toFixed(1),
      weight: pr.toFixed(1), // Assuming the highest weight is the current weight
      volume: totalVolume.toFixed(1)
    };
  };

  const searchFunction = (text: React.SetStateAction<string>) => {
    setSearchText(text);
    text = text.toLowerCase();
    if (text === "") {
      setData(languages);
    }
    else {
      let filteredLanguages = languages.filter(language => (language.title.toLowerCase().startsWith(text)))
      setData(filteredLanguages);
    }
  }

  const handleExercisePress = async (exercise) => {
    console.log("looking at this");
    setSelectedExercise(exercise);
    const data = await fetchExerciseData(exercise.title);
    console.log(data);
    setExerciseData(data);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleExercisePress(item)}>
      <View style={styles.box}>
        <Image
          source={
            item.imageSource
              ? item.imageSource
              : require('@/assets/images/running-man.png')
          }
          style={styles.exerciseImage}
        />
        <Text style={styles.title}> {item.title} </Text>
      </View>
    </TouchableOpacity>
  );

  const ExerciseModal = () => {
    const stats = getExerciseStats(exerciseData);
    return (
      <Modal
        animationType="slide"
        //transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* <View style={styles.centeredView}> */}
        <View style={styles.modalContainer}>
          {/* <Text style={styles.modalTitle}>{selectedExercise?.title}</Text> */}
          <ThemedText type="title">{selectedExercise?.title}</ThemedText>


          {/* <ThemedText type="subtitle" style="subText">Personal Records</ThemedText> */}

          <Text style={styles.subtext}>Personal Records</Text>
          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>PR</Text>
            <Text>{stats.pr}</Text>
          </View>

          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>Weight</Text>
            <Text>{stats.weight}</Text>
          </View>

          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>Volume</Text>
            <Text>{stats.volume}</Text>
          </View>


          <View style={styles.chart}>
            {/* <ThemedText type="subtitle">{workout.exercise_name}</ThemedText> */}
            {/* <LineChart
                    data={transformedData}
                    curved
                    isAnimated
                    height={150}
                    focusEnabled
                    showTextOnFocus
                    //animateOnDataChange //--> Why was this causing the error?
                    color={workout.color}
                /> */}


            <LineChart
              data={exerciseData}
              width={300}
              height={200}
              curved
              isAnimated
              color={'#C8A2C8'}

            // style={styles.chart}
            />
          </View>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
        {/* </View> */}
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchRow}>
          {/* <View style={styles.buttonContainer}>
            <Button
              onPress={() => Alert.alert('Simple Button pressed')}
              title="New"
              accessibilityLabel="Learn more about this purple button"
            />
          </View> */}
          <Text style={styles.title}>Exercises</Text>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholderTextColor="black"
          placeholder="Search available exercises"
          value={searchText}
          onChangeText={text => searchFunction(text)}
        />
      </View>

      <View style={styles.listDataContainer}>
        <FlatList
          data={data}
          extraData={data}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <ExerciseModal />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', //'#f2f1f6', [change later when have better images]
  },
  searchBarContainer: {
    flex: 1.5,
    backgroundColor: 'white',
    //backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: wp(5.5),
    color: 'black',
  },
  searchBar: {
    width: wp(80),
    height: hp(6),
    borderWidth: wp(0.2),
    borderRadius: wp(3),
    borderColor: '#999999',
    backgroundColor: '#ffffff',
    marginTop: wp(7),
    paddingLeft: wp(4.5),
    fontSize: wp(4),
    color: 'black'
  },
  listDataContainer: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: wp(90), // Replace 'wp' and 'hp' with the appropriate values or functions
    height: hp(20),
    borderWidth: wp(0.2),
    borderColor: 'black',
    flexDirection: 'row', // Add this line to arrange children in a row
    alignItems: 'center', // Centers children vertically
    justifyContent: 'center', // Centers children horizontally
    margin: wp(1)
  },
  searchRow: {
    flexDirection: 'row',
    gap: (width / 4),
    alignItems: 'center',
    //alignItems: 'baseline',
    //alignContent: 'space-evenly',
    //alignItems: 'flex-start',
  },
  newButton: {
    color: 'red',
  },
  exerciseImage: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
    bottom: 0,
    left: 0,
    //position: 'absolute',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
    //paddingVertical: 200,
    backgroundColor: "blue",
    //paddingHorizontal: 0,
    marginTop: 25
  },
  modalContainer: {

    marginTop: 128,
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: '#f2f1f6',
    borderRadius: 30,
    //margin: 70,
    // backgroundColor: '#f2f1f6', //"white",
    // borderRadius: 20,
    // padding: 10,
    // alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  chart: {
    //rowGap: 10,
    borderRadius: 30,
    padding: 16,
    //height: 300,
    backgroundColor: 'white',
    overflow: 'hidden',
    //flex: 1, //'white',//
  },
  subtext: {
    fontSize: 16,
    color: 'gray',
    paddingVertical: 10,
  },
  recordContainer: {
    flexDirection: 'row', alignItems: 'center',
    //paddingHorizontal: 16,
    paddingVertical: 15,
  },
  recordText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: 'black',
  }

});

export default App;