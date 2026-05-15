import React from 'react';
import { StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider, useApp } from './src/utils/AppContext';
import { AlertProvider } from './src/components/CustomAlert';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonorLoginScreen from './src/screens/DonorLoginScreen';
import HospitalLoginScreen from './src/screens/HospitalLoginScreen';

import HomeScreen from './src/screens/HomeScreen';
import FindScreen from './src/screens/FindScreen';
import DonorsScreen from './src/screens/DonorsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HospitalDashboardScreen from './src/screens/HospitalDashboardScreen';

const Stack = createNativeStackNavigator();
const BG = '#0A0A14';

// ─── Error Boundary ────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <Text
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            Tap to Retry
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ─── Loading Screen ────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#E53935" />
    </View>
  );
}

// ─── Navigator (only renders after loading is done) ────
function AppNavigator() {
  const { isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_right',
        }}
      >
        {/* Always available */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Auth flow */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="DonorLogin" component={DonorLoginScreen} />
        <Stack.Screen name="HospitalLogin" component={HospitalLoginScreen} />

        {/* Donor flow */}
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen name="Find" component={FindScreen} />
        <Stack.Screen name="Donors" component={DonorsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Shared */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Hospital flow */}
        <Stack.Screen name="HospitalMain" component={HospitalDashboardScreen} />
      </Stack.Navigator>
    </>
  );
}

// ─── Root App ──────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <AlertProvider>
            <NavigationContainer
              fallback={<LoadingScreen />}
              onStateChange={(state) => {
                // Optional: log navigation state for debugging
                // console.log('Nav state:', state);
              }}
            >
              <AppNavigator />
            </NavigationContainer>
          </AlertProvider>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    overflow: 'hidden',
  },
});