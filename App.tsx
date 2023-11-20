import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Login from './app/screens/Login';
import AIWrapper from './app/screens/AIWrapper';
import Settings, { SettingsProvider } from './app/screens/Settings';
import { User, onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SignUp from './app/screens/SignUp';

const Stack = createNativeStackNavigator();
const InsideTab = createMaterialBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

function InsideLayout() {
  return (
    <InsideTab.Navigator>
      <InsideTab.Screen
        name="AI Apps"
        component={AIWrapper}
        options={{
          tabBarIcon: () => (
            <MaterialCommunityIcons name="robot-outline" size={24} color="black" />
          ),
        }}
      />
      <InsideTab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: () => (
            <Feather name="settings" size={24} color="black" />
          ),
        }}
      />
    </InsideTab.Navigator>
  );
}

function LoginLayout() {
  return (
    <TopTab.Navigator
      initialRouteName='Login'
      screenOptions={{
        tabBarStyle: { marginTop: 20 },
      }}
    >
      <TopTab.Screen name="Login" component={Login} />
      <TopTab.Screen name="Register" component={SignUp} />
    </TopTab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('User', user);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function hideSplashScreen() {
      await SplashScreen.preventAutoHideAsync();
      if (!loading) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='LoginLayout'>
          {user ? (
            <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="LoginLayout" component={LoginLayout} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
