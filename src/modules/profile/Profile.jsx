import '../../assets/css/profile.css';

import Button from '../../ui/Button';
import Input from '../../ui/Input';
import PopUp from '../../common/PopUp';

import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {db, storage} from '../../setup/Firebase';

import {RiAccountCircleFill} from 'react-icons/ri';
import {BiEdit} from 'react-icons/bi';

const Profile = () => {
  useTitle('Profile');
  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const isOwnProfile = currentUser.uid === uid;
  const [userData, setUserData] = useState(null);

  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [inputName, setInputName] = useState(currentUser.displayName);
  const [inputPhoto, setInputPhoto] = useState(null);

  useEffect(() => {
    const getUserByUid = async (uid) => {
      console.log('query');
      try {
        showLoader();
        const unsubscribe = db
          .collection('users')
          .doc(uid)
          .onSnapshot((doc) => {
            if (doc.exists) {
              setUserData(doc.data());
              setInputName(doc.data().displayName);
            } else {
              addToast('error', 'User was not found.');
              setUserData(null);
            }
          });

        return unsubscribe;
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getUserByUid(uid);
  }, [uid]);

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async (e) => {
    e.preventDefault();
    // Prevent user from changing their name to an empty string
    if (inputName === '') {
      setInputName(userData.displayName);
      addToast('error', 'Name cannot be empty!');
      return;
    }

    try {
      showLoader();
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`profile-images/${uid}`);

      if (!inputPhoto) {
        // Prevent user from changing photo
        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: inputName.split(' ')[0],
            lastName: inputName.split(' ')[1],
            displayName: inputName,
          });

        currentUser.updateProfile({
          displayName: inputName,
        });

        addToast('success', 'Credentials successfully saved!');
        togglePopUp();
      } else {
        await fileRef.put(inputPhoto);
        const imageUrl = await fileRef.getDownloadURL();

        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: inputName.split(' ')[0],
            lastName: inputName.split(' ')[1],
            displayName: inputName,
            photoURL: inputPhoto ? imageUrl : 'default',
          });

        currentUser.updateProfile({
          displayName: inputName,
          photoURL: inputPhoto ? imageUrl : 'default',
        });

        addToast('success', 'Credentials successfully saved!');
        togglePopUp();
      }
    } catch (error) {
      addToast('error', error.message);
      return;
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      {isOwnProfile && (
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
          <input type="file" accept="image/*" onChange={(e) => setInputPhoto(e.target.files[0])} className="input-field light" />
          <Button type="button" text="Save" className="dark" onClick={handleModifyUser} />
        </PopUp>
      )}
      {userData && (
        <div className="user-header">
          <div className="header-pre">
            <div className="user-background"></div>
          </div>
          <div className="user-profile-details">
            <div className="user-profile-image">{userData.photoURL !== 'default' ? <img src={userData.photoURL} alt="" /> : <RiAccountCircleFill className="default-photo" />}</div>
            <div className="user-profile-actions">
              <span className="user-profile-name">{userData.displayName}</span>
              {isOwnProfile && (
                <button className="user-profile-edit" onClick={togglePopUp}>
                  <BiEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
