import '../../assets/css/tracks.css';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useTitle} from '../../hooks/useTitle';
import {useState, useEffect, useRef} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useLocation, useNavigate, Link} from 'react-router-dom';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';

import Modal from '../../component/Modal';
import Button from '../form/Button';

import {IoReload} from 'react-icons/io5';
import {FaRegPlayCircle} from 'react-icons/fa';
import {MdOutlineQueue} from 'react-icons/md';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {IoHeartDislikeOutline} from 'react-icons/io5';
import {HiOutlineHeart} from 'react-icons/hi';
import {IoPersonOutline} from 'react-icons/io5';
import {PiVinylRecordLight} from 'react-icons/pi';
import {MdAddCircle, MdAddCircleOutline} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';

const AddToPlaylistForm = ({toggleForm, track}) => {
  const {currentUser} = useAuth();

  const [playlists, setPlaylists] = useState(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    let unsubscribe = {};

    showLoader();
    try {
      unsubscribe = db
        .collection('playlists')
        .where('uid', '==', currentUser.uid)
        .onSnapshot((snapshot) => {
          setPlaylists(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        });
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }

    return () => {
      unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlaylistSelection = (playlistId) => {
    setSelectedPlaylists((prevSelected) => {
      if (prevSelected.includes(playlistId)) {
        return prevSelected.filter((id) => id !== playlistId);
      } else {
        return [...prevSelected, playlistId];
      }
    });
  };

  const addTrackToPlaylists = async (e) => {
    e.preventDefault();

    if (selectedPlaylists.length === 0) {
      addToast('info', 'Please select at least one playlist.');
      return;
    }

    showLoader();
    try {
      const batch = db.batch();

      for (let playlistId of selectedPlaylists) {
        const playlistRef = db.collection('playlists').doc(playlistId);
        const playlistDoc = await playlistRef.get();
        const playlistData = playlistDoc.data();
        const newTrack = {
          id: track.id,
          createdAt: new Date(),
          album: track.album.name,
          albumId: track.album.id,
          artist: track.artists[0].name,
          artistId: track.artists[0].id,
          name: track.name,
          image: track.album.images[0].url,
          duration: track.duration_ms,
          uri: track.uri,
          preview_url: track.preview_url,
          explicit: track.explicit,
        };

        // Check if track already exists in the playlist
        if (!playlistData.tracks.some((t) => t.id === newTrack.id)) {
          const updatedTracks = [...playlistData.tracks, newTrack];
          batch.update(playlistRef, {tracks: updatedTracks});
        }
      }

      await batch.commit();

      addToast('success', 'Track added to selected playlists!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
      toggleForm();
    }
  };

  return (
    <>
      <h1 className="modal_title">
        <MdAddCircle />
        Select Playlist(s)
      </h1>
      <div className="modal_content">
        {playlists !== null && playlists.length === 0 && <h2>There are no playlist yet.</h2>}
        {playlists && playlists.length > 0 && (
          <>
            <p>You can add the song to the selected playlists. You can select a playlist by clicking on them.</p>
            <div className="playlists-container">
              {playlists &&
                playlists.map((playlist, index) => (
                  <div className={`playlist-card ${selectedPlaylists.includes(playlist.id) ? 'selected' : ''}`} key={index} onClick={() => togglePlaylistSelection(playlist.id)}>
                    <div className="playlist-card-photo">
                      <img src={playlist.photoURL} alt="" />
                    </div>
                    <div className="playlist-card-name">{playlist.title}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleForm}>
          <TbCircleOff />
        </Button>
        <Button className="primary" text="Add to Playlist" onClick={addTrackToPlaylists}>
          <MdAddCircleOutline />
        </Button>
      </div>
    </>
  );
};

const Tracks = () => {
  useTitle('Tracks');

  const {currentUser} = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const q = query.get('q');

  const [tracks, setTracks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [openPlaylistIndex, setOpenPlaylistIndex] = useState(null);
  const [userFavs, setUserFavs] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const trackActionsRef = useRef(null);

  const handleTogglePlaylist = (index) => {
    setOpenPlaylistIndex(index === openPlaylistIndex ? null : index);
    setSelectedTrack(tracks[index]);
  };

  useEffect(() => {
    // get user favourites realtime
    const unsubscribe = db
      .collection('favourites')
      .doc(currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setUserFavs(doc.data().tracks);
        }
      });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trackActionsRef.current && !trackActionsRef.current.contains(e.target)) {
        setOpenPlaylistIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    if (q === '' || q === null || q === undefined) {
      navigate('/search');
      return;
    }
    showLoader();
    fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=20&offset=${(page - 1) * 20}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTracks((prev) => [...prev, ...data.tracks.items]);
        setHasMore(data.tracks.items.length > 0);
        hideLoader();
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      });

    // eslint-disable-next-line
  }, [q, page, token]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const toggleAddToPlaylist = () => {
    setIsAddToPlaylistOpen(!isAddToPlaylistOpen);
  };

  const saveToFavs = (e, track) => {
    e.stopPropagation();

    showLoader();
    try {
      const favsRef = db.collection('favourites').doc(currentUser.uid);

      favsRef.get().then((doc) => {
        if (doc.exists) {
          if (doc.data().tracks.some((t) => t.id === track.id)) {
            addToast('info', 'Track is already on your favourites list.');
          } else {
            favsRef.update({
              tracks: [
                ...doc.data().tracks,
                {
                  id: track.id,
                  createdAt: new Date(),
                  album: track.album.name,
                  albumId: track.album.id,
                  artist: track.artists[0].name,
                  artistId: track.artists[0].id,
                  name: track.name,
                  image: track.album.images[0].url,
                  duration: track.duration_ms,
                  uri: track.uri,
                  preview_url: track.preview_url,
                  explicit: track.explicit,
                },
              ],
            });
            addToast('success', 'Track added to your favourites!');
          }
        } else {
          favsRef.set({
            tracks: [
              {
                id: track.id,
                createdAt: new Date(),
                album: track.album.name,
                albumId: track.album.id,
                artist: track.artists[0].name,
                artistId: track.artists[0].id,
                name: track.name,
                image: track.album.images[0].url, // 64x64
                duration: track.duration_ms,
                uri: track.uri,
                preview_url: track.preview_url,
                explicit: track.explicit,
              },
            ],
          });
          addToast('success', 'Track added to your favourites!');
        }
      });
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const removeFromFavs = (e, track) => {
    e.stopPropagation();

    showLoader();
    try {
      const favsRef = db.collection('favourites').doc(currentUser.uid);

      favsRef.get().then((doc) => {
        if (doc.exists) {
          if (doc.data().tracks.some((t) => t.id === track.id)) {
            favsRef.update({
              tracks: doc.data().tracks.filter((t) => t.id !== track.id),
            });
            addToast('success', 'Track removed from your favourites!');
          } else {
            addToast('info', 'Track is not on your favourites list.');
          }
        } else {
          addToast('info', 'Track is not on your favourites list.');
        }
      });
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <Modal isOpen={isAddToPlaylistOpen} close={toggleAddToPlaylist} className="md">
        <AddToPlaylistForm toggleForm={toggleAddToPlaylist} track={selectedTrack} />
      </Modal>

      <div className="tracks-body">
        <section className="tracks-section">
          {tracks.length > 0 && (
            <section className="body-section">
              <div className="list-header">
                <h2>Tracks</h2>
              </div>
              <div className="search-list">
                {tracks.map((track, index) => (
                  <div className="search-card" key={track.id} onClick={() => handleTogglePlaylist(index)}>
                    {openPlaylistIndex === index && (
                      <ul className="track-actions-list" ref={trackActionsRef}>
                        <li className="track-actions-item">
                          <button className="btn-track-action">
                            <FaRegPlayCircle />
                            <span>Play Song</span>
                          </button>
                        </li>
                        <li className="track-actions-item">
                          <button className="btn-track-action">
                            <MdOutlineQueue />
                            <span>Add To Queue</span>
                          </button>
                        </li>
                        <li className="track-actions-item">
                          <button className="btn-track-action" onClick={toggleAddToPlaylist}>
                            <AiOutlinePlusCircle />
                            <span>Add To Playlist</span>
                          </button>
                        </li>
                        <li className="track-actions-item">
                          {userFavs.some((fav) => fav.id === track.id) ? (
                            <button className="btn-track-action" onClick={(e) => removeFromFavs(e, track)}>
                              <IoHeartDislikeOutline />
                              <span>Remove From Favs</span>
                            </button>
                          ) : (
                            <button className="btn-track-action" onClick={(e) => saveToFavs(e, track)}>
                              <HiOutlineHeart />
                              <span>Add To Favourites</span>
                            </button>
                          )}
                        </li>

                        <li className="track-actions-item">
                          <Link to={`/artist/${track.artists[0].id}`} className="btn-track-action">
                            <IoPersonOutline />
                            <span>About Artist</span>
                          </Link>
                        </li>
                        <li className="track-actions-item">
                          <Link to={`/album/${track.album.id}`} className="btn-track-action">
                            <PiVinylRecordLight />
                            <span>Visit Album</span>
                          </Link>
                        </li>
                      </ul>
                    )}
                    <img className="search-card-photo track" src={track.album.images[1].url} alt={track.name} />
                    <div className="search-card-name">{track.name}</div>
                    <div className="search-card-info capitalize">{track.type}</div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <form className="load-more">
                  <Button className="primary " onClick={loadMore} text="Load more">
                    <IoReload />
                  </Button>
                </form>
              )}
            </section>
          )}
        </section>
      </div>
    </>
  );
};

export default Tracks;
