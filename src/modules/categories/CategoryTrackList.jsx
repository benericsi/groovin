import React from 'react';
import {useEffect, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';

import CategoryTrack from './CategoryTrack';

import {IoIosTimer} from 'react-icons/io';

const CategoryTrackList = ({tracks}) => {
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
        <CategoryTrack key={index} track={track} index={index} userFavs={userFavs} updateUserFavourites={updateUserFavourites} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} />
      ))}
    </div>
  );
};

export default CategoryTrackList;
