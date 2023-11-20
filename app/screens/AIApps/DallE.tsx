import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import { getRandomPrompt } from '../../utils';
import { server } from '../../constant';
import { collection, addDoc } from 'firebase/firestore';
import { useSettings } from '../Settings';


const CreatePost = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: FIREBASE_AUTH.currentUser?.displayName || 'Anonymous',
    prompt: '',
    photo: '',
  });
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [dalle3, setDalle3] = useState(false);
  const toggleDalle3 = () => setDalle3((previousState) => !previousState);
  const { currentDallE3ImageSize, apiKey } = useSettings();

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);
        const response = await fetch(`${server}/api/v1/dalle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: form.prompt,
            model: dalle3 ? 'dall-e-3' : 'dall-e-2',
            size: dalle3 ? currentDallE3ImageSize : '1024x1024',
            apiKey,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }

        const data = await response.json();

        setForm({ ...form, photo: `data:image/jpeg;base64,${data.photo}` });
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert('Please enter a prompt');
    }
  };

  const handlePublicSubmit = async () => {
    if (form.prompt && form.photo) {
      setLoading(true);

      try {
        const response = await fetch(`${server}/api/v1/post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        await response.json();
        navigation.navigate('Gallery'); // Replace 'Gallery' with the appropriate name of your Gallery component
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter a prompt and generate an image');
    }
  };

  const handlePrivateSubmit = async () => {
    if (form.prompt && form.photo) {
      setLoading2(true);

      try {
        // Send the image data to your server
        const response = await fetch(`${server}/api/v1/post/private`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        // Get the secure URL from the server's response
        const data = await response.json();
        const secureUrl = data.data.photo;

        if (!secureUrl) {
          throw new Error('Secure URL is undefined');
        }

        // Save the secure URL to Firestore
        await addDoc(collection(FIREBASE_DB, 'users', FIREBASE_AUTH.currentUser?.uid || '', 'images'), { ...form, photo: secureUrl });

        alert('Image information saved successfully');

        navigation.navigate('Gallery');
      } catch (err) {
        alert(err);
      } finally {
        setLoading2(false);
      }
    } else {
      alert('Please enter a prompt and generate an image');
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const handleChange = (value: string, field: string) => {
    setForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Create imaginative and visually stunning images through Dall-E AI</Text>
        <View>
          <Text>Your name</Text>
          <TextInput value={FIREBASE_AUTH.currentUser?.displayName} readOnly={true} />
        </View>
        <View style={styles.inputContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Prompt</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 0 }}>
              <Text>Dall-E 2</Text>
              <Switch
                onValueChange={toggleDalle3}
                value={dalle3}
                style={{ marginHorizontal: 10 }}
              />
              <Text>Dall-E 3</Text>
            </View>
          </View>
          <TextInput style={styles.input} value={form.prompt} onChangeText={(value) => handleChange(value, 'prompt')} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 0.5, paddingRight: 5 }}>
            <Button title="Surprise Me" onPress={handleSurpriseMe} />
          </View>
          <View style={{ flex: 0.5, paddingLeft: 5 }}>
            <Button title={generatingImg ? 'Generating...' : 'Generate'} onPress={generateImage} color="green" />
          </View>
        </View>
        <View style={styles.imageContainer}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={{ width: 200, height: 200 }} />
          ) : (
            <Image source={require('../../../assets/preview.png')} style={{ width: 200, height: 200 }} />
          )}

          {generatingImg && (
            <View style={styles.loaderContainer}>
              {/* Add Loader component here */}
            </View>
          )}
        </View>
        <View>
          <Text>Once you have created the image you want, you can share it with others in the community.</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 0.5, paddingRight: 5 }}>
              <Button title={loading ? 'Sharing...' : 'Share publicly'} onPress={handlePublicSubmit} color="green" />
            </View>
            <View style={{ flex: 0.5, paddingLeft: 5 }}>
              <Button title={loading2 ? 'Saving...' : 'Save privately'} onPress={handlePrivateSubmit} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 5,
  },
  button: {
    marginTop: 10,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePost;