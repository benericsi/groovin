import '../../assets/css/playlists.css';

import {useParams, useNavigate} from 'react-router-dom';
import {useEffect, useState, useCallback} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db, storage} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';
import {useAuth} from '../../hooks/useAuth';
import {useDebounce} from '../../hooks/useDebounce';

import Modal from '../../component/Modal';
import Input from '../form/Input';
import Button from '../form/Button';
import Dropzone from '../form/Dropzone';
import PlaylistTrackList from './PlaylistTrackList';

import {FaCirclePlay} from 'react-icons/fa6';
import {FaCirclePause} from 'react-icons/fa6';
import {FaEllipsisVertical} from 'react-icons/fa6';
import {BiEdit} from 'react-icons/bi';
import {MdDeleteOutline, MdDelete} from 'react-icons/md';
import {IoMdRefresh} from 'react-icons/io';
import {MdOutlineSaveAlt} from 'react-icons/md';
import {IoShuffleOutline} from 'react-icons/io5';
import {IoShareSocialOutline} from 'react-icons/io5';
import {IoIosSend} from 'react-icons/io';
import {AiFillEdit} from 'react-icons/ai';
import {TbCircleOff} from 'react-icons/tb';
import {BiSearchAlt} from 'react-icons/bi';
import {usePlayer} from '../../hooks/usePlayer';

const ModifyPlaylistForm = ({toggleModify, playlist}) => {
  const [name, setName] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

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

  const editPlaylist = async (e) => {
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

    if (Object.values(errors).some((x) => x !== '')) {
      addToast('error', 'Please fix all errors before submitting.');
      return;
    }

    showLoader();
    try {
      // Check if another playlist with the same name already exists that is not the current playlist
      const playlistSnapshot = await db.collection('playlists').where('title', '==', name).get();

      if (!playlistSnapshot.empty) {
        if (playlistSnapshot.docs[0].id !== playlist.id) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            name: 'A playlist with this name already exists.',
          }));
          return;
        }
      }

      if (!image) {
        await db.collection('playlists').doc(playlist.id).update({
          title: name,
          description: description,
        });
      } else {
        // upload photo to storage: /playlists/{playlistId}
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`playlists/${image.name}`);
        await fileRef.put(image);

        // create playlist in firestore
        const playlistRef = db.collection('playlists');
        await playlistRef.doc(playlist.id).update({
          title: name,
          description: description,
          photoURL: await fileRef.getDownloadURL(),
        });
      }

      addToast('success', 'Playlist updated successfully.');
      toggleModify();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <AiFillEdit />
        Modify Playlist
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
        <Button className="secondary" text="Cancel" onClick={toggleModify}>
          <TbCircleOff />
        </Button>
        <Button className="primary" text="Save" onClick={editPlaylist}>
          <MdOutlineSaveAlt />
        </Button>
      </div>
    </>
  );
};

const SharePlaylistForm = ({toggleShare, playlist}) => {
  const {currentUser} = useAuth();

  const [friends, setFriends] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    // fetch friends
    showLoader();
    const unsubscribe = db
      .collection('friends')
      .where('user1', '==', currentUser.uid)
      .onSnapshot(
        (snapshot) => {
          const friends = snapshot.docs.map((doc) => doc.data().user2);
          db.collection('friends')
            .where('user2', '==', currentUser.uid)
            .onSnapshot(
              (snapshot) => {
                const friends2 = snapshot.docs.map((doc) => doc.data().user1);
                const friendsCombined = [...friends, ...friends2];
                if (friendsCombined.length === 0) {
                  setFriends([]);
                  hideLoader();
                  return;
                }

                db.collection('users')
                  .where(firebase.firestore.FieldPath.documentId(), 'in', friendsCombined)
                  .onSnapshot(
                    (snapshot) => {
                      const friends = snapshot.docs.map((doc) => {
                        return {
                          id: doc.id,
                          ...doc.data(),
                        };
                      });
                      setFriends(friends);

                      hideLoader();
                    },
                    (error) => {
                      addToast('error', error.message);
                      hideLoader();
                    }
                  );
              },
              (error) => {
                addToast('error', error.message);
                hideLoader();
              }
            );
        },
        (error) => {
          addToast('error', error.message);
          hideLoader();
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  };

  const sharePlaylist = async (e) => {
    e.preventDefault();

    if (selectedFriends.length === 0) {
      addToast('info', 'Please select at least one friend to share the playlist with.');
      return;
    }

    showLoader();
    try {
      // if friend has a notification for this playlist, return
      const notificationRef = db.collection('notifications');
      const promises = selectedFriends.map(async (friendId) => {
        const notificationSnapshot = await notificationRef.where('type', '==', `New Playlist: ${playlist.title}`).where('sender', '==', currentUser.uid).where('receiver', '==', friendId).get();
        if (notificationSnapshot.empty) {
          await notificationRef.add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            message: `There is a new playlist from ${currentUser.displayName}. Go check it out!`,
            receiver: friendId,
            sender: currentUser.uid,
            senderName: currentUser.displayName,
            senderPhoto: currentUser.photoURL,
            type: `New Playlist: ${playlist.title}`,
          });
        }
      });

      await Promise.all(promises);
      setSelectedFriends([]);
      addToast('success', 'Playlist shared!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <IoIosSend />
        Share Playlist
      </h1>
      <div className="modal_content">
        {friends !== null && friends.length === 0 && <h2>There are no friends yet.</h2>}
        {friends && friends.length > 0 && (
          <>
            <p>You can send a notification for the selected friends. You can select a friend by clicking on them.</p>
            <div className="friends-container">
              {friends &&
                friends.map((friend, index) => (
                  <div className={`friend-card ${selectedFriends.includes(friend.id) ? 'selected' : ''}`} key={index} onClick={() => toggleFriendSelection(friend.id)}>
                    <div className="friend-card-photo">
                      <img src={friend.photoURL} alt="" />
                    </div>
                    <div className="friend-card-name">{friend.displayName}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleShare}>
          <TbCircleOff />
        </Button>
        <Button className="primary" text="Share" onClick={sharePlaylist}>
          <IoIosSend />
        </Button>
      </div>
    </>
  );
};

const DeletePlaylistForm = ({toggleDelete, playlist}) => {
  const navigate = useNavigate();
  const {currentUser} = useAuth();

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const deletePlaylist = async () => {
    showLoader();
    try {
      await db.collection('playlists').doc(playlist.id).delete();

      addToast('success', 'Playlist deleted successfully.');
      navigate(`/profile/${currentUser.uid}/playlists`);
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <MdDelete className="icon_red" /> Are you sure you want to delete '{playlist.title}'?
      </h1>
      <div className="modal_content">
        <p>You cannot rewind this action.</p>
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleDelete}>
          <TbCircleOff />
        </Button>
        <Button className="primary red" text="Delete" onClick={(e) => deletePlaylist(e)}>
          <MdDeleteOutline />
        </Button>
      </div>
    </>
  );
};

const ClearPlaylistForm = ({toggleClear, playlist}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const clearPlaylist = async () => {
    if (playlist.tracks.length === 0) {
      addToast('info', 'This playlist is empty.');
      toggleClear();
      return;
    }

    showLoader();
    try {
      await db.collection('playlists').doc(playlist.id).update({
        tracks: [],
      });

      addToast('success', 'Playlist cleared successfully.');
      toggleClear();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <IoMdRefresh className="icon_red" /> Are you sure you want to clear '{playlist.title}'?
      </h1>
      <div className="modal_content">
        <p>You cannot rewind this action.</p>
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleClear}>
          <TbCircleOff />
        </Button>
        <Button className="primary red" text="Clear" onClick={(e) => clearPlaylist(e)}>
          <IoMdRefresh />
        </Button>
      </div>
    </>
  );
};

const Playlist = () => {
  const navigate = useNavigate();
  const {currentUser} = useAuth();

  const {playlistId} = useParams();
  const [playlist, setPlaylist] = useState(null);

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const player = usePlayer();

  const [isPlaylistActionsActive, setIsPlaylistActionsActive] = useState(false);
  const [isModifyActive, setIsModifyActive] = useState(false);
  const [isShareActive, setIsShareActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [isClearActive, setIsClearActive] = useState(false);
  const [formattedDate, setFormattedDate] = useState(null);

  useEffect(() => {
    const fetchPlaylist = () => {
      showLoader();

      try {
        // Unsubscribe from the previous listener
        let unsubscribe = () => {};

        // Set up a new listener
        const playlistRef = db.collection('playlists');
        if (playlistId) {
          const query = playlistRef.doc(playlistId);
          unsubscribe = query.onSnapshot((snapshot) => {
            if (!snapshot.exists) {
              navigate(`/profile/${currentUser.uid}/playlists`);
              return;
            }

            const data = {
              id: snapshot.id,
              ...snapshot.data(),
            };

            // Format the data.createdAt if its not like yyyy-mm-dd
            let date = data.createdAt;
            if (typeof date === 'object') {
              date = new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0];
            }

            setPlaylist(data);
            setFormattedDate(date);
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

    if (playlistId) {
      fetchPlaylist();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlaylistActions = () => {
    setIsPlaylistActionsActive(!isPlaylistActionsActive);
  };

  const toggleModify = () => {
    setIsModifyActive(!isModifyActive);
  };

  const toggleShare = () => {
    setIsShareActive(!isShareActive);
  };

  const toggleDelete = () => {
    setIsDeleteActive(!isDeleteActive);
  };

  const toggleClear = () => {
    setIsClearActive(!isClearActive);
  };

  const navigateToSearch = () => {
    navigate('/search');
  };

  const handlePlayButtonClick = () => {
    if (playlist.tracks.length === 0) {
      addToast('info', playlist.name + ' is empty.');
      return;
    }

    if (player.playlist === playlist.id) {
      player.setPlaying(!player.playing);
    } else {
      player.playTrack(playlist.tracks[0], playlist.tracks);
      player.setPlaylist(playlist.id);
      player.setPlaying(true);
    }
  };

  return (
    <>
      <Modal isOpen={isModifyActive} close={toggleModify}>
        <ModifyPlaylistForm toggleModify={toggleModify} playlist={playlist} />
      </Modal>

      <Modal isOpen={isShareActive} close={toggleShare} className="md">
        <SharePlaylistForm toggleShare={toggleShare} playlist={playlist} />
      </Modal>

      <Modal isOpen={isDeleteActive} close={toggleDelete}>
        <DeletePlaylistForm toggleDelete={toggleDelete} playlist={playlist} />
      </Modal>

      <Modal isOpen={isClearActive} close={toggleClear}>
        <ClearPlaylistForm toggleClear={toggleClear} playlist={playlist} />
      </Modal>

      {playlist && (
        <section className="playlist-section">
          <div className="playlist-container">
            <header className="playlist-header">
              <div className="playlist-header-photo">
                <img src={playlist.photoURL} alt="" />
              </div>
              <div className="playlist-header-info">
                <h2 className="playlist-header-title">{playlist.title}</h2>
                <span className="playlist-header-length">{playlist.tracks.length} tracks</span>
                <p className="playlist-header-description">
                  {playlist.description ? `"${playlist.description}" - ` : ''} {formattedDate}
                </p>
              </div>
            </header>
            <nav className="playlist-subnav">
              <ul className="playlist-subnav-list">
                <li className="playlist-subnav-item" onClick={handlePlayButtonClick}>
                  {player.playing && player.playlist === playlist.id ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className="playlist-subnav-item" onClick={() => togglePlaylistActions()}>
                  <FaEllipsisVertical />
                  {isPlaylistActionsActive ? (
                    <ul className="playlist-action-list">
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={toggleModify}>
                          <BiEdit />
                          <span>Edit Playlist</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={toggleClear}>
                          <IoMdRefresh />
                          <span>Clear tracks</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={toggleShare}>
                          <IoShareSocialOutline />
                          <span>Share</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={toggleDelete}>
                          <MdDeleteOutline />
                          <span>Delete Playlist</span>
                        </button>
                      </li>
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>
            {playlist.tracks.length > 0 && <PlaylistTrackList playlist={playlist} setPlaylist={setPlaylist} />}
          </div>
          {playlist.tracks.length === 0 && (
            <>
              <h2 className="no-data">There are no songs yet.</h2>
              <Button className="primary search-btn" text="Search songs" onClick={() => navigateToSearch()}>
                <BiSearchAlt />
              </Button>
            </>
          )}
        </section>
      )}
    </>
  );
};

export default Playlist;
