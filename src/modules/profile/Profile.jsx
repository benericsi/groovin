import {useTitle} from '../../hooks/useTitle';
import {useParams} from 'react-router-dom';

const Profile = () => {
  useTitle('Profile');
  const {uid} = useParams();

  return <h1>{uid}</h1>;
};

export default Profile;
