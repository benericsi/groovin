import {useOutletContext} from 'react-router-dom';

const Friends = () => {
  const [uid] = useOutletContext();

  return <h1>Friends {uid}</h1>;
};

export default Friends;
