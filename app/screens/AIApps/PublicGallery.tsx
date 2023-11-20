import React, { useEffect, useState } from 'react';
import { View, ScrollView, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { server } from '../../constant';
import Card from '../../components/cards/Card';

const PublicGallery = () => {
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

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${server}/api/v1/post`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setImages(data.data.reverse());
            console.log(data.data);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }, [])
  );

  const renderImages = () => {
    return (images as { _id: string; name: string; prompt: string; photo: string }[]).map((image) => (
      <Card
        key={image._id}
        _id={image._id}
        name={image.name}
        prompt={image.prompt}
        photo={image.photo}
        onDelete={() => { }}
        showDeleteIcon={false}
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

export default PublicGallery;
