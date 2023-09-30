import '../../assets/css/main.css';
import Header from './Header';
import Notifications from '../notifications/Notifications';
import Account from '../account/Account';
import Followers from '../account/Followers';
import Following from '../account/Following';

import React from 'react';
import {useParams} from 'react-router-dom';

const Main = () => {
  const {page, uid} = useParams();
  //console.log(page, uid);

  const routeComponents = {
    home: <h1>Home</h1>,
    search: <h1>Search</h1>,
    notifications: <Notifications />,
    messages: <h1>Messages</h1>,
    account: <Account uid={uid} />,
    followers: <Followers uid={uid} />,
    following: <Following uid={uid} />,
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
