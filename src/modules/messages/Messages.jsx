import '../../assets/css/messages.css';

import CommonBody from '../../common/CommonBody';
import UserList from './UserList';
import ChatRoom from './ChatRoom';

const Messages = () => {
  return (
    <CommonBody>
      <h1>Messages</h1>
      <div className="messages-container">
        <UserList />
        <ChatRoom />
      </div>
    </CommonBody>
  );
};

export default Messages;
