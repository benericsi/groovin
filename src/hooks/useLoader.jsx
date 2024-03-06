import {useContext} from 'react';
import {LoaderContext} from '../context/LoaderProvider';

export const useLoader = () => {
  return useContext(LoaderContext);
};
