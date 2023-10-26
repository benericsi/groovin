import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const app = firebase.initializeApp({
  apiKey: 'AIzaSyA3hRRYEgPVJWT9WF4la7cN0udwBE7XmDg',
  authDomain: 'groovin-redesign.firebaseapp.com',
  projectId: 'groovin-redesign',
  storageBucket: 'groovin-redesign.appspot.com',
  messagingSenderId: '381656194072',
  appId: '1:381656194072:web:846dba308562a0d759b76d',
  measurementId: 'G-JEQ3HGN09C',
});

export const auth = app.auth();
export const google = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
export const storage = firebase.storage();
export default app;
