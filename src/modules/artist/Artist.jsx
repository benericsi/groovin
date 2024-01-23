import '../../assets/css/artist.css';

import {Outlet, useLocation} from 'react-router-dom';

import {RiAccountCircleFill} from 'react-icons/ri';

const Artist = () => {
  const location = useLocation();
  const {artist} = location.state;

  const readableFollowers = artist.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  console.log(artist);

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
      </div>

      <div className="artist-body">
        <Outlet context={artist} />
      </div>
    </>
  );
};

export default Artist;
