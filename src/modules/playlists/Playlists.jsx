import '../../assets/css/playlists.css';

import React, {useEffect, useCallback} from 'react';
import {useNavigate, useOutletContext} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useDebounce} from '../../hooks/useDebounce';
import {useTitle} from '../../hooks/useTitle';
import {useToast} from '../../hooks/useToast';
import {db, storage} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import firebase from 'firebase/compat/app';

import Input from '../form/Input';
import Button from '../form/Button';
import Dropzone from '../form/Dropzone';
import Modal from '../../component/Modal';

import {AiOutlinePlusCircle} from 'react-icons/ai';
import {MdAddCircle, MdAddCircleOutline} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';

const AddPlaylistForm = ({toggleModal}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useDebounce(
    () => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: '',
      }));
    },
    0,
    [name]
  );

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.map((file) => {
      const reader = new FileReader();

      reader.onload = function () {
        setImage(file);
      };

      reader.readAsDataURL(file);
      return file;
    });
  }, []);

  const onDropRejected = (fileRejections) => {
    if (fileRejections[0].errors[0].code === 'file-too-large') {
      addToast('error', 'The file is too large. Maximum size is 1MB.');
    } else {
      addToast('error', 'The file is not an image. Please upload an image file.');
    }
  };

  const onFileDialogCancel = useCallback(() => {
    setImage('');
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();

    const inputFields = {name};

    const emptyInputs = Object.keys(inputFields).filter((key) => inputFields[key] === '');

    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [input]: 'This field is required.',
        }));
      });

      addToast('error', 'Please fill in all required fields.');
      return;
    }

    if (!image) {
      addToast('error', 'Please upload an image for the playlist.');
      return;
    }

    if (Object.values(errors).some((x) => x !== '')) {
      addToast('error', 'Please fix all errors before submitting.');
      return;
    }

    showLoader();
    try {
      // Check if another playlist with the same name already exists
      const playlistSnapshot = await db.collection('playlists').where('title', '==', name).get();

      if (!playlistSnapshot.empty) {
        addToast('error', 'A playlist with the same name already exists. Choose a different name.');
        return;
      }

      const storageRef = storage.ref();
      const fileRef = storageRef.child(`playlists/${image.name}`);
      await fileRef.put(image);

      // create playlist in firestore
      const playlistRef = db.collection('playlists');
      const docRef = await playlistRef.add({
        title: name,
        description: description,
        photoURL: await fileRef.getDownloadURL(),
        uid: currentUser.uid,
        creator: currentUser.displayName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        tracks: [],
      });

      addToast('success', 'Playlist created successfully.');
      toggleModal();
      navigate(`/profile/${currentUser.uid}/playlists/${docRef.id}`);
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <MdAddCircle className="icon_green" />
        Create New Playlist
      </h1>
      <div className="modal_content">
        <form>
          <Input
            type="text"
            value={name}
            label="Playlist Name *"
            autoFocus={true}
            onChange={(value) => {
              setName(value);
            }}
            error={errors.name}
            success={name && !errors.name}
          />
          <Input
            type="text"
            value={description}
            label="Playlist Description"
            onChange={(value) => {
              setDescription(value);
            }}
          />
          <Dropzone label="Upload an image for the playlist by dragging a file here or click to select" onDrop={onDrop} accept={'image/*'} multiple={false} maxFiles={1} maxSize={1048576} onDropRejected={onDropRejected} onFileDialogCancel={onFileDialogCancel} />
        </form>
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleModal}>
          <TbCircleOff />
        </Button>
        <Button className="primary green" text="Create" onClick={createPlaylist}>
          <MdAddCircleOutline />
        </Button>
      </div>
    </>
  );
};

const Playlists = () => {
  const {uid, isOwnProfile} = useOutletContext();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [playlists, setPlaylists] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useTitle('Playlists');

  useEffect(() => {
    const getPlaylists = () => {
      showLoader();

      try {
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
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getPlaylists();
  }, [uid]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <Modal isOpen={isModalOpen} close={toggleModal}>
        <AddPlaylistForm toggleModal={toggleModal} />
      </Modal>
      <section className="playlists-section">
        {!isOwnProfile && playlists !== null && playlists.length === 0 && <h2>There are no playlists yet.</h2>}
        <div className="playlists-container">
          {isOwnProfile && (
            <div className="playlist-card create" onClick={toggleModal}>
              <div className="playlist-card-photo">
                <AiOutlinePlusCircle />
              </div>
              <div className="playlist-card-name">Create New Playlist</div>
            </div>
          )}
          {playlists &&
            playlists.map((playlist, index) => (
              <Link to={`/profile/${playlist.uid}/playlists/${playlist.id}`} className="playlist-card" key={index}>
                <div className="playlist-card-photo">{<img src={playlist.photoURL} alt="" />}</div>
                <div className="playlist-card-name">{playlist.title}</div>
                <div className="playlist-card-length">{playlist.tracks.length} tracks</div>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
};

export default Playlists;
