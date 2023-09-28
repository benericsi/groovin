import '../../assets/css/main.css';
import Header from './Header';
import Account from '../account/Account';

import React from 'react';
import {useParams} from 'react-router-dom';

const Main = () => {
  const {page, uid} = useParams();
  //console.log(page, uid);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <h1>Home</h1>;
      case 'search':
        return <h1>Search</h1>;
      case 'notifications':
        return <h1>Notifications</h1>;
      case 'messages':
        return <h1>Messages</h1>;
      case 'friends':
        return <h1>Friends</h1>;
      case 'account':
        return <Account uid={uid} />;
      default:
        return <h1>Home</h1>;
    }
  };

  return (
    <main className="main-container">
      <Header />
      <div className="main-content-wrapper">{renderPage()}</div>
    </main>
  );
};

export default Main;
