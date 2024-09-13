import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, StatusBar, ImageBackground, TouchableOpacity } from 'react-native';

import { Text, TextInput, View } from 'react-native'
import { useState, lazy, Suspense } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



const logo = require("@/public/images/adaptive-icon.png")
const google = require("@/public/images/google.png")
const apple = require("@/public/images/apple-logo.png")
const instagram = require("@/public/images/instagram.png")

//const API_URL = 'http://localhost:5000'; //Platform.OS === 'ios' ? 'http://localhost:5000' : 'http://10.0.2.2:5000';
//const API_URL = 'http://192.168.1.205:5000';
const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';



export default function LoginForm() {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const onChangeHandler = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  const fetchName = async (token: any) => {
    try {
      console.log('Fetching name with token:', token);
      const response = await fetch(`${API_URL}/auth/getName`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Name fetch response status:', response.status);
      const responseText = await response.text();
      console.log('Name fetch response text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Parsed name data:', data);
        return data.name;
      } else {
        console.error('Failed to fetch user name');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      return null;
    }
  };

  const onLoggedIn = async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token stored successfully');

      const userName = await fetchName(token);
      if (userName) {
        await AsyncStorage.setItem('userName', userName);
        console.log('Name stored successfully:', userName);
      }

      console.log('About to navigate to home');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error in onLoggedIn:', error);
    }
  };

  const onSubmitHandler = () => {
    const payload = {
      email,
      name,
      password,
    };
    fetch(`${API_URL}/${isLogin ? 'auth/login' : 'auth/signup'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        const textResponse = await res.text(); // Get the raw text response
        console.log('Raw response:', textResponse); // Log the raw response
        try {
          const jsonRes = JSON.parse(textResponse); // Try to parse it as JSON
          if (res.status !== 200) {
            setIsError(true);
            setMessage(jsonRes.message);
          } else {
            setIsError(false);
            setMessage(jsonRes.message);
            onLoggedIn(jsonRes.token);
          }
        } catch (err) {
          console.log('Error parsing JSON:', err);
          console.log('Response that caused the error:', textResponse);
        };
      })
      .catch(err => {
        console.log("Network request failed", err);
      });
  };

  const getMessage = () => {
    const status = isError ? `Error: ` : `Success: `;
    return status + message;
  }


  return (
    <View style={styles.container}>
      <ImageBackground source={require('@/public/images/download.jpg')} style={styles.image}>
        <View style={styles.card}>
          <Text style={styles.heading}>{isLogin ? 'Login' : 'Signup'}</Text>
          <View style={styles.form}>
            <View style={styles.inputs}>
              <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail}></TextInput>
              {!isLogin && <TextInput style={styles.input} placeholder="Name" onChangeText={setName}></TextInput>}
              <TextInput secureTextEntry={true} style={styles.input} placeholder="Password" onChangeText={setPassword}></TextInput>
              <Text style={[styles.message, { color: isError ? 'red' : 'green' }]}>{message ? getMessage() : null}</Text>
              <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonAlt} onPress={onChangeHandler}>
                <Text style={styles.buttonAltText}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: '80%',
    marginTop: '40%',
    borderRadius: 20,
    maxHeight: 380,
    paddingBottom: '30%',
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: '10%',
    marginTop: '5%',
    marginBottom: '30%',
    color: 'black',
  },
  form: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: '5%',
  },
  inputs: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10%',
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingTop: 10,
    fontSize: 16,
    minHeight: 40,
  },
  button: {
    width: '80%',
    backgroundColor: 'black',
    height: 40,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400'
  },
  buttonAlt: {
    width: '80%',
    borderWidth: 1,
    height: 40,
    borderRadius: 50,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonAltText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
  },
  message: {
    fontSize: 16,
    marginVertical: '5%',
  },
});
