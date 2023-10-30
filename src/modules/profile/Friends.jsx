import {useOutletContext} from 'react-router-dom';

const Friends = () => {
  const [uid, isOwnProfile] = useOutletContext();

  return <h1>Friends {uid}</h1>;
};

export default Friends;
