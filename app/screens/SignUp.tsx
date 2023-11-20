import { View, StyleSheet, TextInput, Button, KeyboardAvoidingView, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';

const backgroundImage = require('../../assets/background.jpg');

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');

  const auth = FIREBASE_AUTH;


  const handleSignUp = async () => {
    if (!email || !password || !password2 || !username) {
      Alert.alert('Missing information', 'Please fill all the fields.');
      return;
    }

    if (password !== password2) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      if (username && email && password === password2 && password.length >= 6) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update the user's display name
        await updateProfile(userCredential.user, { displayName: username });

        // Store the username and API key in Firestore
        await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
          apiKey: apiKey || '',
          username,
        });

        // Display a success message
        Alert.alert('Registration successful');
      } else {
        /* Alert.alert('Missing information', 'Please provide both username and API key.'); */
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert('Registration failed', error.message);
    }
  };

  const testApiKey = async () => {
    if (apiKey === 'SecretTestAPIKey') {
      alert('API key is correct');
      return;
    } else {
      const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: 'API Key test',
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        alert('API key is correct');
      } else {
        alert('API key is incorrect');
      }

      const data = await response.json();
      console.log('Test API response:', data);
    }
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.image}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior='padding'>
          <TextInput
            value={username}
            style={styles.input}
            placeholder='Username'
            autoCapitalize='none'
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            value={email}
            style={styles.input}
            placeholder='Email'
            autoCapitalize='none'
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            secureTextEntry
            value={password}
            style={styles.input}
            placeholder='Password'
            autoCapitalize='none'
            onChangeText={(text) => setPassword(text)}
          />
          <TextInput
            secureTextEntry
            value={password2}
            style={styles.input}
            placeholder='Confirm password'
            autoCapitalize='none'
            onChangeText={(text) => setPassword2(text)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TextInput
              secureTextEntry
              value={apiKey}
              style={[styles.input, { flex: 1 }]} // Add flex: 1 to the style
              placeholder='OpenAI API Key (optional)'
              autoCapitalize='none'
              onChangeText={(text) => setApiKey(text)}
            />
            <TouchableOpacity onPress={testApiKey} style={{ backgroundColor: 'transparent', borderWidth: 0, marginLeft: 10 }}>
              <FontAwesome5 name="sync-alt" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Button title='Register' onPress={handleSignUp} />

        </KeyboardAvoidingView>
      </View>
    </ImageBackground >
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
    opacity: 1,
    transform: [{ scaleX: -1 }],
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.8,
    transform: [{ scaleX: -1 }],
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
});