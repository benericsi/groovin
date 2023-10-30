import {useAuth} from './useAuth';
import {useToast} from './useToast';
import {useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

export const useAccessControl = () => {
  const {currentUser} = useAuth();
  const {addToast} = useToast();

  const {uid} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser.uid !== uid) {
      addToast('warning', 'You have no access to this page.');
      navigate('/');
    }
  }, [uid, currentUser]);
};
