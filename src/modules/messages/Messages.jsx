import '../../assets/css/messages.css';

import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';
import UserList from './UserList';
import ChatRoom from './ChatRoom';

const Messages = () => {
  useAccessControl();
  useTitle('Messages');

  return (
    <section className="messages-section">
      <UserList />
      <ChatRoom />
    </section>
  );
};

export default Messages;
