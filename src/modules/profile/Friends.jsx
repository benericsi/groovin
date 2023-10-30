import {useOutletContext} from 'react-router-dom';
import {useTitle} from '../../hooks/useTitle';

const Friends = () => {
  useTitle('Friends');
  const [uid, isOwnProfile] = useOutletContext();

  return <h1>Friends {uid}</h1>;
};

export default Friends;
