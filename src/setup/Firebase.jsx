import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const app = firebase.initializeApp({
  apiKey: 'AIzaSyAXJ4Tjxtxt3jP2eSkonOEoA616MR_8tHw',
  authDomain: 'groovin-1b5d9.firebaseapp.com',
  databaseURL: 'https://groovin-1b5d9-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'groovin-1b5d9',
  storageBucket: 'groovin-1b5d9.appspot.com',
  messagingSenderId: '1047468399023',
  appId: '1:1047468399023:web:74d48b4bdb1c5e0f0af75a',
  measurementId: 'G-YLMHGHLM04',
});

export const auth = app.auth();
export const google = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
export default app;
