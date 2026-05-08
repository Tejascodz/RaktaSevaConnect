import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const AppContext = createContext();

// Simple hash function for password security (not storing plain text)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

// Phone number validation (Indian format)
export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Accept 10-digit Indian numbers, with or without +91/91 prefix
  if (/^(\+?91)?[6-9]\d{9}$/.test(cleaned)) {
    // Return just the last 10 digits
    return { valid: true, phone: cleaned.slice(-10) };
  }
  return { valid: false, phone: cleaned };
}

// Password validation
export function validatePassword(password) {
  if (!password || password.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters long.' };
  }
  if (password.length > 50) {
    return { valid: false, error: 'Password is too long.' };
  }
  return { valid: true };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [donorRequests, setDonorRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check persistent local login
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        const savedHospital = await AsyncStorage.getItem('currentHospital');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedHospital) setHospital(JSON.parse(savedHospital));
      } catch (e) { console.error(e); }
      setIsLoading(false);
    })();
  }, []);

  // 2. Real-time Firebase Listeners
  useEffect(() => {
    // Listen for donors
    const unsubDonors = onSnapshot(collection(db, 'donors'), (snapshot) => {
      setDonors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Donors listener error:', error);
    });

    // Listen for global emergency requests (without orderBy to avoid index requirement)
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side instead of requiring Firestore index
      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setRequests(data);
    }, (error) => {
      console.error('Requests listener error:', error);
    });

    return () => { unsubDonors(); unsubRequests(); };
  }, []);

  // Listen for user specific notifications
  useEffect(() => {
    if (!user && !hospital) return;
    const targetId = user ? user.phone : hospital?.code;
    if (!targetId) return;

    const qNotif = query(collection(db, 'notifications'), where('targetId', '==', targetId));
    const unsubNotif = onSnapshot(qNotif, (snapshot) => {
      setNotifications(
        snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          })
      );
    }, (error) => {
      console.error('Notifications listener error:', error);
    });
    return () => unsubNotif();
  }, [user, hospital]);

  // ===== DONOR AUTH =====
  const registerDonor = async (data) => {
    try {
      // Validate phone
      const phoneResult = validatePhone(data.phone);
      if (!phoneResult.valid) {
        return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
      }
      // Validate password
      const passResult = validatePassword(data.password);
      if (!passResult.valid) {
        return { success: false, error: passResult.error };
      }
      // Check if phone already registered
      const existingDoc = await getDoc(doc(db, 'donors', phoneResult.phone));
      if (existingDoc.exists()) {
        return { success: false, error: 'This phone number is already registered. Please login instead.' };
      }

      const newDonor = {
        name: data.name.trim(),
        phone: phoneResult.phone,
        password: hashPassword(data.password),
        blood: data.blood,
        city: data.city.trim(),
        lat: 18.52,
        lng: 73.86,
        lastDonation: data.lastDonation || '2025-01-01',
        available: true,
        distance: Math.round(Math.random() * 80 + 5) / 10,
        role: 'donor',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'donors', phoneResult.phone), newDonor);
      
      // Store without password hash locally
      const localUser = { ...newDonor, phone: phoneResult.phone };
      delete localUser.password;
      setUser(localUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
      return { success: true, user: localUser };
    } catch (e) {
      console.error("Firebase Registration Error", e);
      return { success: false, error: 'Registration failed: ' + (e?.message || e?.code || 'Unknown error. Check internet.') };
    }
  };

  const loginDonor = async (phone, password) => {
    try {
      const phoneResult = validatePhone(phone);
      if (!phoneResult.valid) {
        return { success: false, error: 'Please enter a valid 10-digit phone number.' };
      }

      const docRef = doc(db, 'donors', phoneResult.phone);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().password === hashPassword(password)) {
        const data = docSnap.data();
        const userData = { id: docSnap.id, name: data.name, phone: data.phone, blood: data.blood, city: data.city, lastDonation: data.lastDonation, available: data.available, distance: data.distance, role: data.role };
        setUser(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid phone number or password.' };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Login failed: ' + (e?.message || e?.code || 'Unknown error. Check internet.') };
    }
  };

  const logoutDonor = async () => {
    setUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  // ===== HOSPITAL AUTH =====
  const registerHospital = async (data) => {
    try {
      const phoneResult = validatePhone(data.phone);
      if (!phoneResult.valid) {
        return { success: false, error: 'Please enter a valid 10-digit phone number.' };
      }
      const passResult = validatePassword(data.password);
      if (!passResult.valid) {
        return { success: false, error: passResult.error };
      }

      const code = data.name.substring(0, 3).toUpperCase() + String(Math.floor(Math.random() * 900) + 100);
      const newHosp = {
        name: data.name.trim(),
        city: data.city.trim(),
        phone: phoneResult.phone,
        email: data.email?.trim() || '',
        code,
        password: hashPassword(data.password),
        role: 'hospital',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'hospitals', code), newHosp);

      const localHosp = { ...newHosp };
      delete localHosp.password;
      setHospital(localHosp);
      await AsyncStorage.setItem('currentHospital', JSON.stringify(localHosp));
      return { success: true, code };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Hospital registration failed: ' + (e?.message || e?.code || 'Unknown error. Check internet.') };
    }
  };

  const loginHospitalAuth = async (code, password) => {
    try {
      const docSnap = await getDoc(doc(db, 'hospitals', code.toUpperCase().trim()));
      if (docSnap.exists() && docSnap.data().password === hashPassword(password)) {
        const data = docSnap.data();
        const hospData = { id: docSnap.id, name: data.name, code: data.code, city: data.city, phone: data.phone, email: data.email, role: data.role };
        setHospital(hospData);
        await AsyncStorage.setItem('currentHospital', JSON.stringify(hospData));
        return { success: true, hospital: hospData };
      }
      return { success: false, error: 'Invalid hospital code or password.' };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Hospital login failed: ' + (e?.message || e?.code || 'Unknown error. Check internet.') };
    }
  };

  const logoutHospital = async () => {
    setHospital(null);
    await AsyncStorage.removeItem('currentHospital');
  };

  // ===== SHARED ACTIONS =====
  const addRequest = async (req) => {
    try {
      const reqData = { ...req, time: 'Just now', distance: '1.2 km', accepted: [], status: 'active', createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, 'requests'), reqData);
      
      // Notify matching donors
      const matching = donors.filter(d => d.blood === req.blood && d.available);
      matching.forEach(d => {
        addDoc(collection(db, 'notifications'), {
          targetId: d.phone, type: 'emergency', title: `Urgent: ${req.blood} Blood Needed`,
          desc: `${req.hospital} needs ${req.units} unit(s). Contact: ${req.contactPhone || req.contact}`, unread: true, createdAt: serverTimestamp()
        });
      });
      return matching.length;
    } catch (e) { console.error(e); return 0; }
  };

  const acceptRequest = async (reqId) => {
    try {
      const name = user?.name || hospital?.name || 'Anonymous';
      const reqRef = doc(db, 'requests', reqId);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const currentAccepted = reqSnap.data().accepted || [];
        if (!currentAccepted.includes(name)) {
          await updateDoc(reqRef, { accepted: [...currentAccepted, name] });
        }
      }
    } catch (e) { console.error(e); }
  };

  const sendDonorRequest = async (donor, bloodGroup, hospitalName) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        targetId: donor.phone, type: 'emergency', title: `🏥 ${hospitalName} Needs You!`,
        desc: `${hospitalName} is requesting you to donate ${bloodGroup} blood. Please respond.`,
        unread: true, createdAt: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  const toggleAvailability = async () => {
    if (user) {
      const updated = { ...user, available: !user.available };
      setUser(updated);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
      if (user.phone) {
        await updateDoc(doc(db, 'donors', user.phone), { available: updated.available });
      }
    }
  };

  const markAllRead = async () => {
    try {
      const updates = notifications.filter(n => n.unread).map(n => 
        updateDoc(doc(db, 'notifications', n.id), { unread: false })
      );
      await Promise.all(updates);
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AppContext.Provider value={{
      user, hospital, donors, requests, notifications, unreadCount, isLoading, donorRequests,
      registerDonor, loginDonor, logoutDonor,
      loginHospitalAuth, registerHospital, logoutHospital,
      addRequest, acceptRequest, toggleAvailability, sendDonorRequest, markAllRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
