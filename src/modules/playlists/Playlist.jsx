import {useParams, useNavigate, Link} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db, storage} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';
import {useAuth} from '../../hooks/useAuth';
import PopUp from '../../common/PopUp';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

import {FaCirclePlay} from 'react-icons/fa6';
import {FaCirclePause} from 'react-icons/fa6';
import {FaEllipsisVertical} from 'react-icons/fa6';
import {BiEdit} from 'react-icons/bi';
import {MdDeleteOutline} from 'react-icons/md';
import {IoMdRefresh} from 'react-icons/io';
import {MdOutlineSaveAlt} from 'react-icons/md';
import {IoShuffleOutline} from 'react-icons/io5';
import {IoShareSocial} from 'react-icons/io5';
import {IoIosSend} from 'react-icons/io';

const Playlist = () => {
  const navigate = useNavigate();
  const {currentUser} = useAuth();

  const {playlistId} = useParams();
  const [playlist, setPlaylist] = useState(null);

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [friends, setFriends] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const [isPlaylistActionsActive, setIsPlaylistActionsActive] = useState(false);
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [isShareActive, setIsShareActive] = useState(false);

  const [inputName, setInputName] = useState(null);
  const [inputDescription, setInputDescription] = useState(null);
  const [inputPhoto, setInputPhoto] = useState(null);
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

            // Format the date
            var date = new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            });

            setPlaylist(data);
            setFormattedDate(date);
            setInputName(data.title);
            setInputDescription(data.description);
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
  }, []);

  const toggleMusic = () => {
    if (playlist.songs.length === 0) {
      addToast('info', 'This playlist is empty.');
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const togglePlaylistActions = () => {
    setIsPlaylistActionsActive(!isPlaylistActionsActive);
  };

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const editPlaylist = async (e) => {
    e.preventDefault();

    if (inputName.trim() === '') {
      setInputName(playlist.title);
      addToast('error', 'Title cannot be empty!');
      return;
    }

    // validate file input to only accept images
    if (inputPhoto && !inputPhoto.type.includes('image')) {
      addToast('error', 'Playlist photo must be an image.');
      return;
    }

    showLoader();
    try {
      if (!inputPhoto) {
        await db.collection('playlists').doc(playlistId).update({
          title: inputName,
          description: inputDescription,
        });
      } else {
        // upload photo to storage: /playlists/{playlistId}
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`playlists/${inputPhoto.name}`);
        await fileRef.put(inputPhoto);

        // create playlist in firestore
        const playlistRef = db.collection('playlists');
        await playlistRef.doc(playlistId).update({
          title: inputName,
          description: inputDescription,
          photoURL: await fileRef.getDownloadURL(),
        });
      }

      addToast('success', 'Playlist updated successfully.');
      togglePopUp();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const clearPlaylist = async () => {
    if (playlist.songs.length === 0) {
      addToast('info', 'This playlist is empty.');
      return;
    }

    showLoader();
    try {
      await db.collection('playlists').doc(playlistId).update({
        songs: [],
      });

      addToast('success', 'Playlist cleared successfully.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const toggleSharePopUp = () => {
    setIsShareActive(!isShareActive);

    if (!isShareActive) {
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
    }
  };

  const sharePlaylist = async (e, friendId) => {
    e.preventDefault();
    showLoader();
    try {
      // if friend has a notification for this playlist, return
      const notificationRef = db.collection('notifications');
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
      addToast('success', 'Playlist shared!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const deletePlaylist = async () => {
    showLoader();
    try {
      await db.collection('playlists').doc(playlistId).delete();

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
        <Button type="button" text="Save" className="dark" onClick={(e) => editPlaylist(e)}>
          <MdOutlineSaveAlt />
        </Button>
      </PopUp>

      <PopUp isPopUpActive={isShareActive} onClose={() => toggleSharePopUp()}>
        {friends !== null && friends.length === 0 && <h2>There are no friends yet.</h2>}
        {friends && (
          <>
            <div className="share-friends-container">
              {friends.map((friend) => (
                <ul className="share-friend-list" key={friend.id}>
                  <li className="share-friend-item">
                    <div className="share-friend-photo">
                      <img src={friend.photoURL} alt="" />
                    </div>
                    <div className="share-friend-info">
                      <Link to={`/profile/${friend.id}`} className="share-friend-name">
                        {friend.displayName}
                      </Link>
                    </div>
                    <Button type="button" className="dark" onClick={(e) => sharePlaylist(e, friend.id)}>
                      <IoIosSend />
                    </Button>
                  </li>
                </ul>
              ))}
            </div>
          </>
        )}
      </PopUp>
      {playlist && (
        <section className="playlist-section">
          <div className="playlist-container">
            <header className="playlist-header">
              <div className="playlist-header-photo">
                <img src={playlist.photoURL} alt="" />
              </div>
              <div className="playlist-header-info">
                <h2 className="playlist-header-title">{playlist.title}</h2>
                <span className="playlist-header-length">{playlist.songs.length} tracks</span>
                <p className="playlist-header-description">
                  {playlist.description ? `"${playlist.description}" - ` : ''} {formattedDate}
                </p>
              </div>
            </header>
            <nav className="playlist-subnav">
              <ul className="playlist-subnav-list">
                <li className="playlist-subnav-item" onClick={() => toggleMusic()}>
                  {isPlaying ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className={`playlist-subnav-item blue ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                  <IoShuffleOutline />
                </li>
                <li className="playlist-subnav-item" onClick={() => togglePlaylistActions()}>
                  <FaEllipsisVertical />
                  {isPlaylistActionsActive ? (
                    <ul className="playlist-action-list">
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={() => togglePopUp()}>
                          <BiEdit />
                          <span>Edit Playlist</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={() => clearPlaylist()}>
                          <IoMdRefresh />
                          <span>Clear Songs</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={() => toggleSharePopUp()}>
                          <IoShareSocial />
                          <span>Share</span>
                        </button>
                      </li>
                      <li className="playlist-actions-item">
                        <button className="btn-playlist-action" onClick={() => deletePlaylist()}>
                          <MdDeleteOutline />
                          <span>Delete Playlist</span>
                        </button>
                      </li>
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>
          </div>
        </section>
      )}
    </>
  );
};

export default Playlist;
