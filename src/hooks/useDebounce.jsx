import {useEffect, useCallback} from 'react';
import {useTimeout} from './useTimeout';

export const useDebounce = (callback, delay, dependencies) => {
  const {reset, clear} = useTimeout(callback, delay);

  useEffect(() => {
    reset();
    return clear;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reset]);

  const debouncedFunction = useCallback(() => {
    clear();
    reset();
  }, [clear, reset]);

  return debouncedFunction;
};
