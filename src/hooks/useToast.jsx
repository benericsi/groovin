import {useContext} from 'react';
import {ToastContext} from '../context/ToastProvider';

export const useToast = () => {
  return useContext(ToastContext);
};
