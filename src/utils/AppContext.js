import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const AppContext = createContext();

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function validatePhone(phone) {
  if (!phone) return { valid: false, phone: '' };
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  if (/^(\+?91)?[6-9]\d{9}$/.test(cleaned)) {
    return { valid: true, phone: cleaned.slice(-10) };
  }
  return { valid: false, phone: cleaned };
}

export function validatePassword(password) {
  if (!password || password.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters long.' };
  }
  return { valid: true };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load persisted session first
  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedHospital] = await Promise.all([
          AsyncStorage.getItem('currentUser'),
          AsyncStorage.getItem('currentHospital'),
        ]);
        if (mountedRef.current) {
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (parseErr) {
              console.warn('Failed to parse saved user:', parseErr);
              await AsyncStorage.removeItem('currentUser');
            }
          }
          if (savedHospital) {
            try {
              setHospital(JSON.parse(savedHospital));
            } catch (parseErr) {
              console.warn('Failed to parse saved hospital:', parseErr);
              await AsyncStorage.removeItem('currentHospital');
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load session:', e);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setFirebaseReady(true);
        }
      }
    })();
  }, []);

  // Real-time listeners — only after firebase is ready
  useEffect(() => {
    if (!firebaseReady) return;

    let unsubDonors = () => {};
    let unsubRequests = () => {};

    try {
      unsubDonors = onSnapshot(
        collection(db, 'donors'),
        (snapshot) => {
          if (mountedRef.current) {
            setDonors(
              snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            );
          }
        },
        (err) => {
          console.warn('Donors sync error:', err);
        }
      );
    } catch (e) {
      console.warn('Failed to setup donors listener:', e);
    }

    try {
      unsubRequests = onSnapshot(
        collection(db, 'requests'),
        (snapshot) => {
          if (mountedRef.current) {
            const data = snapshot.docs.map((d) => {
              const item = d.data();
              return {
                id: d.id,
                ...item,
                createdAt: item.createdAt?.toMillis?.() || Date.now(),
              };
            });
            data.sort((a, b) => b.createdAt - a.createdAt);
            setRequests(data);
          }
        },
        (err) => {
          console.warn('Requests sync error:', err);
        }
      );
    } catch (e) {
      console.warn('Failed to setup requests listener:', e);
    }

    return () => {
      unsubDonors();
      unsubRequests();
    };
  }, [firebaseReady]);

  // Notifications listener
  useEffect(() => {
    if (!firebaseReady) return;

    const targetId = user?.phone || hospital?.code;
    if (!targetId) {
      setNotifications([]);
      return;
    }

    let unsubNotif = () => {};

    try {
      const qNotif = query(
        collection(db, 'notifications'),
        where('targetId', '==', targetId)
      );
      unsubNotif = onSnapshot(
        qNotif,
        (snapshot) => {
          if (mountedRef.current) {
            const data = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
            }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setNotifications(data);
          }
        },
        (err) => {
          console.warn('Notifications sync error:', err);
        }
      );
    } catch (e) {
      console.warn('Failed to setup notifications listener:', e);
    }

    return () => unsubNotif();
  }, [user, hospital, firebaseReady]);

  // ─── Actions ────────────────────────────────────────

  const registerDonor = async (data) => {
    try {
      const phoneResult = validatePhone(data.phone);
      if (!phoneResult.valid)
        return { success: false, error: 'Invalid phone number.' };

      const passCheck = validatePassword(data.password);
      if (!passCheck.valid)
        return { success: false, error: passCheck.error };

      const docRef = doc(db, 'donors', phoneResult.phone);
      const existing = await getDoc(docRef);
      if (existing.exists())
        return { success: false, error: 'Phone already registered.' };

      const newDonor = {
        name: data.name.trim(),
        phone: phoneResult.phone,
        password: hashPassword(data.password),
        blood: data.blood,
        city: data.city.trim(),
        available: true,
        role: 'donor',
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newDonor);

      const localUser = { ...newDonor };
      delete localUser.password;
      delete localUser.createdAt;

      setUser(localUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
      return { success: true, user: localUser };
    } catch (e) {
      console.warn('registerDonor error:', e);
      return { success: false, error: e.message || 'Registration failed.' };
    }
  };

  const loginDonor = async (phone, password) => {
    try {
      const phoneResult = validatePhone(phone);
      if (!phoneResult.valid)
        return { success: false, error: 'Invalid phone.' };

      const docSnap = await getDoc(doc(db, 'donors', phoneResult.phone));
      if (
        docSnap.exists() &&
        docSnap.data().password === hashPassword(password)
      ) {
        const data = docSnap.data();
        const userData = { ...data, id: docSnap.id };
        delete userData.password;
        delete userData.createdAt;

        setUser(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid credentials.' };
    } catch (e) {
      console.warn('loginDonor error:', e);
      return { success: false, error: e.message || 'Login failed.' };
    }
  };

  const logoutDonor = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('currentUser');
    } catch (e) {
      console.warn('logoutDonor error:', e);
    }
  };

  const registerHospital = async (data) => {
    try {
      const phoneResult = validatePhone(data.phone);
      if (!phoneResult.valid)
        return { success: false, error: 'Invalid phone.' };

      const code =
        data.name.substring(0, 3).toUpperCase() +
        String(Math.floor(Math.random() * 900) + 100);

      const newHosp = {
        name: data.name.trim(),
        city: data.city.trim(),
        phone: phoneResult.phone,
        email: data.email || '',
        code,
        password: hashPassword(data.password),
        role: 'hospital',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'hospitals', code), newHosp);

      const localHosp = { ...newHosp };
      delete localHosp.password;
      delete localHosp.createdAt;
      setHospital(localHosp);
      await AsyncStorage.setItem(
        'currentHospital',
        JSON.stringify(localHosp)
      );
      return { success: true, code };
    } catch (e) {
      console.warn('registerHospital error:', e);
      return { success: false, error: e.message || 'Registration failed.' };
    }
  };

  const loginHospitalAuth = async (code, password) => {
    try {
      const docSnap = await getDoc(
        doc(db, 'hospitals', code.toUpperCase().trim())
      );
      if (
        docSnap.exists() &&
        docSnap.data().password === hashPassword(password)
      ) {
        const data = docSnap.data();
        const hospData = { ...data, id: docSnap.id };
        delete hospData.password;
        delete hospData.createdAt;
        setHospital(hospData);
        await AsyncStorage.setItem(
          'currentHospital',
          JSON.stringify(hospData)
        );
        return { success: true, hospital: hospData };
      }
      return { success: false, error: 'Invalid hospital credentials.' };
    } catch (e) {
      console.warn('loginHospitalAuth error:', e);
      return { success: false, error: e.message || 'Login failed.' };
    }
  };

  const logoutHospital = async () => {
    try {
      setHospital(null);
      await AsyncStorage.removeItem('currentHospital');
    } catch (e) {
      console.warn('logoutHospital error:', e);
    }
  };

  const addRequest = async (req) => {
    try {
      const reqData = {
        ...req,
        status: 'active',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'requests'), reqData);

      // Notify matching donors safely
      const matching = donors.filter(
        (d) => d.blood === req.blood && d.available
      );

      if (matching.length > 0) {
        await Promise.allSettled(
          matching.map((d) =>
            addDoc(collection(db, 'notifications'), {
              targetId: d.phone,
              type: 'emergency',
              title: `Urgent: ${req.blood} Needed`,
              desc: `${req.hospital} needs blood. Contact: ${
                req.contactPhone || req.contact
              }`,
              unread: true,
              createdAt: serverTimestamp(),
            })
          )
        );
      }

      return { success: true };
    } catch (e) {
      console.warn('addRequest error:', e);
      return { success: false, error: e.message || 'Failed to create request.' };
    }
  };

  const acceptRequest = async (reqId) => {
    try {
      const name = user?.name || hospital?.name || 'Anonymous';
      const reqRef = doc(db, 'requests', reqId);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const currentAccepted = reqSnap.data().accepted || [];
        if (!currentAccepted.includes(name)) {
          await updateDoc(reqRef, {
            accepted: [...currentAccepted, name],
          });
        }
      }
    } catch (e) {
      console.warn('acceptRequest error:', e);
    }
  };

  const sendDonorRequest = async (donor, bloodGroup, hospitalName) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        targetId: donor.phone,
        type: 'emergency',
        title: `🏥 Request from ${hospitalName}`,
        desc: `They are requesting ${bloodGroup} blood donation. Please respond.`,
        unread: true,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('sendDonorRequest error:', e);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => n.unread);
      if (unread.length > 0) {
        await Promise.allSettled(
          unread.map((n) =>
            updateDoc(doc(db, 'notifications', n.id), { unread: false })
          )
        );
      }
    } catch (e) {
      console.warn('markAllRead error:', e);
    }
  };

  const toggleAvailability = async () => {
    if (!user?.phone) return;
    try {
      const newStatus = !user.available;
      const updated = { ...user, available: newStatus };
      setUser(updated);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
      await updateDoc(doc(db, 'donors', user.phone), {
        available: newStatus,
      });
    } catch (e) {
      console.warn('toggleAvailability error:', e);
      // Revert on failure
      setUser(user);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppContext.Provider
      value={{
        user,
        hospital,
        donors,
        requests,
        notifications,
        unreadCount,
        isLoading,
        registerDonor,
        loginDonor,
        logoutDonor,
        registerHospital,
        loginHospitalAuth,
        logoutHospital,
        addRequest,
        acceptRequest,
        sendDonorRequest,
        markAllRead,
        toggleAvailability,
        setHospital,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}