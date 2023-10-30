import '../../assets/css/profile.css';

import Button from '../../ui/Button';
import Input from '../../ui/Input';
import PopUp from '../../common/PopUp';

import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {Outlet, useParams, NavLink, useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {db, storage} from '../../setup/Firebase';

import {RiAccountCircleFill} from 'react-icons/ri';
import {BiEdit} from 'react-icons/bi';
import {AiOutlinePlusCircle} from 'react-icons/ai';

const Profile = () => {
  useTitle('Profile');
  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const location = useLocation().pathname;

  const isOwnProfile = currentUser.uid === uid;
  const [userData, setUserData] = useState(null);

  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [inputName, setInputName] = useState(currentUser.displayName);
  const [inputPhoto, setInputPhoto] = useState(null);

  useEffect(() => {
    const getUserByUid = async (uid) => {
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
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
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
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
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
            <div className="user-profile-image">
              {userData.photoURL !== 'default' ? <img src={userData.photoURL} alt="" /> : <RiAccountCircleFill className="default-photo" />}
              {isOwnProfile ? (
                <div className="story">
                  <AiOutlinePlusCircle />
                  <span>Add to story</span>
                </div>
              ) : null}
            </div>
            <div className="user-profile-actions">
              <span className="user-profile-name">{userData.displayName}</span>
              {isOwnProfile ? (
                <button className="user-profile-edit" onClick={togglePopUp}>
                  <BiEdit /> Edit Profile
                </button>
              ) : (
                <span></span>
              )}
            </div>
          </div>
          <nav className="user-nav">
            <ul className="user-nav-list">
              <li className="user-nav-list-item">
                <NavLink to={`/profile/${uid}`} className={`user-nav-link ${location === `/profile/${uid}` ? 'active' : 'inactive'}`}>
                  Profile
                </NavLink>
              </li>
              <li className="user-nav-list-item">
                <NavLink to={`/profile/${uid}/friends`} className={`user-nav-link ${location === `/profile/${uid}/friends` ? 'active' : 'inactive'}`}>
                  Friends {userData.friends.length}
                </NavLink>
              </li>
              {isOwnProfile ? (
                <>
                  <li className="user-nav-list-item">
                    <NavLink to={`/profile/${uid}/messages`} className={`user-nav-link ${location === `/profile/${uid}/messages` ? 'active' : 'inactive'}`}>
                      Messages
                    </NavLink>
                  </li>
                  <li className="user-nav-list-item">
                    <NavLink to={`/profile/${uid}/notifications`} className={`user-nav-link ${location === `/profile/${uid}/notifications` ? 'active' : 'inactive'}`}>
                      Notifications
                    </NavLink>
                  </li>
                </>
              ) : null}
              <li className="user-nav-list-item"></li>
            </ul>
          </nav>
        </div>
      )}

      <div className="user-body">
        <Outlet context={[uid, isOwnProfile]} />
      </div>
    </>
  );
};

export default Profile;
