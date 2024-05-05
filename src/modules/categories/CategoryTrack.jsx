import React, {useRef, useState, useMemo, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {usePlayer} from '../../hooks/usePlayer';

import Button from '../form/Button';
import Modal from '../../component/Modal';

import {HiHeart} from 'react-icons/hi';
import {HiOutlineHeart} from 'react-icons/hi';
import {FaEllipsisVertical, FaPlay, FaPause} from 'react-icons/fa6';
import {FaRegPlayCircle, FaRegPauseCircle} from 'react-icons/fa';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {MdExplicit, MdOutlineQueue} from 'react-icons/md';
import {MdAddCircle, MdAddCircleOutline} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';
import {IoMusicalNotesSharp} from 'react-icons/io5';

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
          name: track.name,
          album: track.album.name,
          albumId: track.album.id,
          artist: track.artists[0].name,
          artistsId: track.artists[0].id,
          duration: track.duration_ms,
          createdAt: new Date(),
          image: track.album.images[0].url,
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

const CategoryTrack = ({track, index, userFavs, updateUserFavourites, activeTrack, setActiveTrack, actionListIndex, setActionListIndex, handleTrackPlayButtonClick, handleAddToQueue}) => {
  const isFavourite = userFavs.some((favTrack) => favTrack.id === track.track.id);

  const [addToPlaylist, setAddToPlaylist] = useState(false);

  const actionListRef = useRef(null);
  const player = usePlayer();

  const readableDuration = useMemo(() => {
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(track.track.duration_ms / 60000);
    const seconds = ((track.track.duration_ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [track.track.duration_ms]);

  const readableTimeStamp = useMemo(() => {
    const date = new Date(track.added_at);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [track.added_at]);

  const handleUserFavourites = () => {
    if (isFavourite) {
      // Remove track from user favourites
      const newFavs = userFavs.filter((favTrack) => favTrack.id !== track.track.id);
      updateUserFavourites(newFavs);
    } else {
      // Add track to user favourites
      updateUserFavourites(userFavs, track.track);
    }
  };

  const toggleAddToPlaylist = () => {
    setAddToPlaylist(!addToPlaylist);
  };

  return (
    <>
      <Modal isOpen={addToPlaylist} close={toggleAddToPlaylist} className="md">
        <AddToPlaylistForm toggleForm={toggleAddToPlaylist} track={track.track} />
      </Modal>

      <div className={`track ${track === activeTrack ? 'active' : ''} ${track.track.id === player.currentSong?.id ? 'current' : ''}`} onClick={() => setActiveTrack(track)}>
        <div className="track-field" onClick={() => handleTrackPlayButtonClick(track)}>
          <span>{track.track.id === player.currentSong?.id && player.playing ? <IoMusicalNotesSharp /> : index + 1}</span>
          {track.track.id === player.currentSong?.id && player.playing ? <FaPause className="ic" /> : <FaPlay className="ic" />}
        </div>
        <div className="track-field">
          <img src={track.track.album.images[0].url} alt={track.track.name} />
          <div>
            <h3>{track.track.name}</h3>
            <Link to={`/artist/${track.track.artists[0].id}`}>
              {track.track.explicit ? <MdExplicit /> : ''}
              {track.track.artists[0].name}
            </Link>
          </div>
        </div>
        <div className="track-field">
          <Link to={`/album/${track.track.album.id}`}>{track.track.album.name}</Link>
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
            setActionListIndex(track.track.id === actionListIndex ? null : track.track.id);
          }}>
          <span>
            <FaEllipsisVertical />
          </span>

          {actionListIndex === track.track.id && (
            <ul className="track-actions-list" ref={actionListRef}>
              <li className="track-actions-item" onClick={() => handleTrackPlayButtonClick(track)}>
                <button className="btn-track-action">
                  {track.track.id === player.currentSong?.id && player.playing ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
                  <span>{track.track.id === player.currentSong?.id && player.playing ? 'Pause Song' : 'Play Song'}</span>
                </button>
              </li>
              <li className="track-actions-item" onClick={() => handleAddToQueue(track.track)}>
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
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryTrack;
