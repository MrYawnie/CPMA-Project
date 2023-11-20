import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import PublicGallery from './AIApps/PublicGallery';
import PrivateGallery from './AIApps/PrivateGallery';

const Tab = createMaterialTopTabNavigator();

export default function GalleryWrapper() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Private Gallery" component={PrivateGallery} />
            <Tab.Screen name="Public Gallery" component={PublicGallery} />
        </Tab.Navigator>
    );
}