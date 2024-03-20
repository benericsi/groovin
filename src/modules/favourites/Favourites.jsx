import '../../assets/css/favourites.css';
import image from '../../assets/images/4ac8112badd8b745bc547f52c0ad4828.jpg';

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {db} from '../../setup/Firebase';
import {Reorder} from 'framer-motion';

import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useTitle} from '../../hooks/useTitle';

import Favourite from './Favourite';
import Button from '../form/Button';

import {BiSearchAlt} from 'react-icons/bi';
import {FaCirclePlay, FaCirclePause, FaEllipsisVertical} from 'react-icons/fa6';
import {IoMdRefresh} from 'react-icons/io';
import {IoShuffleOutline} from 'react-icons/io5';
import {IoIosTimer} from 'react-icons/io';

const Favourites = () => {
  useTitle('Favourites');
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaylistActionsActive, setIsPlaylistActionsActive] = useState(false);

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    let unsubscribe = () => {};

    const getFavourites = async () => {
      showLoader();
      try {
        const favsRef = db.collection('favourites');
        if (currentUser) {
          unsubscribe = favsRef.doc(currentUser.uid).onSnapshot((doc) => {
            const data = doc.data();
            if (data) {
              //let sortedTracks = data.tracks.sort((a, b) => b.createdAt - a.createdAt); // Sort the tracks
              setTracks(data.tracks);
              setIsLoading(false);
            }
          });
        }
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getFavourites();

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsubscribe();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Update the track order in the database
    if (!isDragging && tracks.length > 0) {
      db.collection('favourites').doc(currentUser.uid).update({
        tracks: tracks,
      });
    }
    // eslint-disable-next-line
  }, [isDragging]);

  const navigateToSearch = () => {
    navigate('/search');
  };

  const toggleMusic = () => {
    if (tracks.length === 0) {
      addToast('info', 'Favourites is empty.');
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const togglePlaylistActions = () => {
    setIsPlaylistActionsActive(!isPlaylistActionsActive);
  };

  const clearPlaylist = async () => {
    if (tracks.length === 0) {
      addToast('info', 'Favourites is empty.');
      return;
    }

    showLoader();
    try {
      await db.collection('favourites').doc(currentUser.uid).update({
        tracks: [],
      });

      addToast('success', 'Favourites cleared successfully.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const removeTrack = async (trackId) => {
    try {
      const newTracks = tracks.filter((track) => track.id !== trackId);
      await db.collection('favourites').doc(currentUser.uid).update({
        tracks: newTracks,
      });

      addToast('success', 'Track removed from favourites.');
    } catch (error) {
      addToast('error', error.message);
    }
  };

  return (
    <>
      {isLoading ? null : tracks.length === 0 ? (
        <section className="favourites-section">
          <h2 className="no-data">There are no favourites yet.</h2>
          <Button className="primary search-btn" text="Search songs" onClick={() => navigateToSearch()}>
            <BiSearchAlt />
          </Button>
        </section>
      ) : (
        <section className="favourites-section">
          <div className="favourites-container">
            <header className="favourites-header">
              <div className="favourites-header-photo">
                <img src={image} alt="" />
              </div>
              <div className="favourites-header-info">
                <h2 className="favourites-header-title">Liked songs</h2>
                <span className="favourites-header-length">{tracks.length} tracks</span>
                <p className="favourites-header-description">By {currentUser.displayName || currentUser.email.split('@')[0]}</p>
              </div>
            </header>
            <nav className="favourites-subnav">
              <ul className="favourites-subnav-list">
                <li className="favourites-subnav-item" onClick={() => toggleMusic()}>
                  {isPlaying ? <FaCirclePause /> : <FaCirclePlay />}
                </li>
                <li className={`favourites-subnav-item blue ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                  <IoShuffleOutline />
                </li>
                <li className="favourites-subnav-item" onClick={() => togglePlaylistActions()}>
                  <FaEllipsisVertical />
                  {isPlaylistActionsActive ? (
                    <ul className="favourites-action-list">
                      <li className="favourites-actions-item">
                        <button className="btn-favourites-action" onClick={() => clearPlaylist()}>
                          <IoMdRefresh />
                          <span>Clear tracks</span>
                        </button>
                      </li>
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>
            {tracks.length > 0 && (
              <div className="favourites-list">
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
                </div>
                <Reorder.Group
                  values={tracks}
                  onReorder={(newTracks) => {
                    setTracks(newTracks);
                  }}>
                  {tracks.map((track, index) => (
                    <Reorder.Item
                      key={track.id}
                      value={track}
                      onDragStart={() => {
                        setIsDragging(true);
                      }}
                      onDragEnd={() => {
                        setIsDragging(false);
                      }}>
                      <Favourite track={track} index={index} removeTrack={removeTrack} isDragging={isDragging} activeTrack={activeTrack} setActiveTrack={setActiveTrack} />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default Favourites;
