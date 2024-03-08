import '../../assets/css/albums.css';

import {useParams} from 'react-router-dom';
import useSpotifyAuth from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import Modal from '../../component/Modal';
import Button from '../form/Button';

import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';

import {FaCirclePlay, FaCirclePause, FaEllipsisVertical} from 'react-icons/fa6';
import {IoShuffleOutline, IoShareSocialOutline, IoPersonOutline} from 'react-icons/io5';
import {IoIosSend} from 'react-icons/io';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {TbCircleOff} from 'react-icons/tb';

const ShareAlbumForm = ({toggleShare, album}) => {
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

  const shareAlbum = async (e) => {
    e.preventDefault();

    if (selectedFriends.length === 0) {
      addToast('info', 'Please select at least one friend to share the album with.');
      return;
    }

    showLoader();
    try {
      // if friend has a notification for this album, return
      const notificationRef = db.collection('notifications');
      const promises = selectedFriends.map(async (friendId) => {
        const notificationSnapshot = await notificationRef.where('type', '==', 'New Album Recommendation').where('sender', '==', currentUser.uid).where('receiver', '==', friendId).get();
        if (notificationSnapshot.empty) {
          await notificationRef.add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            message: `${currentUser.displayName} wants you to listen to ${album.name} by ${album.artists[0].name}. Go check it out!`,
            receiver: friendId,
            sender: currentUser.uid,
            senderName: currentUser.displayName,
            senderPhoto: currentUser.photoURL,
            type: `New Album Recommendation`,
          });
        }
      });

      await Promise.all(promises);
      setSelectedFriends([]);
      addToast('success', 'Album shared!');
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
        Share Album
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
                    <div className="friend-card-photo">{friend.photoURL !== 'default' ? <img src={friend.photoURL} alt="" /> : ''}</div>
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
        <Button className="primary" text="Share" onClick={shareAlbum}>
          <IoIosSend />
        </Button>
      </div>
    </>
  );
};

const Album = () => {
  const [album, setAlbum] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const [isAlbumActionsOpen, setIsAlbumActionsOpen] = useState(false);
  const [isShareActive, setIsShareActive] = useState(false);

  const {albumId} = useParams();
  const {currentUser} = useAuth();
  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    const fetchAlbum = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        //console.log(data);
        setAlbum(data);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchAlbum();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, token]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleAlbumActions = () => {
    setIsAlbumActionsOpen(!isAlbumActionsOpen);
  };

  const toggleShare = () => {
    setIsShareActive(!isShareActive);
  };

  const saveAsPlaylist = async () => {
    showLoader();
    try {
      // save to playlists collection if not already saved
      const playlistRef = db.collection('playlists');
      const playlistSnapshot = await playlistRef.where('uid', '==', currentUser.uid).where('title', '==', album.name).get();
      if (playlistSnapshot.empty) {
        await playlistRef.add({
          title: album.name,
          description: `by ${album.artists[0].name}`,
          photoURL: album.images[1].url,
          uid: currentUser.uid,
          creator: currentUser.displayName,
          createdAt: album.release_date,
          tracks: album.tracks.items.map((track) => {
            return {
              id: track.id,
              name: track.name,
              artist: track.artists[0].name,
              album: album.name,
              track_number: track.track_number,
              duration: track.duration_ms,
              uri: track.uri,
            };
          }),
        });
      } else {
        addToast('info', 'Album already saved as playlist!');
        return;
      }

      addToast('success', 'Album saved as playlist!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <Modal isOpen={isShareActive} close={toggleShare}>
        <ShareAlbumForm toggleShare={toggleShare} album={album} />
      </Modal>

      {album && (
        <section className="album-section">
          <div className="album-container">
            <header className="album-header">
              <div className="album-header-photo">
                <img src={album.images[1].url} alt="" />
              </div>
              <div className="album-header-info">
                <h2 className="album-header-title">{album.name}</h2>
                <span className="album-header-length">{album.total_tracks} tracks</span>
                <p className="album-header-description">
                  <Link to={`/artist/${album.artists[0].id}`}>{album.artists[0].name}</Link> - {album.release_date}
                </p>
              </div>
            </header>
            <nav className="album-subnav">
              <ul className="album-subnav-list">
                <li className="album-subnav-item" onClick={toggleMusic}>
                  {isPlaying ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className={`album-subnav-item blue ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                  <IoShuffleOutline />
                </li>
                <li className="album-subnav-item" onClick={toggleAlbumActions}>
                  <FaEllipsisVertical />
                  {isAlbumActionsOpen ? (
                    <ul className="album-action-list">
                      <li className="album-actions-item">
                        <button className="btn-album-action" onClick={() => saveAsPlaylist()}>
                          <AiOutlinePlusCircle />
                          <span>Save As Playlist</span>
                        </button>
                      </li>
                      <li className="album-actions-item">
                        <Link to={`/artist/${album.artists[0].id}`} className="btn-album-action">
                          <IoPersonOutline />
                          <span>About Artist</span>
                        </Link>
                      </li>
                      <li className="album-actions-item">
                        <button className="btn-album-action" onClick={toggleShare}>
                          <IoShareSocialOutline />
                          <span>Share</span>
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

export default Album;
