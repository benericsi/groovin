import '../../assets/css/categories.css';
import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';

import {FaCirclePlay, FaCirclePause} from 'react-icons/fa6';

import CategoryTrackList from './CategoryTrackList';
import {usePlayer} from '../../hooks/usePlayer';

const CategoryPlaylist = () => {
  const [playlist, setPlaylist] = useState(null);

  const {playlistId} = useParams();
  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();
  const player = usePlayer();

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

  const handlePlayButtonClick = () => {
    const newTracks = playlist.tracks.items.map((track) => ({
      id: track.track.id,
      album: track.track.album.name,
      albumId: track.track.album.id,
      artist: track.track.artists[0].name,
      artistId: track.track.artists[0].id,
      name: track.track.name,
      image: track.track.album.images[0].url,
      duration: track.track.duration_ms,
      uri: track.track.uri,
      preview_url: track.track.preview_url,
      explicit: track.track.explicit,
    }));

    if (player.playlist === playlist.id) {
      player.setPlaying(!player.playing);
    } else {
      player.playTrack(newTracks[0], newTracks);
      player.setPlaylist(playlist.id);
      player.setPlaying(true);
    }
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
                <li className="album-subnav-item" onClick={handlePlayButtonClick}>
                  {player.playing && player.playlist === playlist.id ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className="album-subnav-item"></li>
              </ul>
            </nav>
            <CategoryTrackList tracks={playlist.tracks.items} playlist={playlist} />
          </div>
        </section>
      )}
    </>
  );
};

export default CategoryPlaylist;
