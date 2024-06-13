import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const App = () => {

  const languages = [
    {
      id: 1,
      title: 'Python',
    },
    {
      id: 2,
      title: 'Java',
    },
    {
      id: 3,
      title: 'C++',
    },
    {
      id: 4,
      title: 'JavaScript',
    },
    {
      id: 5,
      title: 'Ruby',
    },
    {
      id: 6,
      title: 'Scala',
    },
    {
      id: 7,
      title: 'Rust',
    },
    {
      id: 8,
      title: 'Perl',
    },
    {
      id: 9,
      title: 'Swift',
    },
    {
      id: 10,
      title: 'TypeScript',
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
      <Text style={styles.title}> { item.title } </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Text style={styles.title}> Programming Languages </Text>
        <TextInput 
          style={styles.searchBar}
          placeholderTextColor="black"
          placeholder="Search available languages"
          value={searchText}
          onChangeText={text => searchFunction(text)}
        />
      </View>
      <View style={styles.listDataContainer}>
        <FlatList
          data={ data }
          extraData={ data }
          showsVerticalScrollIndicator={ false }
          renderItem={ renderItem }
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flex: 1.5,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  box: {
    width: wp(90),
    height: hp(20),
    borderWidth: wp(0.2),
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp(1)
  },
});

export default App;