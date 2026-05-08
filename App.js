import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BG = '#0A0A14';
const RED = '#DC143C';
const TEXT3 = '#606078';

function DonorTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: 'rgba(10,10,20,0.96)', borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1, height: 65, paddingBottom: 8, paddingTop: 6, elevation: 0 },
      tabBarActiveTintColor: RED, tabBarInactiveTintColor: TEXT3,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarIcon: ({ color }) => {
        const icons = { Home: 'home', Find: 'search', Donors: 'people', Profile: 'person' };
        return <MaterialIcons name={icons[route.name]} size={24} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Find" component={FindScreen} />
      <Tab.Screen name="Donors" component={DonorsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

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

        {/* Donor screens — NO NewRequest, donors only view/accept */}
        {user && (
          <>
            <Stack.Screen name="Main" component={DonorTabs} />
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
    <AppProvider>
      <AlertProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AlertProvider>
    </AppProvider>
  );
}
