import {useContext} from 'react';
import {LoaderContext} from '../setup/LoaderProvider';

export const useLoader = () => {
  return useContext(LoaderContext);
  /*
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
  */
};
