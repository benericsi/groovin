import React, {createContext} from 'react';
import {useState, useEffect} from 'react';
import {auth} from './Firebase';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState();

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
