import '../../assets/css/main.css';
import Header from './Header';
import Notifications from '../notifications/Notifications';
import Account from '../account/Account';
import Friends from '../account/Friends';
import Messages from '../messages/Messages';

import React from 'react';
import {useParams} from 'react-router-dom';

const Main = () => {
  const {page, uid} = useParams();
  //console.log(page, uid);

  const routeComponents = {
    home: <h1>Home</h1>,
    search: <h1>Search</h1>,
    notifications: <Notifications />,
    messages: <Messages uid={uid} />,
    account: <Account uid={uid} />,
    friends: <Friends uid={uid} />,
  };

  const selectedComponent = routeComponents[page] || <h1>Home</h1>;

  return (
    <main className="main-container">
      <Header />
      <div className="main-content-wrapper">{selectedComponent}</div>
    </main>
  );
};

export default Main;
