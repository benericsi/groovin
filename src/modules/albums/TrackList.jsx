import '../../assets/css/albums.css';

import React from 'react';
import {useEffect, useState} from 'react';
import {db} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';

import {IoIosTimer} from 'react-icons/io';
import AlbumTrack from './AlbumTrack';

const TrackList = ({album}) => {
  const [userFavs, setUserFavs] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [actionListIndex, setActionListIndex] = useState(null);

  const {currentUser} = useAuth();

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
        <AlbumTrack key={track.id} album={album} track={track} index={index} userFavs={userFavs} updateUserFavourites={updateUserFavourites} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} />
      ))}
    </div>
  );
};

export default TrackList;
