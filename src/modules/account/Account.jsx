import '../../assets/css/account.css';

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
      <CommonHeader></CommonHeader>
      <h1>Account</h1>
    </>
  );
};

export default Account;
