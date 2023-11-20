import { View, Text, StyleSheet, TextInput, Button, KeyboardAvoidingView, Alert, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, signInAnonymously, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const backgroundImage = require('../../assets/background.jpg');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login failed', error.message);
    } finally {

    }
  };

  const handleSignInAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login failed', error.message);
    } finally {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: 'Anonymous' });
        // Store the username and API key in Firestore
        const usersRef = doc(FIREBASE_DB, 'users', auth.currentUser.uid || '');
        await setDoc(usersRef, {
          apiKey: '',
          username: 'Anonymous',
        });
      }
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.image}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior='padding'>
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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <View style={{ width: '50%' }}>
              <Button title='Anonymous' onPress={handleSignInAnonymously} color='orange' />
            </View>
            <View style={{ width: '50%' }}>
              <Button title='Login' onPress={handleSignIn} color='green' />
            </View>
          </View>

          <Text style={{ marginTop: 15, alignItems: 'center', textAlign: 'center' }}>Not a user yet? Swipe left to register!</Text>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
    opacity: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.8,
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