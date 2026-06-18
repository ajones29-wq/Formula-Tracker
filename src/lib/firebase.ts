import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    db = getFirestore(app);
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

export const logout = async () => {
  const { auth } = await initFirebase();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { initFirebase };
