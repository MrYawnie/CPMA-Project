import React, { useEffect, useState } from 'react';
import { View, ScrollView, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import Card from '../../components/cards/Card';

const PrivateGallery = () => {
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const screenWidth = Dimensions.get('window').width;

  const openImage = (image: string) => {
    console.log('openImage called with image:', image); // Add this line
    setCurrentImage(image);
    setModalVisible(true);
  };

  const closeImage = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const imagesRef = collection(FIREBASE_DB, 'users', FIREBASE_AUTH.currentUser?.uid || '', 'images');
    const q = query(imagesRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const imagesData = [];
      querySnapshot.forEach((doc) => {
        imagesData.push({ _id: doc.id, ...doc.data() });
      });
      setImages(imagesData.reverse());
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  const deleteImage = async (id: string) => {
    const imageRef = doc(FIREBASE_DB, 'users', FIREBASE_AUTH.currentUser?.uid || '', 'images', id);
    await deleteDoc(imageRef);
  };

  const renderImages = () => {
    return (images as { _id: string; name: string; prompt: string; photo: string }[]).map((image) => (
      <Card
        key={image._id}
        _id={image._id}
        name={image.name}
        prompt={image.prompt}
        photo={image.photo}
        onDelete={() => deleteImage(image._id)}
        showDeleteIcon={true}
        openImage={openImage}
      />
    ));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {renderImages()}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeImage}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.83)' }}>
          <TouchableOpacity onPress={closeImage}>
            <Image source={{ uri: currentImage }} style={{ width: screenWidth, height: '100%' }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default PrivateGallery;