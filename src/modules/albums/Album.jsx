import '../../assets/css/albums.css';

import {useParams} from 'react-router-dom';
import useSpotifyAuth from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import {FaCirclePlay, FaCirclePause, FaEllipsisVertical} from 'react-icons/fa6';
import {IoShuffleOutline, IoShareSocialOutline, IoPersonOutline} from 'react-icons/io5';

const Album = () => {
  const [album, setAlbum] = useState(null);

  const {albumId} = useParams();
  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isAlbumActionsOpen, setIsAlbumActionsOpen] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data);
        setAlbum(data);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchAlbum();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, token]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleAlbumActions = () => {
    setIsAlbumActionsOpen(!isAlbumActionsOpen);
  };

  return (
    <>
      {album && (
        <section className="album-section">
          <div className="album-container">
            <header className="album-header">
              <div className="album-header-photo">
                <img src={album.images[1].url} alt="" />
              </div>
              <div className="album-header-info">
                <h2 className="album-header-title">{album.name}</h2>
                <span className="album-header-length">{album.total_tracks} tracks</span>
                <p className="album-header-description">
                  <Link to={`/artist/${album.artists[0].id}`}>{album.artists[0].name}</Link> - {album.release_date}
                </p>
              </div>
            </header>
            <nav className="album-subnav">
              <ul className="album-subnav-list">
                <li className="album-subnav-item" onClick={() => toggleMusic()}>
                  {isPlaying ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className={`album-subnav-item blue ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                  <IoShuffleOutline />
                </li>
                <li className="album-subnav-item" onClick={() => toggleAlbumActions()}>
                  <FaEllipsisVertical />
                  {isAlbumActionsOpen ? (
                    <ul className="album-action-list">
                      <li className="album-actions-item">
                        <Link to={`/artist/${album.artists[0].id}`} className="btn-album-action">
                          <IoPersonOutline />
                          <span>About Artist</span>
                        </Link>
                      </li>
                      <li className="album-actions-item">
                        <button className="btn-album-action" onClick={() => console.log('asd')}>
                          <IoShareSocialOutline />
                          <span>Share</span>
                        </button>
                      </li>
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>
          </div>
        </section>
      )}
    </>
  );
};

export default Album;
