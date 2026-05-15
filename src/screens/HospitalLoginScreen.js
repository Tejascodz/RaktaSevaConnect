import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';
import { validatePhone, validatePassword } from '../utils/AppContext';

export default function HospitalLoginScreen({ navigation }) {
  const { loginHospitalAuth, registerHospital } = useApp();
  const { showAlert, showToast } = useAlert();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [hName, setHName] = useState('');
  const [hCity, setHCity] = useState('');
  const [hPhone, setHPhone] = useState('');
  const [hEmail, setHEmail] = useState('');
  const [hPass, setHPass] = useState('');

  const handleLogin = async () => {
    if (!code || !password) {
      showAlert('Missing Fields', 'Please enter hospital code and password.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await loginHospitalAuth(code, password);
      if (result.success) {
        showToast(`Welcome back, ${result.hospital.name}! 🏥`);
        navigation.replace('HospitalMain');
      } else {
        showAlert('Login Failed', result.error || 'Invalid hospital code or password.');
      }
    } catch (e) {
      showAlert('Error', 'Login failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!hName || hName.trim().length < 3) {
      showAlert('Invalid Name', 'Please enter a valid hospital name.');
      return;
    }
    if (!hCity || hCity.trim().length < 2) {
      showAlert('Invalid City', 'Please enter your city.');
      return;
    }
    
    const phoneResult = validatePhone(hPhone);
    if (!phoneResult.valid) {
      showAlert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    const passResult = validatePassword(hPass);
    if (!passResult.valid) {
      showAlert('Weak Password', passResult.error);
      return;
    }

    setLoading(true);
    try {
      const result = await registerHospital({
        name: hName.trim(),
        city: hCity.trim(),
        phone: phoneResult.phone,
        email: hEmail.trim(),
        password: hPass
      });
      if (result.success) {
        showAlert(
          'Registration Successful! 🏥', 
          `Your Hospital Code: ${result.code}\n\nSave this code for future logins.`,
          [{ text: 'Continue', onPress: () => navigation.replace('HospitalMain') }]
        );
      } else {
        showAlert('Registration Failed', result.error || 'Something went wrong.');
      }
    } catch (e) {
      showAlert('Error', 'Registration failed. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <View style={styles.hospIcon}>
            <MaterialIcons name="local-hospital" size={40} color={COLORS.blue} />
          </View>
          <Text style={styles.h1}>Hospital Portal</Text>
          <Text style={styles.sub}>Manage emergency blood requests</Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, tab === 'login' && styles.tabActive]}
              onPress={() => setTab('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'register' && styles.tabActive]}
              onPress={() => setTab('register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {tab === 'login' ? (
            <>
              <Text style={styles.label}>HOSPITAL CODE *</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="e.g. SAH001"
                placeholderTextColor={COLORS.text3}
                autoCapitalize="characters"
              />
              <Text style={styles.label}>PASSWORD *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={COLORS.text3}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="login" size={20} color="#fff" />
                    <Text style={styles.submitText}>Login to Dashboard</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>HOSPITAL NAME *</Text>
              <TextInput style={styles.input} value={hName} onChangeText={setHName} placeholder="Enter hospital name" placeholderTextColor={COLORS.text3} />
              <Text style={styles.label}>CITY / TALUKA *</Text>
              <TextInput style={styles.input} value={hCity} onChangeText={setHCity} placeholder="e.g. Pune" placeholderTextColor={COLORS.text3} />
              <Text style={styles.label}>PHONE NUMBER *</Text>
              <TextInput style={styles.input} value={hPhone} onChangeText={setHPhone} placeholder="10-digit number" placeholderTextColor={COLORS.text3} keyboardType="phone-pad" maxLength={13} />
              <Text style={styles.label}>EMAIL (optional)</Text>
              <TextInput style={styles.input} value={hEmail} onChangeText={setHEmail} placeholder="hospital@email.com" placeholderTextColor={COLORS.text3} keyboardType="email-address" />
              <Text style={styles.label}>CREATE PASSWORD *</Text>
              <TextInput style={styles.input} value={hPass} onChangeText={setHPass} placeholder="Create password" placeholderTextColor={COLORS.text3} secureTextEntry />

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="add-business" size={20} color="#fff" />
                    <Text style={styles.submitText}>Register Hospital</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  hospIcon: { width: 70, height: 70, borderRadius: 20, backgroundColor: COLORS.blueLight, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  h1: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.text2, textAlign: 'center', marginBottom: 24 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.full, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.blue },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.text3 },
  tabTextActive: { color: '#fff' },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 14, fontSize: 15, color: COLORS.text },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blue, borderRadius: RADIUS.full, paddingVertical: 16, marginTop: 28, elevation: 6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});




