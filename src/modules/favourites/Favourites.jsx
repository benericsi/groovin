import '../../assets/css/favourites.css';
import image from '../../assets/images/4ac8112badd8b745bc547f52c0ad4828.jpg';

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {db} from '../../setup/Firebase';

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

const Favourites = () => {
  useTitle('Favourites');
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

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
              console.log(data.tracks);
              let sortedTracks = data.tracks.sort((a, b) => b.createdAt - a.createdAt); // Sort the tracks
              setTracks(sortedTracks);
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

  return (
    <>
      <section className="favourites-section">
        <div className="favourites-container">
          <header className="favourites-header">
            <div className="favourites-header-photo">
              <img src={image} alt="" />
            </div>
            <div className="favourites-header-info">
              <h2 className="favourites-header-title">Liked songs</h2>
              <span className="favourites-header-length">{tracks.length} tracks</span>
              <p className="favourites-header-description">"By {currentUser.displayName || currentUser.email.split('@')[0]}"</p>
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
        </div>
        {tracks.length > 0 ? (
          <div className="favourites">
            {tracks.map((track, index) => (
              <Favourite key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <>
            <h2 className="no-data">There are no favourites yet.</h2>
            <Button className="primary search-btn" text="Search songs" onClick={() => navigateToSearch()}>
              <BiSearchAlt />
            </Button>
          </>
        )}
      </section>
    </>
  );
};

export default Favourites;
