import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet, Button, Alert, Dimensions, Image } from 'react-native';
import { red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

const App = () => {

  const languages = [
    {
      id: 1,
      title: 'Bench',
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

  const renderItem = ({ item }) => (
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
  );

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
          keyExtractor={(item) => item.id}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: 'white', //'#f2f1f6',
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
  }
});

export default App;