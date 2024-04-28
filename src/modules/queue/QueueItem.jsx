import {Link} from 'react-router-dom';
import {useRef, useEffect, useState} from 'react';
import {db} from '../../setup/Firebase';

import {usePlayer} from '../../hooks/usePlayer';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import Modal from '../../component/Modal';
import Button from '../form/Button';

import {AiOutlinePlusCircle} from 'react-icons/ai';
import {MdOutlineRemoveFromQueue} from 'react-icons/md';
import {MdAddCircle, MdAddCircleOutline} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';
import {MdExplicit} from 'react-icons/md';
import {FaEllipsisVertical} from 'react-icons/fa6';
import {FaRegPlayCircle, FaRegPauseCircle} from 'react-icons/fa';

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

        // Check if track already exists in the playlist
        if (!playlistData.tracks.some((t) => t.id === track.id)) {
          const updatedTracks = [...playlistData.tracks, track];
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

const QueueItem = ({track, activeTrack, setActiveTrack, actionListIndex, setActionListIndex, handleTrackPlayButtonClick, handleRemoveFromQueue}) => {
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
  }, []);

  const toggleAddToPlaylist = () => {
    setAddToPlaylist(!addToPlaylist);
  };

  return (
    <>
      <Modal isOpen={addToPlaylist} close={toggleAddToPlaylist} className="md">
        <AddToPlaylistForm toggleForm={toggleAddToPlaylist} track={track} />
      </Modal>

      <div className={`queue_item ${track === activeTrack ? 'active' : ''}`} onClick={() => setActiveTrack(track)}>
        <div className="queue_item-info">
          <img src={track.image} alt={track.name} />
          <div>
            <Link to={`/album/${track.albumId}`}>{track.name}</Link>
            <Link to={`/artist/${track.artistId}`}>
              {track.explicit ? <MdExplicit /> : ''}
              {track.artist}
            </Link>
          </div>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            setActiveTrack(track);
            setActionListIndex(track.id === actionListIndex ? null : track.id);
          }}>
          <FaEllipsisVertical />
          {actionListIndex === track.id ? (
            <ul className="track-actions-list" ref={actionListRef}>
              <li className="track-actions-item" onClick={() => handleTrackPlayButtonClick(track)}>
                <button className="btn-track-action">
                  {track === player.currentSong && player.playing ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
                  <span>{track === player.currentSong && player.playing ? 'Pause Song' : 'Play Song'}</span>
                </button>
              </li>
              {track !== player.currentSong ? (
                <li className="track-actions-item" onClick={() => handleRemoveFromQueue(track)}>
                  <button className="btn-track-action">
                    <MdOutlineRemoveFromQueue />
                    <span>Remove From Queue</span>
                  </button>
                </li>
              ) : null}
              <li className="track-actions-item" onClick={toggleAddToPlaylist}>
                <button className="btn-track-action">
                  <AiOutlinePlusCircle />
                  <span>Add To Playlist</span>
                </button>
              </li>
            </ul>
          ) : null}
        </span>
      </div>
    </>
  );
};

export default QueueItem;
