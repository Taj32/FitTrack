import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet, Button, Alert, Dimensions, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');
//const API_URL = 'http://192.168.1.205:5000';
const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';



const App = () => {

  const exercises: any[] | (() => any[]) = [];

  const [data, setData] = useState(exercises);
  const [dynamicExercises, setDynamicExercises] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseData, setExerciseData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchAllExercises();
  }, []);

  const fetchAllExercises = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/exercises/getAll`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const exercises = await response.json();
      setData(exercises);
      setAllExercises(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      Alert.alert('Error', 'Failed to fetch exercises. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchExerciseData = async (exerciseName) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token);

      const url = `${API_URL}/exercises/get?exercise_name=${encodeURIComponent(exerciseName)}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(response.headers));

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Error response body:', JSON.stringify(responseData));
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message}`);
      }

      console.log('Received data:', JSON.stringify(responseData));

      if (!Array.isArray(responseData) || responseData.length === 0) {
        console.log('No exercise data found');
        return [];
      }

      return responseData.map(item => ({
        value: parseFloat(item.weight),
        label: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }));
    } catch (error) {
      console.error('Error in fetchExerciseData:', error);
      Alert.alert('Error', 'Failed to fetch exercise data. Please try again later.');
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

  const searchFunction = (text) => {
    console.log("text: ", text);
    setSearchText(text);
    if (text) {
      const filtered = data.filter(exercise =>
        exercise.title.toLowerCase().includes(text.toLowerCase())
      );
      setData(filtered);
    } else {
      setData(allExercises);
    }
  };


  const handleExercisePress = async (exercise) => {
    setSelectedExercise(exercise);
    let data;
    if (exercise.isDynamic) {
      data = exercise.apiData;
    } else {
      data = await fetchExerciseData(exercise.title);
    }
    setExerciseData(data);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleExercisePress(item)}>
      <View style={styles.box}>
        <Image
          source={require('@/public/images/running-man.png')}
          style={styles.exerciseImage}
        />
        <Text style={styles.title}>{item.title}</Text>
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
        <View style={styles.modalContainer}>
          <ThemedText type="title">{selectedExercise?.title}</ThemedText>
          <Text style={styles.subtext}>Personal Records</Text>
          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>PR</Text>
            <Text>{stats.pr}</Text>
          </View>

          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>Average weight</Text>
            <Text>{(stats.weight - 40)}</Text>
          </View>

          <View style={styles.recordContainer}>
            <Text style={styles.recordText}>Total Volume moved</Text>
            <Text>{stats.volume}</Text>
          </View>


          <View style={styles.chart}>

            <LineChart
              data={exerciseData}
              width={300}
              height={200}
              curved
              isAnimated
              color={'#C8A2C8'}

            />
          </View>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    );
  }

  return (

    <SafeAreaView style={styles.container}>


      {/* <View style={styles.listDataContainer}>
        <FlatList
          data={[...data,]}
          extraData={[data]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <ExerciseModal /> */}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (

        <><View style={styles.searchBarContainer}>
          <View style={styles.searchRow}>
            {/* <ThemedText type="title" >Log</ThemedText> */}
            <Text style={styles.pageTitle}>Exercises</Text>

          </View>

          <TextInput
            style={styles.searchBar}
            placeholderTextColor="black"
            placeholder="Search available exercises"
            value={searchText}
            onChangeText={text => searchFunction(text)} />
        </View>
          <View style={styles.listDataContainer}>
            <FlatList
              data={[...data,]}
              extraData={[data]}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()} />
          </View>
          <ExerciseModal /> 
        </>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f1f6', //'#f2f1f6', [change later when have better images]
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1.25,
    //backgroundColor: 'red',
    backgroundColor: '#f2f1f6',
    //backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    //fontSize: wp(7),
    fontSize: 32,
    fontWeight: 'bold',
    //lineHeight: 16,
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
    backgroundColor: '#f2f1f6 ',
  },
  box: {
    width: wp(90), // Replace 'wp' and 'hp' with the appropriate values or functions
    height: hp(20),
    marginBottom: 10,
    //borderWidth: wp(0.2),
    //borderColor: 'red',
    borderRadius: 30,
    backgroundColor: 'white',
    flexDirection: 'row', // Add this line to arrange children in a row
    alignItems: 'center', // Centers children vertically
    justifyContent: 'center', // Centers children horizontally
    margin: wp(1)
  },
  searchRow: {
    flexDirection: 'row',
    gap: (width / 4),
    alignItems: 'center',

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
    backgroundColor: "blue",
    marginTop: 25
  },
  modalContainer: {

    marginTop: 128,
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: '#f2f1f6',
    borderRadius: 30,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  chart: {
    borderRadius: 30,
    padding: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  subtext: {
    fontSize: 16,
    color: 'gray',
    paddingTop: 20,
    paddingBottom: 10,
    //paddingBottom: 1
    //paddingVertical: 12,
  },
  recordContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9,
  },
  recordText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: 'black',
  }
});

export default App;