import {React} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';

const PrivateRoute = () => {
  const {currentUser} = useAuth();
  return currentUser ? <Outlet /> : <Navigate to="/auth" />;
};

export default PrivateRoute;
