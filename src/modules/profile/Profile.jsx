import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {useParams} from 'react-router-dom';

const Profile = () => {
  useTitle('Profile');
  const {uid} = useParams();
  const {currentUser} = useAuth();

  const isOwnProfile = currentUser.uid === uid;

  return <h1>{uid}</h1>;
};

export default Profile;
