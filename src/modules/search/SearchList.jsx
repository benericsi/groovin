import React, {useEffect, useState, useRef} from 'react';
import {Link} from 'react-router-dom';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';

import Modal from '../../component/Modal';
import Button from '../form/Button';

import {MdAddCircle, MdAddCircleOutline} from 'react-icons/md';
import {MdAccountCircle} from 'react-icons/md';
import {FaRegPlayCircle} from 'react-icons/fa';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {HiOutlineHeart} from 'react-icons/hi';
import {IoHeartDislikeOutline} from 'react-icons/io5';
import {MdOutlineQueue} from 'react-icons/md';
import {IoPersonOutline} from 'react-icons/io5';
import {PiVinylRecordLight} from 'react-icons/pi';
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

const SearchList = ({data}) => {
  //console.log(data);
  const [openPlaylistIndex, setOpenPlaylistIndex] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [userFavs, setUserFavs] = useState([]);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  const {currentUser} = useAuth();

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const trackActionsRef = useRef(null);

  const handleTogglePlaylist = (index) => {
    setOpenPlaylistIndex(index === openPlaylistIndex ? null : index);
    setSelectedTrack(data.tracks[index]);
  };

  useEffect(() => {
    if (openPlaylistIndex !== null) {
      document.querySelector('.main-body').style.overflow = 'hidden';
    } else {
      document.querySelector('.main-body').style.overflow = 'auto';
    }

    return () => {
      document.querySelector('.main-body').style.overflow = 'auto';
    };
  }, [openPlaylistIndex]);

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

      <div className="search-section-body">
        {data.tracks.length > 0 && (
          <section className="body-section">
            <h2>Tracks</h2>
            <div className="search-list">
              {data.tracks.map((track, index) => (
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
                  <div className="search-card-info">{track.artists[0].name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.albums.length > 0 && (
          <section className="body-section">
            <h2>Albums</h2>
            <div className="search-list">
              {data.albums.map((album) => (
                <Link to={`/album/${album.id}`} className="search-card" key={album.id}>
                  <img className="search-card-photo album" src={album.images[1].url} alt={album.name} />
                  <div className="search-card-name">{album.name}</div>
                  <div className="search-card-info">{album.artists[0].name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.artists.length > 0 && (
          <section className="body-section">
            <h2>Artists</h2>
            <div className="search-list">
              {data.artists.map((artist) => (
                <Link to={`/artist/${artist.id}`} className="search-card" key={artist.id}>
                  {artist.images.length > 0 ? <img className="search-card-photo artist" src={artist.images[1].url} alt={artist.name} /> : <MdAccountCircle className="photo-alt artist" />}
                  <div className="search-card-name">{artist.name}</div>
                  <div className="search-card-info capitalize">{artist.type}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.playlists.length > 0 && (
          <section className="body-section">
            <h2>Playlists</h2>
            <div className="search-list">
              {data.playlists.map((playlist) => (
                <Link to={`/profile/${playlist.uid}/playlists/${playlist.id}`} className="search-card" key={playlist.id}>
                  <img className="search-card-photo playlist" src={playlist.photoURL} alt={playlist.title} />
                  <div className="search-card-name">{playlist.title}</div>
                  <div className="search-card-info">{playlist.creator}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.users.length > 0 && (
          <section className="body-section">
            <h2>Users</h2>
            <div className="search-list">
              {data.users.map((user) => (
                <Link to={`/profile/${user.id}`} className="search-card" key={user.id}>
                  <img className="search-card-photo user" src={user.photoURL} alt={user.displayName} />
                  <div className="search-card-name">{user.displayName}</div>
                  <div className="search-card-info">{user.email}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default SearchList;
