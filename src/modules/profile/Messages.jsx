import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';

const Messages = () => {
  useAccessControl();
  useTitle('Messages');

  return <h1>Messages</h1>;
};

export default Messages;
