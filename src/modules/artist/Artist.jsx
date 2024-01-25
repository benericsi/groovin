import '../../assets/css/artist.css';

import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import {useToast} from '../../hooks/useToast';

import ArtistSubNav from './ArtistSubNav';

import {RiAccountCircleFill} from 'react-icons/ri';

const Artist = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {addToast} = useToast();

  useEffect(() => {
    if (location.state === null) {
      addToast('info', 'Artist was not found.');
      navigate('/search');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!location.state) {
    return null;
  }

  const {artist} = location.state;

  const readableFollowers = location.state ? artist.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;

  return (
    <>
      <div className="artist-header">
        <div className="header-pre">
          <div className="artist-background"></div>
        </div>
        <div className="artist-profile-details">
          <div className="artist-profile-image">{artist.images.length > 0 ? <img src={artist.images[2].url} alt={artist.name} /> : <RiAccountCircleFill className="default-photo" />}</div>
          <div className="artist-profile-actions">
            <span className="artist-profile-name">{artist.name}</span>
            <div className="artist-info">
              <span>Followers: {readableFollowers}</span>
            </div>
          </div>
        </div>

        <ArtistSubNav artist={artist} />
      </div>

      <div className="artist-body">
        <Outlet context={{artist}} />
      </div>
    </>
  );
};

export default Artist;
