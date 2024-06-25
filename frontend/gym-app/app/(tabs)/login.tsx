import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Alert, Button, Pressable, SafeAreaView, Switch, Text, TextInput, View } from 'react-native'
import { useState } from 'react';


const logo = require("@/assets/images/adaptive-icon.png")
const google = require("@/assets/images/google.png")
const apple = require("@/assets/images/apple-logo.png")
const instagram = require("@/assets/images/instagram.png")

const API_URL = Platform.OS === 'ios' ? 'http://localhost:5000' : 'http://10.0.2.2:5000';





export default function LoginForm() {
  const [click, setClick] = useState(false);

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

  const onLoggedIn = (token: any) => {
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
    console.log('API_URL:', API_URL);
    const payload = {
      email,
      name,
      password,
    };
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
        console.error('Fetch error:', err);
        console.error('Error details:', err.message);
        setIsError(true);
        setMessage('Network request failed. Please check your connection.');
      });
  };

  const getMessage = () => {
    const status = isError ? `Error: ` : `Success: `;
    return status + message;
  }




  return (
    <SafeAreaView style={styles.container}>

      <Image source={logo} style={styles.image} resizeMode='contain' />
      <Text style={styles.title}>App Name</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder='EMAIL OR USERNAME'
          autoCorrect={false}
          autoCapitalize='none'
          value={email}
          onChangeText={setEmail}
        />
        <TextInput style={styles.input} placeholder='PASSWORD' secureTextEntry value={password} onChangeText={setPassword} autoCorrect={false}
          autoCapitalize='none' />
      </View>
      <View style={styles.rememberView}>
        <View style={styles.switch}>
          <Switch value={click} onValueChange={setClick} trackColor={{ true: "green", false: "gray" }} />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
        <View>
          <Pressable onPress={() => Alert.alert("Forget Password!")}>
            <Text style={styles.forgetText}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmitHandler}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>
        {message ? (
          <Text style={{
            fontSize: 16,
            color: isError ? 'red' : 'green',
            marginTop: 10,
          }}>
            {getMessage()}
          </Text>
        ) : null}
        <Text style={styles.optionsText}>OR LOGIN WITH</Text>
      </View>

      <View style={styles.mediaIcons}>
        <Image source={google} style={styles.icons} />
        <Image source={instagram} style={styles.icons} />
        <Image source={apple} style={styles.icons} />
      </View>

      <Text style={styles.footerText}>Don't Have Account?<Text style={styles.signup}>  Sign Up</Text></Text>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 70,
    backgroundColor: '#f2f1f6',
    flex: 1,
    flexGrow: 1,
  },
  image: {
    marginTop: 40,
    maxHeight: 200
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "black"
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center"

  },
  rememberText: {
    fontSize: 13
  },
  forgetText: {
    fontSize: 11,
    color: "black"
  },
  button: {
    backgroundColor: "black",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50
  },
  optionsText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "gray",
    fontSize: 13,
    marginBottom: 6
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23
  },
  icons: {
    width: 40,
    height: 40,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
  },
  signup: {
    color: "black",
    fontSize: 13
  }
})
