import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

let app;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

const initFirebase = async () => {
  if (app) return { app, auth, db };

  try {
    const response = await fetch('/firebase-applet-config.json');
    if (!response.ok) {
      throw new Error('Failed to load Firebase configuration');
    }
    const config = await response.json();
    app = initializeApp(config);
    auth = getAuth(app);
    try {
      db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      }, config.firestoreDatabaseId);
    } catch {
      db = getFirestore(app, config.firestoreDatabaseId);
    }
    return { app, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const { auth, db } = await initFirebase();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create/update user document
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  const { auth, db } = await initFirebase();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || user.email?.split('@')[0] || 'Racing Fan',
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { auth, db } = await initFirebase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const logout = async () => {
  const { auth } = await initFirebase();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const sendPasswordResetEmailLink = async (email: string) => {
  const { auth } = await initFirebase();
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const changeUserPassword = async (newPassword: string) => {
  const { auth } = await initFirebase();
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in.');
  }
  try {
    await updatePassword(auth.currentUser, newPassword);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const changeUserEmail = async (newEmail: string) => {
  const { auth, db } = await initFirebase();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently signed in.');
  }
  try {
    // Try verifyBeforeUpdateEmail if supported, else updateEmail
    if (typeof verifyBeforeUpdateEmail === 'function') {
      await verifyBeforeUpdateEmail(currentUser, newEmail);
    } else {
      await updateEmail(currentUser, newEmail);
    }

    // Update user record in Firestore
    await setDoc(doc(db, 'users', currentUser.uid), {
      email: newEmail,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

export { initFirebase };

