import '../../assets/css/playlists.css';

import React, {useEffect} from 'react';
import {useOutletContext} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db, storage} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import firebase from 'firebase/compat/app';

import {AiOutlinePlusCircle} from 'react-icons/ai';
import PopUp from '../../common/PopUp';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import {useTitle} from '../../hooks/useTitle';

const Playlists = () => {
  const {currentUser} = useAuth();
  const {uid, isOwnProfile} = useOutletContext();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [playlists, setPlaylists] = useState([]);

  const [inputName, setInputName] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputPhoto, setInputPhoto] = useState('');

  const [isPopUpActive, setIsPopUpActive] = useState(false);

  useTitle('Playlists');

  useEffect(() => {
    const fetchPlaylists = () => {
      // Unsubscribe from the previous listener
      let unsubscribe = () => {};

      // Set up a new listener
      const playlistRef = db.collection('playlists');
      if (uid) {
        const query = playlistRef.where('uid', '==', uid).orderBy('createdAt', 'desc');
        unsubscribe = query.onSnapshot((snapshot) => {
          const playlists = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });

          setPlaylists(playlists);
        });
      }

      // Clean up the previous listener when component unmounts or user changes
      return () => {
        unsubscribe();
      };
    };

    fetchPlaylists();
  }, [uid]);

  const togglePopUp = () => {
    if (!isPopUpActive) {
      setInputName('');
      setInputDescription('');
      setInputPhoto('');
    }

    setIsPopUpActive(!isPopUpActive);
  };

  const createPlaylist = async (e) => {
    e.preventDefault();

    if (inputName.trim() === '') {
      addToast('error', 'Playlist name cannot be empty.');
      return;
    }

    if (!inputPhoto) {
      addToast('error', 'Playlist photo is required.');
      return;
    }

    // validate file input to only accept images
    if (inputPhoto && !inputPhoto.type.includes('image')) {
      addToast('error', 'Playlist photo must be an image.');
      return;
    }

    showLoader();
    try {
      // upload photo to storage: /playlists/{playlistId}
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`playlists/${inputPhoto.name}`);
      await fileRef.put(inputPhoto);

      // create playlist in firestore
      const playlistRef = db.collection('playlists');
      await playlistRef.add({
        title: inputName,
        description: inputDescription,
        photoURL: await fileRef.getDownloadURL(),
        uid: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        songs: [],
      });

      addToast('success', 'Playlist created successfully.');
      togglePopUp();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <PopUp isPopUpActive={isPopUpActive} onClose={() => togglePopUp()}>
        <Input
          type="text"
          value={inputName}
          label="Playlist Name"
          onChange={(value) => {
            setInputName(value);
          }}
          className="input-field"
        />
        <Input
          type="text"
          value={inputDescription}
          label="Playlist Description"
          onChange={(value) => {
            setInputDescription(value);
          }}
          className="input-field"
        />
        <Input type="file" accept="image/*" label="Playlist Photo" onChange={(file) => setInputPhoto(file)} className="input-field light" />
        <Button type="button" text="Save" className="dark" onClick={(e) => createPlaylist(e)} />
      </PopUp>
      <section className="playlists-section">
        {!isOwnProfile && playlists !== null && playlists.length === 0 && <h2>There are no playlists yet.</h2>}
        <div className="playlists-container">
          {isOwnProfile && (
            <div className="playlist-card create" onClick={() => togglePopUp()}>
              <div className="playlist-card-photo">
                <AiOutlinePlusCircle />
              </div>
              <div className="playlist-card-name">Create New Playlist</div>
            </div>
          )}
          {playlists &&
            playlists.map((playlist, index) => (
              <Link to={`/profile/${currentUser.uid}/playlists/${playlist.id}`} state={{playlist: playlist}} className="playlist-card" key={index}>
                <div className="playlist-card-photo">{<img src={playlist.photoURL} alt="" />}</div>
                <div className="playlist-card-name">{playlist.title}</div>
                <div className="playlist-card-length">{playlist.songs.length} tracks</div>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
};

export default Playlists;