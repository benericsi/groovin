import {useContext} from 'react';
import {AuthContext} from '../setup/AuthProvider';

export const useAuth = () => {
  return useContext(AuthContext);
};
