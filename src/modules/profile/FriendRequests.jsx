import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';

const FriendRequests = () => {
  useAccessControl();
  useTitle('Friend Requests');

  return <h1>Requests</h1>;
};

export default FriendRequests;
