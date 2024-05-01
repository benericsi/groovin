import React from 'react';
import {useEffect, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';

import CategoryTrack from './CategoryTrack';

import {IoIosTimer} from 'react-icons/io';
import {usePlayer} from '../../hooks/usePlayer';

const CategoryTrackList = ({tracks, playlist}) => {
  const [userFavs, setUserFavs] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [actionListIndex, setActionListIndex] = useState(null);

  const {currentUser} = useAuth();
  const player = usePlayer();

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
      const newTrack = {
        id: track.id,
        name: track.name,
        album: track.album.name,
        albumId: track.album.id,
        artists: track.artists[0].name,
        artistsId: track.artists[0].id,
        duration: track.duration_ms,
        createdAt: new Date(),
        image: track.album.images[0].url,
        uri: track.uri,
        preview_url: track.preview_url,
        explicit: track.explicit,
      };

      newFavs = [...newFavs, newTrack];
    }
    // Update userFavs state
    setUserFavs(newFavs);

    // Update user's favourites in the database
    db.collection('favourites').doc(currentUser.uid).set({tracks: newFavs});
  };

  const handleTrackPlayButtonClick = (track) => {
    if (player.playing && player.currentSong.id === track.track.id) {
      player.setPlaying(false);
    } else {
      const trackInfo = {
        id: track.track.id,
        name: track.track.name,
        album: track.track.album.name,
        albumId: track.track.album.id,
        artist: track.track.artists[0].name,
        artistsId: track.track.artists[0].id,
        duration: track.track.duration_ms,
        image: track.track.album.images[0].url,
        uri: track.track.uri,
        preview_url: track.track.preview_url,
        explicit: track.track.explicit,
      };

      const trackIndex = tracks.findIndex((t) => t.track.id === track.track.id);
      console.log(trackIndex);
      const newQueue = tracks.slice(trackIndex).map((t) => ({
        id: t.track.id,
        name: t.track.name,
        album: t.track.album.name,
        albumId: t.track.album.id,
        artist: t.track.artists[0].name,
        artistsId: t.track.artists[0].id,
        duration: t.track.duration_ms,
        image: t.track.album.images[0].url,
        uri: t.track.uri,
        preview_url: t.track.preview_url,
        explicit: t.track.explicit,
      }));

      player.playTrack(trackInfo, newQueue);
    }

    player.setPlaylist(playlist.id);
  };

  const handleAddToQueue = (track) => {
    const trackInfo = {
      id: track.id,
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
    };

    player.addToQueue(trackInfo);
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

      {tracks.map((track, index) => (
        <CategoryTrack key={index} track={track} index={index} userFavs={userFavs} updateUserFavourites={updateUserFavourites} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} handleTrackPlayButtonClick={handleTrackPlayButtonClick} handleAddToQueue={handleAddToQueue} />
      ))}
    </div>
  );
};

export default CategoryTrackList;
