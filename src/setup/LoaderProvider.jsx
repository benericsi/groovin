import React, {createContext, useState} from 'react';
import Loader from '../common/Loader';

export const LoaderContext = createContext();

const LoaderProvider = ({children}) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{loading, showLoader, hideLoader}}>
      <Loader />
      {children}
    </LoaderContext.Provider>
  );
};

export default LoaderProvider;
