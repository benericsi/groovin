import '../../assets/css/albums.css';

import React from 'react';
import {useEffect, useState} from 'react';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';

import {IoIosTimer} from 'react-icons/io';
import AlbumTrack from './AlbumTrack';
import {usePlayer} from '../../hooks/usePlayer';

const TrackList = ({album}) => {
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
      const trackInfo = {
        id: track.id,
        createdAt: new Date(),
        album: album.name,
        albumId: album.id,
        artist: album.artists[0].name,
        artistId: album.artists[0].id,
        name: track.name,
        image: album.images[0].url, // 64x64
        duration: track.duration_ms,
        uri: track.uri,
        preview_url: track.preview_url,
        explicit: track.explicit,
      };

      newFavs = [...newFavs, trackInfo];
    }

    // Update userFavs state
    setUserFavs(newFavs);

    // Update user's favourites in the database
    db.collection('favourites').doc(currentUser.uid).set({tracks: newFavs});
  };

  const handleTrackPlayButtonClick = (track) => {
    if (player.playing && player.currentSong.id === track.id) {
      player.setPlaying(false);
    } else {
      const trackInfo = {
        id: track.id,
        album: album.name,
        albumId: album.id,
        artist: album.artists[0].name,
        artistId: album.artists[0].id,
        name: track.name,
        image: album.images[0].url, // 64x64
        duration: track.duration_ms,
        uri: track.uri,
        preview_url: track.preview_url,
        explicit: track.explicit,
      };

      const newQueue = album.tracks.items.slice(album.tracks.items.indexOf(track)).map((t) => ({
        id: t.id,
        album: album.name,
        albumId: album.id,
        artist: album.artists[0].name,
        artistId: album.artists[0].id,
        name: t.name,
        image: album.images[0].url, // 64x64
        duration: t.duration_ms,
        uri: t.uri,
        preview_url: t.preview_url,
        explicit: t.explicit,
      }));

      player.playTrack(trackInfo, newQueue);
    }

    player.setPlaylist(album.id);
  };

  const handleAddToQueue = (track) => {
    const trackInfo = {
      id: track.id,
      album: album.name,
      albumId: album.id,
      artist: album.artists[0].name,
      artistId: album.artists[0].id,
      name: track.name,
      image: album.images[0].url, // 64x64
      duration: track.duration_ms,
      uri: track.uri,
      preview_url: track.preview_url,
      explicit: track.explicit,
    };

    player.addToQueue(trackInfo);
  };

  return (
    <div className="album-list">
      <div className="table-header">
        <div className="table-header-item">
          <span>#</span>
        </div>
        <div className="table-header-item">
          <span>Title</span>
        </div>
        <div className="table-header-item"></div>
        <div className="table-header-item">
          <span>
            <IoIosTimer />
          </span>
        </div>
        <div className="table-header-item"></div>
      </div>

      {album.tracks.items.map((track, index) => (
        <AlbumTrack key={track.id} album={album} track={track} index={index} userFavs={userFavs} updateUserFavourites={updateUserFavourites} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} handleTrackPlayButtonClick={handleTrackPlayButtonClick} handleAddToQueue={handleAddToQueue} />
      ))}
    </div>
  );
};

export default TrackList;
