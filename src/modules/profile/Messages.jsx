import {useAccessControl} from '../../hooks/useAccessControl';

const Messages = () => {
  useAccessControl();

  return <h1>Messages</h1>;
};

export default Messages;
