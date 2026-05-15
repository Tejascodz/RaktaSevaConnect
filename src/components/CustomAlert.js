import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
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

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(100)).current; // Translate Y

  const showAlert = useCallback((title, message, buttons = [{ text: 'OK' }]) => {
    setAlert({ title, message, buttons });
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => setAlert(null));
  }, [scaleAnim, fadeAnim]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Slide up
    Animated.spring(toastAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
    
    setTimeout(() => {
      // Slide down
      Animated.timing(toastAnim, { toValue: 100, duration: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => setToast(null));
    }, 3000);
  }, [toastAnim]);

  return (
    <AlertContext.Provider value={{ showAlert, showToast }}>
      {children}
      {/* Custom Alert Modal */}
      <Modal visible={!!alert} transparent onRequestClose={hideAlert} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
            <Text style={styles.alertTitle}>{alert?.title}</Text>
            <Text style={styles.alertMsg}>{alert?.message}</Text>
            <View style={styles.alertBtns}>
              {alert?.buttons?.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.alertBtn,
                    btn.style === 'destructive' && styles.alertBtnDestructive,
                    i === (alert.buttons.length - 1) && styles.alertBtnPrimary
                  ]}
                  onPress={() => { btn.onPress?.(); hideAlert(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.alertBtnText,
                    btn.style === 'cancel' && { color: COLORS.text2 },
                    i === (alert.buttons.length - 1) && { color: '#fff' }
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
      {/* Toast */}
      {toast && (
        <Animated.View style={[
          styles.toast,
          toast.type === 'error' && { backgroundColor: COLORS.red },
          { transform: [{ translateY: toastAnim }] }
        ]}>
          <MaterialIcons name={toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'error' : 'info'} size={18} color="#fff" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() { return useContext(AlertContext); }

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  alertBox: { width: '85%', maxWidth: 340, backgroundColor: COLORS.bg2, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  alertTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  alertMsg: { fontSize: 14, color: COLORS.text2, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  alertBtns: { flexDirection: 'row', gap: 10 },
  alertBtn: { flex: 1, paddingVertical: 12, borderRadius: 50, backgroundColor: COLORS.surface, alignItems: 'center' },
  alertBtnPrimary: { backgroundColor: COLORS.red },
  alertBtnDestructive: { backgroundColor: 'rgba(220,20,60,0.15)' },
  alertBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toast: { position: 'absolute', bottom: 100, left: 24, right: 24, backgroundColor: COLORS.green, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 9999 },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});

