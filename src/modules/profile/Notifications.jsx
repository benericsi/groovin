import {useOutletContext} from 'react-router-dom';
import {useAccessControl} from '../../hooks/useAccessControl';

const Notifications = () => {
  useAccessControl();
  const [uid, isOwnProfile] = useOutletContext();

  return <h1>Notifications</h1>;
};

export default Notifications;
