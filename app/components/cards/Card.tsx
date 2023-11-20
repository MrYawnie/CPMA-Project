import * as React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { saveAsImage } from '../../utils'; // Assuming you have a saveAsImage function in your utils file

interface CardProps {
  _id: string;
  name: string;
  prompt: string;
  photo: string;
  onDelete: () => void;
  showDeleteIcon: boolean;
  openImage?: (image: string) => void;
}

const Card: React.FC<CardProps> = ({ _id, name, prompt, photo, onDelete, showDeleteIcon, openImage }) => {
  const downloadImage = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + `${_id}.jpg`;
      await FileSystem.downloadAsync(photo, fileUri);
      saveAsImage(fileUri);
      console.log('Image saved to', fileUri);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <View style={{ borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#ffffff', margin: 10 }}>
      <TouchableOpacity onPress={() => openImage(photo)}>
        <Image
          style={{ width: '100%', height: 200, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          source={{ uri: photo }} resizeMode='cover'
        />
      </TouchableOpacity>
      <View style={{ flex: 1, backgroundColor: '#10131f', padding: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, marginBottom: 10 }}>{prompt}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#ffffff', fontSize: 14, marginLeft: 5 }}>{name}</Text>
          </View>
          {showDeleteIcon && (
            <TouchableOpacity onPress={onDelete} style={{ backgroundColor: 'transparent', borderWidth: 0 }}>
              <Ionicons name="trash-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={downloadImage} style={{ backgroundColor: 'transparent', borderWidth: 0 }}>
            <Ionicons name="md-download" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Card;
