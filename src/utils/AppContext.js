import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const AppContext = createContext();

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
    });

    // Listen for global emergency requests
    const qReq = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubRequests = onSnapshot(qReq, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubDonors(); unsubRequests(); };
  }, []);

  // Listen for user specific notifications
  useEffect(() => {
    if (!user && !hospital) return;
    const targetId = user ? user.phone : hospital.code;
    const qNotif = query(collection(db, 'notifications'), where('targetId', '==', targetId));
    const unsubNotif = onSnapshot(qNotif, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.createdAt - a.createdAt));
    });
    return () => unsubNotif();
  }, [user, hospital]);

  // ===== DONOR AUTH =====
  const registerDonor = async (data) => {
    try {
      const newDonor = {
        name: data.name, phone: data.phone, password: data.password || '1234', blood: data.blood,
        city: data.city, lat: 18.52, lng: 73.86, lastDonation: data.lastDonation || '2025-01-01',
        available: true, distance: Math.round(Math.random() * 80 + 5) / 10, role: 'donor'
      };
      await setDoc(doc(db, 'donors', data.phone), newDonor);
      setUser(newDonor);
      await AsyncStorage.setItem('currentUser', JSON.stringify(newDonor));
    } catch (e) { console.error("Firebase Registration Error", e); }
  };

  const loginDonor = async (phone, password) => {
    try {
      const docRef = doc(db, 'donors', phone);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().password === password) {
        const userData = { id: docSnap.id, ...docSnap.data() };
        setUser(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid phone or password' };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error connecting to Firebase' };
    }
  };

  const logoutDonor = async () => {
    setUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  // ===== HOSPITAL AUTH =====
  const registerHospital = async (data) => {
    try {
      const code = data.name.substring(0, 3).toUpperCase() + String(Math.floor(Math.random() * 900) + 100);
      const newHosp = { ...data, code, password: data.password, role: 'hospital' };
      await setDoc(doc(db, 'hospitals', code), newHosp);
      setHospital(newHosp);
      await AsyncStorage.setItem('currentHospital', JSON.stringify(newHosp));
      return code;
    } catch (e) { console.error(e); return null; }
  };

  const loginHospitalAuth = async (code, password) => {
    try {
      const docSnap = await getDoc(doc(db, 'hospitals', code.toUpperCase()));
      if (docSnap.exists() && docSnap.data().password === password) {
        const hospData = { id: docSnap.id, ...docSnap.data() };
        setHospital(hospData);
        await AsyncStorage.setItem('currentHospital', JSON.stringify(hospData));
        return { success: true, hospital: hospData };
      }
      return { success: false };
    } catch (e) { console.error(e); return { success: false }; }
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
          desc: `${req.hospital} needs ${req.units} unit(s).`, unread: true, createdAt: serverTimestamp()
        });
      });
      return matching.length;
    } catch (e) { console.error(e); return 0; }
  };

  const acceptRequest = async (reqId, currentAccepted) => {
    try {
      const name = user?.name || hospital?.name || 'Anonymous';
      const reqRef = doc(db, 'requests', reqId);
      await updateDoc(reqRef, { accepted: [...(currentAccepted || []), name] });
      // Notify hospital
      if (user) {
        // Need hospital ID to target notification, assuming request doc has hospitalCode
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

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AppContext.Provider value={{
      user, hospital, donors, requests, notifications, unreadCount, isLoading, donorRequests,
      registerDonor, loginDonor, logoutDonor,
      loginHospitalAuth, registerHospital, logoutHospital,
      addRequest, acceptRequest, toggleAvailability, sendDonorRequest,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
