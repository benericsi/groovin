import React, {useMemo, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {usePlayer} from '../../hooks/usePlayer';

import Modal from '../../component/Modal';
import Button from '../form/Button';

import {HiHeart} from 'react-icons/hi';
import {HiOutlineHeart} from 'react-icons/hi';
import {FaEllipsisVertical, FaPlay, FaPause} from 'react-icons/fa6';
import {FaRegPlayCircle, FaRegPauseCircle} from 'react-icons/fa';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {MdAddCircle, MdAddCircleOutline, MdDeleteOutline, MdExplicit, MdOutlineQueue} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';
import {IoMusicalNotesSharp} from 'react-icons/io5';

const AddToPlaylistForm = ({toggleForm, currentPlaylist, track}) => {
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
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((playlist) => playlist.id !== currentPlaylist.id)
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
          album: track.album,
          albumId: track.albumId,
          artist: track.artist,
          artistId: track.artistId,
          name: track.name,
          image: track.image,
          duration: track.duration,
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

const PlaylistTrack = ({index, playlist, track, userFavs, updateUserFavourites, activeTrack, setActiveTrack, actionListIndex, setActionListIndex, removeTrack, handleTrackPlayButtonClick, handleAddToQueue}) => {
  const isFavourite = userFavs.some((favTrack) => favTrack.id === track.id);
  const [addToPlaylist, setAddToPlaylist] = useState(false);

  const actionListRef = useRef(null);
  const player = usePlayer();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionListRef.current && !actionListRef.current.contains(event.target)) {
        setActionListIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };

    // eslint-disable-next-line
  }, []);

  const toggleAddToPlaylist = () => {
    setAddToPlaylist(!addToPlaylist);
  };

  const readableDuration = useMemo(() => {
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(track.duration / 60000);
    const seconds = ((track.duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [track.duration]);

  const readableTimeStamp = useMemo(() => {
    if (track.createdAt?.seconds) {
      return new Date(track.createdAt.seconds * 1000).toISOString().split('T')[0];
    } else {
      return new Date(track.createdAt).toISOString().split('T')[0];
    }
  }, [track.createdAt]);

  const handleUserFavourites = () => {
    if (isFavourite) {
      // Remove track from user favourites
      const newFavs = userFavs.filter((favTrack) => favTrack.id !== track.id);
      updateUserFavourites(newFavs);
    } else {
      // Add track to user favourites
      updateUserFavourites(userFavs, track);
    }
  };

  return (
    <>
      <Modal isOpen={addToPlaylist} close={toggleAddToPlaylist} className="md">
        <AddToPlaylistForm toggleForm={toggleAddToPlaylist} currentPlaylist={playlist} track={track} />
      </Modal>

      <div className={`track ${track === activeTrack ? 'active' : ''}  ${track.id === player.currentSong?.id ? 'current' : ''}`} onClick={() => setActiveTrack(track)}>
        <div className="track-field" onClick={() => handleTrackPlayButtonClick(track)}>
          <span>{track.id === player.currentSong?.id && player.playing ? <IoMusicalNotesSharp /> : index + 1}</span>
          {track.id === player.currentSong?.id && player.playing ? <FaPause className="ic" /> : <FaPlay className="ic" />}
        </div>
        <div className="track-field">
          <img src={track.image} alt={track.name} />
          <div>
            <h3>{track.name}</h3>
            <Link to={`/artist/${track.artistId}`}>
              {track.explicit ? <MdExplicit /> : ''}
              {track.artist}
            </Link>
          </div>
        </div>
        <div className="track-field">
          <Link to={`/album/${track.albumId}`}>{track.album}</Link>
        </div>
        <div className="track-field">
          <span>{readableTimeStamp}</span>
        </div>
        <div className="track-field" onClick={handleUserFavourites}>
          <span>{isFavourite ? <HiHeart /> : <HiOutlineHeart />}</span>
        </div>
        <div className="track-field">
          <span>{readableDuration}</span>
        </div>
        <div
          className="track-field"
          onClick={(e) => {
            e.stopPropagation();
            setActiveTrack(track);
            setActionListIndex(track.id === actionListIndex ? null : track.id);
          }}>
          <span>
            <FaEllipsisVertical />
          </span>

          {actionListIndex === track.id && (
            <ul className="track-actions-list" ref={actionListRef}>
              <li className="track-actions-item" onClick={() => handleTrackPlayButtonClick(track)}>
                <button className="btn-track-action">
                  {track.id === player.currentSong?.id && player.playing ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
                  <span>{track.id === player.currentSong?.id && player.playing ? 'Pause Song' : 'Play Song'}</span>
                </button>
              </li>
              <li className="track-actions-item" onClick={() => handleAddToQueue(track)}>
                <button className="btn-track-action">
                  <MdOutlineQueue />
                  <span>Add To Queue</span>
                </button>
              </li>
              <li className="track-actions-item" onClick={toggleAddToPlaylist}>
                <button className="btn-track-action">
                  <AiOutlinePlusCircle />
                  <span>Add To Playlist</span>
                </button>
              </li>
              <li className="track-actions-item" onClick={() => removeTrack(track.id)}>
                <button className="btn-track-action">
                  <MdDeleteOutline />
                  <span>Remove Track</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistTrack;
