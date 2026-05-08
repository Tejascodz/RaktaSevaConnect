import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';
import { validatePhone } from '../utils/AppContext';

export default function DonorLoginScreen({ navigation }) {
  const { loginDonor } = useApp();
  const { showAlert, showToast } = useAlert();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) { showAlert('Missing Fields', 'Please enter phone number and password.'); return; }

    // Validate phone format
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) {
      showAlert('Invalid Phone', 'Please enter a valid 10-digit Indian phone number.\n\nExample: 9876543210');
      return;
    }

    if (password.length < 4) {
      showAlert('Invalid Password', 'Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginDonor(phone, password);
      if (result.success) {
        showToast(`Welcome back, ${result.user.name}! 🩸`);
        // Navigation is handled automatically by App.js auth state
      } else {
        showAlert('Login Failed', result.error || 'Invalid phone number or password.\n\nDon\'t have an account? Go back and Register.');
      }
    } catch (e) {
      showAlert('Error', 'Something went wrong. Please try again.');
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
        <View style={styles.iconWrap}>
          <MaterialIcons name="favorite" size={36} color={COLORS.red} />
        </View>
        <Text style={styles.h1}>Welcome Back</Text>
        <Text style={styles.sub}>Login to your donor account</Text>

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter 10-digit phone number"
          placeholderTextColor={COLORS.text3}
          keyboardType="phone-pad"
          maxLength={13}
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={COLORS.text3}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
            <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={COLORS.text3} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={styles.submitText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} /><Text style={styles.divText}>OR</Text><View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
          <MaterialIcons name="person-add" size={18} color={COLORS.red} />
          <Text style={styles.regText}>Create New Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hospLink} onPress={() => navigation.navigate('HospitalLogin')} activeOpacity={0.7}>
          <MaterialIcons name="local-hospital" size={16} color={COLORS.blue} />
          <Text style={styles.hospLinkText}>Hospital Portal →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(220,20,60,0.12)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16, marginTop: 8 },
  h1: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.text2, textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 14, fontSize: 15, color: COLORS.text },
  passRow: { flexDirection: 'row', gap: 8 },
  eyeBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingVertical: 16, marginTop: 28, elevation: 6, shadowColor: COLORS.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontSize: 12, color: COLORS.text3, fontWeight: '600' },
  regBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.red, backgroundColor: 'rgba(220,20,60,0.06)' },
  regText: { fontSize: 14, fontWeight: '600', color: COLORS.red },
  hospLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, paddingVertical: 12 },
  hospLinkText: { fontSize: 14, fontWeight: '600', color: COLORS.blue },
});
