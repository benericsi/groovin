import '../../assets/css/account.css';

import editPen from '../../assets/icons/pen-solid.svg';
import profile from '../../assets/icons/user-solid.svg';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';
import CommonHeader from '../../common/CommonHeader';

const Account = ({uid}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState({});

  useEffect(() => {
    showLoader();

    const fetchUserData = async () => {
      try {
        const querySnapshot = await db.collection('users').get();
        querySnapshot.forEach((doc) => {
          if (doc.data().uid === uid) {
            console.log(doc.data());
            setUserData(doc.data());
            hideLoader();
          }
        });
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <CommonHeader>
        <div className="profile-photo">
          <button>
            <img src={userData.photoURL == 'default' ? profile : userData.photoURL} className={userData.photoURL == 'default' ? 'default' : ''} />
          </button>
          <div className="profile-photo-edit">
            <img src={editPen} alt="" />
            <span>Fénykép választása</span>
          </div>
        </div>
        <div className="profile-info">
          <span className="tpye">Profil </span>
          <h1 className="name">{userData.firstName + ' ' + userData.lastName}</h1>
          <span className="email">{userData.email} - 28 nyilvános műsorlista - 22 követő - 173 követés</span>
        </div>
      </CommonHeader>
    </>
  );
};

export default Account;
