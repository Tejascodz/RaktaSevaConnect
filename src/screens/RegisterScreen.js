import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS } from '../data/mockData';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';
import { validatePhone, validatePassword } from '../utils/AppContext';

export default function RegisterScreen({ navigation }) {
  const { registerDonor } = useApp();
  const { showAlert, showToast } = useAlert();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [blood, setBlood] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || name.trim().length < 2) { showAlert('Invalid Name', 'Please enter your full name (at least 2 characters).'); return; }
    
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) { showAlert('Invalid Phone', 'Please enter a valid 10-digit Indian phone number.\n\nExample: 9876543210'); return; }
    
    const passResult = validatePassword(password);
    if (!passResult.valid) { showAlert('Weak Password', passResult.error); return; }
    
    if (!blood) { showAlert('Missing Field', 'Please select your blood group.'); return; }
    if (!city || city.trim().length < 2) { showAlert('Missing Field', 'Please enter your city (at least 2 characters).'); return; }

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      showAlert('Invalid Date', 'Please enter date in YYYY-MM-DD format.\n\nExample: 2025-06-15');
      return;
    }

    setLoading(true);
    try {
      const result = await registerDonor({ name: name.trim(), phone: phoneResult.phone, password, blood, lastDonation: date || '2025-01-01', city: city.trim(), available: true });
      if (result.success) {
        showToast(`Welcome ${name.trim()}! Registration successful 🩸`);
        // Navigation handled automatically by App.js auth state
      } else {
        showAlert('Registration Failed', result.error || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      showAlert('Error', 'Registration failed. Please check your internet connection.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={styles.h1}>Join the Network</Text>
        <Text style={styles.sub}>Register to save lives in your community</Text>

        <Text style={styles.label}>FULL NAME *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={COLORS.text3} />

        <Text style={styles.label}>PHONE NUMBER *</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="10-digit phone number" placeholderTextColor={COLORS.text3} keyboardType="phone-pad" maxLength={13} />

        <Text style={styles.label}>CREATE PASSWORD *  (min 4 characters)</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Create a strong password" placeholderTextColor={COLORS.text3} secureTextEntry />

        <Text style={styles.label}>BLOOD GROUP *</Text>
        <View style={styles.bloodGrid}>
          {BLOOD_GROUPS.map(g => (
            <TouchableOpacity key={g} style={[styles.bloodChip, blood === g && styles.bloodChipActive]} onPress={() => setBlood(g)}>
              <Text style={[styles.bloodText, blood === g && styles.bloodTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>LAST DONATION DATE (optional)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.text3} />

        <Text style={styles.label}>CITY / TALUKA *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Pune" placeholderTextColor={COLORS.text3} />

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="how-to-reg" size={22} color="#fff" />
              <Text style={styles.submitText}>Complete Registration</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.text2, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 14, fontSize: 15, color: COLORS.text },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodChip: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  bloodChipActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  bloodText: { fontSize: 16, fontWeight: '800', color: COLORS.text2 },
  bloodTextActive: { color: COLORS.red },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingVertical: 16, marginTop: 32, elevation: 6, shadowColor: COLORS.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
