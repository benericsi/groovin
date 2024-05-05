import '../../assets/css/player.css';
import {Link} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {db} from '../../setup/Firebase';

import {useAuth} from '../../hooks/useAuth';
import {usePlayer} from '../../hooks/usePlayer';

import Controls from './Controls';

import {HiHeart, HiOutlineHeart} from 'react-icons/hi';
import {HiOutlineQueueList} from 'react-icons/hi2';
import {HiQueueList} from 'react-icons/hi2';

const AudioPlayer = ({isQueueOpen, toggleQueueOpen}) => {
  const [userFavs, setUserFavs] = useState([]);
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

  const handleUserFavourites = () => {
    if (userFavs.some((favTrack) => favTrack.id === player.currentSong?.id)) {
      const newFavs = userFavs.filter((favTrack) => favTrack.id !== player.currentSong.id);
      updateUserFavourites(newFavs);
    } else {
      updateUserFavourites(userFavs, player.currentSong);
    }
  };

  const updateUserFavourites = (newFavs) => {
    if (player.currentSong && !userFavs.some((favTrack) => favTrack.id === player.currentSong.id)) {
      player.currentSong.createdAt = new Date();
      newFavs = [...newFavs, player.currentSong];
    }
    setUserFavs(newFavs);
    db.collection('favourites').doc(currentUser.uid).set({tracks: newFavs});
  };

  console.log(player.playing, player.queue, player.currentSong, player.playlist);

  return (
    <div className="player">
      <div className="player_song-info">
        <img src={player.currentSong?.image} alt={player.currentSong?.name} />
        <div>
          <Link to={`/album/${player.currentSong?.albumId}`}>{player.currentSong?.name}</Link>
          <Link to={`/artist/${player.currentSong?.artistId}`}>{player.currentSong?.artist}</Link>
        </div>
        <div className="fav-btn" onClick={handleUserFavourites}>
          {userFavs.some((favTrack) => favTrack.id === player.currentSong?.id) ? <HiHeart /> : <HiOutlineHeart />}
        </div>
      </div>
      <Controls />
      <div className="player_queue">{isQueueOpen ? <HiQueueList onClick={toggleQueueOpen} className="active" /> : <HiOutlineQueueList onClick={toggleQueueOpen} />}</div>
    </div>
  );
};

export default AudioPlayer;
