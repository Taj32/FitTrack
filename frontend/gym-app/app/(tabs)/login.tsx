import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, StatusBar, ImageBackground, TouchableOpacity } from 'react-native';

import { Alert, Button, Pressable, SafeAreaView, Switch, Text, TextInput, View } from 'react-native'
import { useState } from 'react';


const logo = require("@/assets/images/adaptive-icon.png")
const google = require("@/assets/images/google.png")
const apple = require("@/assets/images/apple-logo.png")
const instagram = require("@/assets/images/instagram.png")

//const API_URL = 'http://localhost:5000'; //Platform.OS === 'ios' ? 'http://localhost:5000' : 'http://10.0.2.2:5000';
const API_URL = 'http://192.168.1.204:5000';




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

    const onLoggedIn = token => {
        fetch(`${API_URL}/private`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status === 200) {
                    setMessage(jsonRes.message);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const onSubmitHandler = () => {
        const payload = {
            email,
            name,
            password,
        };
        console.log("API URL:", `${API_URL}/${isLogin ? 'login' : 'signup'}`);
        console.log("Payload:", payload);
        fetch(`${API_URL}/${isLogin ? 'login' : 'signup'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setIsError(true);
                    setMessage(jsonRes.message);
                } else {
                    onLoggedIn(jsonRes.token);
                    setIsError(false);
                    setMessage(jsonRes.message);
                }
            } catch (err) {
                console.log(err);
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
      <ImageBackground source={require('@/assets/images/download.jpg')} style={styles.image}>
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

  // container: {
  //   alignItems: "center",
  //   paddingTop: 70,
  //   backgroundColor: '#f2f1f6',
  //   flex: 1,
  //   flexGrow: 1,
  // },
  // image: {
  //   marginTop: 40,
  //   maxHeight: 200
  // },
  // title: {
  //   fontSize: 30,
  //   fontWeight: "bold",
  //   textTransform: "uppercase",
  //   textAlign: "center",
  //   paddingVertical: 40,
  //   color: "black"
  // },
  // inputView: {
  //   gap: 15,
  //   width: "100%",
  //   paddingHorizontal: 40,
  //   marginBottom: 5
  // },
  // input: {
  //   height: 50,
  //   paddingHorizontal: 20,
  //   borderColor: "black",
  //   borderWidth: 1,
  //   borderRadius: 7
  // },
  // rememberView: {
  //   width: "100%",
  //   paddingHorizontal: 50,
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   flexDirection: "row",
  //   marginBottom: 8
  // },
  // switch: {
  //   flexDirection: "row",
  //   gap: 1,
  //   justifyContent: "center",
  //   alignItems: "center"

  // },
  // rememberText: {
  //   fontSize: 13
  // },
  // forgetText: {
  //   fontSize: 11,
  //   color: "black"
  // },
  // button: {
  //   backgroundColor: "black",
  //   height: 45,
  //   borderColor: "gray",
  //   borderWidth: 1,
  //   borderRadius: 5,
  //   alignItems: "center",
  //   justifyContent: "center"
  // },
  // buttonText: {
  //   color: "white",
  //   fontSize: 18,
  //   fontWeight: "bold"
  // },
  // buttonView: {
  //   width: "100%",
  //   paddingHorizontal: 50
  // },
  // optionsText: {
  //   textAlign: "center",
  //   paddingVertical: 10,
  //   color: "gray",
  //   fontSize: 13,
  //   marginBottom: 6
  // },
  // mediaIcons: {
  //   flexDirection: "row",
  //   gap: 15,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginBottom: 23
  // },
  // icons: {
  //   width: 40,
  //   height: 40,
  // },
  // footerText: {
  //   textAlign: "center",
  //   color: "gray",
  // },
  // signup: {
  //   color: "black",
  //   fontSize: 13
  // }
});
