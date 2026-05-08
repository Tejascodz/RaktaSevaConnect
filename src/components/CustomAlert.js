import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  bg: '#0A0A14', bg2: '#11111E', red: '#DC143C', green: '#00C853',
  text: '#F0F0F5', text2: '#A0A0B8', text3: '#606078',
  border: 'rgba(255,255,255,0.06)', surface: 'rgba(255,255,255,0.05)',
};

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const [toast, setToast] = useState(null);

  const showAlert = useCallback((title, message, buttons = [{ text: 'OK' }]) => {
    setAlert({ title, message, buttons });
  }, []);

  const hideAlert = useCallback(() => setAlert(null), []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showToast }}>
      {children}
      {/* Custom Alert Modal */}
      <Modal visible={!!alert} transparent animationType="fade" onRequestClose={hideAlert}>
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alert?.title}</Text>
            <Text style={styles.alertMsg}>{alert?.message}</Text>
            <View style={styles.alertBtns}>
              {alert?.buttons?.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.alertBtn, btn.style === 'destructive' && styles.alertBtnDestructive, i === (alert.buttons.length - 1) && styles.alertBtnPrimary]}
                  onPress={() => { hideAlert(); btn.onPress?.(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.alertBtnText, btn.style === 'cancel' && { color: COLORS.text2 }, i === (alert.buttons.length - 1) && { color: '#fff' }]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      {/* Toast */}
      {toast && (
        <View style={[styles.toast, toast.type === 'error' && { backgroundColor: COLORS.red }]}>
          <MaterialIcons name={toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'error' : 'info'} size={18} color="#fff" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() { return useContext(AlertContext); }

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  alertBox: { width: '100%', maxWidth: 340, backgroundColor: COLORS.bg2, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  alertTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  alertMsg: { fontSize: 14, color: COLORS.text2, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  alertBtns: { flexDirection: 'row', gap: 10 },
  alertBtn: { flex: 1, paddingVertical: 12, borderRadius: 50, backgroundColor: COLORS.surface, alignItems: 'center' },
  alertBtnPrimary: { backgroundColor: COLORS.red },
  alertBtnDestructive: { backgroundColor: 'rgba(220,20,60,0.15)' },
  alertBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toast: { position: 'absolute', bottom: 100, left: 24, right: 24, backgroundColor: COLORS.green, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});
