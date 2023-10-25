import {useEffect} from 'react';
import {useTimeout} from './useTimeout';

export const useDebounce = (callback, delay, dependencies) => {
  const {reset, clear} = useTimeout(callback, delay);
  useEffect(reset, [...dependencies, reset]);
  // eslint-disable-next-line
  useEffect(clear, []);
};
