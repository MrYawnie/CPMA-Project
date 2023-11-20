import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatGPT from './AIApps/ChatGPT';
import DallE from './AIApps/DallE';
import GalleryWrapper from './GalleryWrapper';

const Tab = createMaterialTopTabNavigator();

export default function AIWrapper() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator>
                <Tab.Screen name="ChatGPT" component={ChatGPT} />
                <Tab.Screen name="Dall-E" component={DallE} />
                <Tab.Screen name="Gallery" component={GalleryWrapper} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}