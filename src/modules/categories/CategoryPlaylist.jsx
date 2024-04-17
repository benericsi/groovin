import '../../assets/css/categories.css';
import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';

import {FaCirclePlay, FaCirclePause} from 'react-icons/fa6';
import {IoShuffleOutline} from 'react-icons/io5';

import CategoryTrackList from './CategoryTrackList';

const CategoryPlaylist = () => {
  const [playlist, setPlaylist] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const {playlistId} = useParams();
  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    if (!token) return;
    showLoader();
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setPlaylist(data);
        hideLoader();
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      })
      .finally(() => {
        hideLoader();
      });

    // eslint-disable-next-line
  }, [token, playlistId]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {playlist && (
        <section className="album-section">
          <div className="album-container">
            <header className="album-header">
              <div className="album-header-photo">
                <img src={playlist.images[0].url} alt="" />
              </div>
              <div className="album-header-info">
                <h2 className="album-header-title">{playlist.name}</h2>
                <span className="album-header-length">{playlist.tracks.items.length} tracks</span>
                <p className="album-header-description">
                  <span>
                    {playlist.description} - {`by ${playlist.owner.display_name}`}
                  </span>
                </p>
              </div>
            </header>
            <nav className="album-subnav">
              <ul className="album-subnav-list">
                <li className="album-subnav-item" onClick={toggleMusic}>
                  {isPlaying ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className={`album-subnav-item blue ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                  <IoShuffleOutline />
                </li>
                <li className="album-subnav-item"></li>
              </ul>
            </nav>
            <CategoryTrackList tracks={playlist.tracks.items} />
          </div>
        </section>
      )}
    </>
  );
};

export default CategoryPlaylist;
