// utils/index.ts
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { surpriseMePrompts } from '../constant';

export function getRandomPrompt(prompt: string): string {
  const randomIndex = Math.floor(Math.random() * surpriseMePrompts.length);
  const randomPrompt = surpriseMePrompts[randomIndex];

  if (randomPrompt === prompt) return getRandomPrompt(prompt);

  return randomPrompt;
}

export async function downloadImage(_id: string, photo: string): Promise<void> {
  try {
    const fileUri = FileSystem.documentDirectory + `download-${_id}.png`;
    await FileSystem.downloadAsync(photo, fileUri);
  } catch (error) {
    // Handle any potential errors here
    console.error('Error while downloading image:', error);
  }
}

export const saveAsImage = async (fileUri: string) => {
  try {
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync('OpenAI-Playground', asset, false);
    alert('Image saved to gallery successfully!');
  } catch (error) {
    console.error('Error saving image to gallery:', error);
  }
};



