import '../../assets/css/account.css';

import editPen from '../../assets/icons/pen-solid.svg';
import profile from '../../assets/icons/user-solid.svg';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';

import CommonHeader from '../../common/CommonHeader';
import PopUp from '../../common/PopUp';
import Input from '../../common/Input';
import Button from '../../common/Button';

const Account = ({uid}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState({});
  const [isPopUpActive, setIsPopUpActive] = useState(false);

  const [inputPhoto, setInputPhoto] = useState();
  const [inputName, setInputName] = useState();

  useEffect(() => {
    showLoader();

    const fetchUserData = async () => {
      try {
        const querySnapshot = await db.collection('users').get();
        querySnapshot.forEach((doc) => {
          if (doc.data().uid === uid) {
            setUserData(doc.data());

            setInputPhoto(doc.data().photoURL);
            setInputName(doc.data().firstName + ' ' + doc.data().lastName);
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

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async () => {
    showLoader();

    try {
      await db
        .collection('users')
        .doc(userData.email)
        .update({
          photoURL: inputPhoto,
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
        });

      hideLoader();
      addToast('success', 'Credentials successfully saved!');
      togglePopUp();
      window.location.reload();
    } catch (error) {
      hideLoader();
      addToast('error', error.message);
    }
  };

  return (
    <>
      <PopUp isPopUpActive={isPopUpActive} onClose={togglePopUp}>
        <Input
          type="text"
          value={inputName}
          label="Full Name"
          onChange={(value) => {
            setInputName(value);
          }}
          className="input-field"
        />
        <Input
          type="text"
          value={inputPhoto}
          label="Photo URL"
          onChange={(value) => {
            setInputPhoto(value);
          }}
          className="input-field"
        />
        <Button type="button" text="Save" className="btn-dark" onClick={handleModifyUser} />
      </PopUp>
      <CommonHeader>
        <div className="profile-photo">
          <button>
            <img src={userData.photoURL == 'default' ? profile : userData.photoURL} className={userData.photoURL == 'default' ? 'default' : ''} />
          </button>
          <div className="profile-photo-edit" onClick={togglePopUp}>
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
