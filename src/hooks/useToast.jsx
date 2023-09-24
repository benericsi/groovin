import {useContext} from 'react';
import {ToastContext} from '../setup/ToastProvider';

export const useToast = () => {
  return useContext(ToastContext);
};
