import {useOutletContext} from 'react-router-dom';
import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';

const Notifications = () => {
  useAccessControl();
  useTitle('Notifications');
  const [uid, isOwnProfile] = useOutletContext();

  return <h1>Notifications</h1>;
};

export default Notifications;
