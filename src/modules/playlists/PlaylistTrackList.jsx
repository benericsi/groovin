import React, {useEffect, useState} from 'react';
import {Reorder} from 'framer-motion';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';

import PlaylistTrack from './PlaylistTrack';

import {IoIosTimer} from 'react-icons/io';
import {usePlayer} from '../../hooks/usePlayer';

const PlaylistTrackList = ({playlist, setPlaylist}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [userFavs, setUserFavs] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [actionListIndex, setActionListIndex] = useState(null);

  const {currentUser} = useAuth();
  const player = usePlayer();

  useEffect(() => {
    // Update the track order in the database
    if (!isDragging && playlist.tracks.length > 0) {
      db.collection('playlists').doc(playlist.id).update({
        tracks: playlist.tracks,
      });
    }
    // eslint-disable-next-line
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      setActionListIndex(null);
    }
  }, [isDragging]);

  useEffect(() => {
    // get user favourites realtime
    const unsubscribe = db
      .collection('favourites')
      .doc(currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          // console.log(doc.data().tracks);
          setUserFavs(doc.data().tracks);
        }
      });

    return unsubscribe;
  }, [currentUser]);

  const updateUserFavourites = (newFavs, track) => {
    // Only create trackInfo if a new track is being added
    if (track && !userFavs.some((favTrack) => favTrack.id === track.id)) {
      track.createdAt = new Date();
      newFavs = [...newFavs, track];
    }
    // Update userFavs state
    setUserFavs(newFavs);

    // Update user's favourites in the database
    db.collection('favourites').doc(currentUser.uid).set({tracks: newFavs});
  };

  const removeTrack = async (trackId) => {
    await db
      .collection('playlists')
      .doc(playlist.id)
      .update({
        tracks: playlist.tracks.filter((track) => track.id !== trackId),
      });
  };

  const handleTrackPlayButtonClick = (track) => {
    if (player.playing && player.currentSong.id === track.id) {
      player.setPlaying(false);
    } else {
      player.playTrack(track, playlist.tracks.slice(playlist.tracks.indexOf(track)));
    }

    player.setPlaylist(playlist.id);
  };

  const handleAddToQueue = (track) => {
    player.addToQueue(track);
  };

  return (
    <div className="playlist-list">
      <div className="table-header">
        <div className="table-header-item">
          <span>#</span>
        </div>
        <div className="table-header-item">
          <span>Title</span>
        </div>
        <div className="table-header-item">
          <span>Album</span>
        </div>
        <div className="table-header-item">
          <span>Added at</span>
        </div>
        <div className="table-header-item"></div>
        <div className="table-header-item">
          <span>
            <IoIosTimer />
          </span>
        </div>
        <div className="table-header-item"></div>
      </div>
      <Reorder.Group
        values={playlist.tracks}
        onReorder={(newTracks) => {
          setPlaylist({...playlist, tracks: newTracks});
        }}>
        {playlist.tracks.map((track, index) => (
          <Reorder.Item key={track.id} value={track} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
            <PlaylistTrack key={track.id} playlist={playlist} track={track} index={index} userFavs={userFavs} updateUserFavourites={updateUserFavourites} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} removeTrack={removeTrack} handleTrackPlayButtonClick={handleTrackPlayButtonClick} handleAddToQueue={handleAddToQueue} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default PlaylistTrackList;
