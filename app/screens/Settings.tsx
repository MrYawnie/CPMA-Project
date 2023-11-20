import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig'; // Add the function to update profile data
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';
import { server } from '../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context
export const SettingsContext = createContext({
  apiKey: '',
  setApiKey: () => { },
  currentGPT3Model: '',
  setCurrentGPT3Model: () => { },
  currentGPT4Model: '',
  setCurrentGPT4Model: () => { },
  currentDallE3ImageSize: '',
  setCurrentDallE3ImageSize: () => { },
});

FIREBASE_AUTH.onAuthStateChanged(user => {
  if (!user) {
    console.log('User is not signed in');
  } else if (user.isAnonymous) {
    console.log('User is signed in anonymously');
  } else {
    console.log('User is signed in with email: ', user.email);
  }
});

// Create a provider component
export const SettingsProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [currentGPT3Model, setCurrentGPT3Model] = useState('gpt-3.5-turbo-1106');
  const [currentGPT4Model, setCurrentGPT4Model] = useState('gpt-4-1106-preview');
  const [currentDallE3ImageSize, setCurrentDallE3ImageSize] = useState('1024x1024');
  const [models, setModels] = useState([]);

  function getEngines() {
    fetch(`${server}/api/v1/gpt/models`)
      .then(res => res.json())
      .then(data => {
        console.log(data.models.data);
        setModels(data.models.data);
      })
  }

  useEffect(() => {
    getEngines();
    const fetchSettings = async () => {
      try {
        let storedGPT3Model = await AsyncStorage.getItem('currentGPT3Model');
        let storedGPT4Model = await AsyncStorage.getItem('currentGPT4Model');
        let storedDallE3ImageSize = await AsyncStorage.getItem('currentDallE3ImageSize');
        let storedApiKey = await AsyncStorage.getItem('apiKey');

        if (storedGPT3Model !== null) setCurrentGPT3Model(storedGPT3Model);
        if (storedGPT4Model !== null) setCurrentGPT4Model(storedGPT4Model);
        if (storedDallE3ImageSize !== null) setCurrentDallE3ImageSize(storedDallE3ImageSize);
        if (storedApiKey !== null) setApiKey(storedApiKey);

        // If the values are not present, set the defaults
        if (!storedGPT3Model) setCurrentGPT3Model('gpt-3.5-turbo-1106');
        if (!storedGPT4Model) setCurrentGPT4Model('gpt-4-1106-preview');
        if (!storedDallE3ImageSize) setCurrentDallE3ImageSize('1024x1024');
        if (!storedApiKey) {
          const uid = FIREBASE_AUTH.currentUser?.uid;
          if (uid) {
            const docRef = doc(FIREBASE_DB, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              storedApiKey = docSnap.data().apiKey;
              await AsyncStorage.setItem('apiKey', storedApiKey);
              setApiKey(storedApiKey);
            } else {
              console.log('No such document!');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

  fetchSettings();
}, []);

useEffect(() => {
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('apiKey', apiKey);
      await AsyncStorage.setItem('currentGPT3Model', currentGPT3Model);
      await AsyncStorage.setItem('currentGPT4Model', currentGPT4Model);
      await AsyncStorage.setItem('currentDallE3ImageSize', currentDallE3ImageSize);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  saveSettings();
}, [apiKey, currentGPT3Model, currentGPT4Model, currentDallE3ImageSize]);


return (
  <SettingsContext.Provider value={{ apiKey, setApiKey, currentGPT3Model, setCurrentGPT3Model, currentGPT4Model, setCurrentGPT4Model, currentDallE3ImageSize, setCurrentDallE3ImageSize }}>
    {children}
  </SettingsContext.Provider>
);
};

const Settings = () => {
  const { apiKey, setApiKey, currentGPT3Model, setCurrentGPT3Model, currentGPT4Model, setCurrentGPT4Model, currentDallE3ImageSize, setCurrentDallE3ImageSize } = useSettings();
  const gpt3Models = ['gpt-3.5-turbo-1106', 'gpt-3.5-turbo'];
  const gpt4Models = ['gpt-4-1106-preview', 'gpt-4'];
  const [models, setModels] = useState([]);

  function getEngines() {
    fetch(`${server}/api/v1/gpt/models`)
      .then(res => res.json())
      .then(data => {
        console.log(data.models.data);
        setModels(data.models.data);
      })
  }

  useEffect(() => {
    getEngines();
    const fetchSettings = async () => {
      let storedApiKey = await AsyncStorage.getItem('apiKey');
      if (!storedApiKey) {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (uid) {
          const docRef = doc(FIREBASE_DB, 'users', uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            storedApiKey = docSnap.data().apiKey;
            await AsyncStorage.setItem('apiKey', storedApiKey);
          } else {
            console.log('No such document!');
          }
        }
      }
      setApiKey(storedApiKey);
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  const handleSave = () => {
    // Update the API key in Firestore
    const uid = FIREBASE_AUTH.currentUser?.uid;
    if (uid) {
      const docRef = doc(FIREBASE_DB, 'users', uid);
      setDoc(docRef, { apiKey })
        .then(() => {
          console.log('API key updated in Firestore:', apiKey);
        })
        .catch((error) => {
          console.error('Error updating API key:', error);
        });
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

  // Rest of your code...

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey, currentGPT3Model, setCurrentGPT3Model, currentGPT4Model, setCurrentGPT4Model, currentDallE3ImageSize, setCurrentDallE3ImageSize }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 24, marginVertical: 10 }}>Settings</Text>
        <View>
          <Text>Username: {FIREBASE_AUTH.currentUser?.displayName}</Text>
          <Text>Email: {FIREBASE_AUTH.currentUser?.email}</Text>
          <Text>API Key: {apiKey} </Text>
        </View>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, margin: 10 }}
          onChangeText={text => setApiKey(text)}
          value={apiKey}
          placeholder="Enter OpenAI API Key"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: '50%' }}>
            <Button onPress={testApiKey} title="Test API Key" />
          </View>
          <View style={{ width: '50%' }}>
            <Button onPress={handleSave} title="Save" color="green" />
          </View>
        </View>
        <View>
          <Text style={{ fontWeight: '500', fontSize: 18, marginVertical: 10 }}>ChatGPT settings</Text>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text>GPT-3 model</Text>
              <Dropdown
                style={{ width: 200, height: 40 }}
                data={models.filter(model => model.id.includes('gpt-3')).map(model => ({ label: model.id, value: model.id }))}
                placeholder="Select GPT-3 model"
                maxHeight={300}
                labelField="label"
                valueField="value"
                value={currentGPT3Model}
                onChange={(selected) => {
                  console.log("GPT-3 model selected: ", selected.value);
                  setCurrentGPT3Model(selected.value);
                }}
              />
            </View>
            <View>
              <Text>GPT-4 model</Text>
              <Dropdown
                style={{ width: 200, height: 40 }}
                data={models.filter(model => model.id.includes('gpt-4')).map(model => ({ label: model.id, value: model.id }))}
                placeholder="Select GPT-4 model"
                maxHeight={300}
                labelField="label"
                valueField="value"
                value={currentGPT4Model}
                onChange={(selected) => {
                  console.log("GPT-4 model selected: ", selected.value);
                  setCurrentGPT4Model(selected.value);
                }}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontWeight: '500', fontSize: 18, marginVertical: 10 }}>Dall-E settings</Text>
            <Text>Dall-E 3 image size</Text>
            <Dropdown
              style={{ width: 200, height: 40 }}
              data={[
                { label: '1024x1024', value: '1024x1024' },
                { label: '1024x1792', value: '1024x1792' },
                { label: '1792x1024', value: '1792x1024' },
              ]}
              placeholder="Select Dall-E 3 image size"
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={currentDallE3ImageSize}
              onChange={(selected) => {
                console.log("Dall-E 3 image size selected: ", selected.value);
                setCurrentDallE3ImageSize(selected.value);
              }}
            />
          </View>

        </View>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
        </View>
      </SafeAreaView>
    </SettingsContext.Provider>
  );
};

export default Settings;

export const useSettings = () => {
  return useContext(SettingsContext);
};