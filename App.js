import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/utils/AppContext';
import { AlertProvider } from './src/components/CustomAlert';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonorLoginScreen from './src/screens/DonorLoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import FindScreen from './src/screens/FindScreen';
import DonorsScreen from './src/screens/DonorsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HospitalLoginScreen from './src/screens/HospitalLoginScreen';
import HospitalDashboardScreen from './src/screens/HospitalDashboardScreen';

const Stack = createNativeStackNavigator();

const BG = '#0A0A14';

function AppNavigator() {
  const { user, hospital } = useApp();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG }, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {/* Auth screens — only when not logged in */}
        {!user && !hospital && (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="DonorLogin" component={DonorLoginScreen} />
            <Stack.Screen name="HospitalLogin" component={HospitalLoginScreen} />
          </>
        )}

        {/* Donor screens */}
        {user && (
          <>
            <Stack.Screen name="Main" component={HomeScreen} />
            <Stack.Screen name="Find" component={FindScreen} />
            <Stack.Screen name="Donors" component={DonorsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}

        {/* Hospital screens */}
        {hospital && (
          <>
            <Stack.Screen name="HospitalMain" component={HospitalDashboardScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AlertProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AlertProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
