import {useContext} from 'react';
import {LoaderContext} from '../setup/LoaderProvider';

export const useLoader = () => {
  return useContext(LoaderContext);
};
