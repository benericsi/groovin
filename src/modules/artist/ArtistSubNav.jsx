import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';

const ArtistSubNav = ({artist}) => {
  const location = useLocation().pathname;

  return (
    <nav className="artist-nav">
      <ul className="artist-nav-list">
        <li className="artist-nav-list-item">
          <NavLink to={`/artist/${artist.id}`} className={`artist-nav-link ${location === `/artist/${artist.id}` ? 'active' : 'inactive'}`}>
            About
          </NavLink>
        </li>
        <li className="artist-nav-list-item">
          <NavLink to={`/artist/${artist.id}/albums`} className={`artist-nav-link ${location === `/artist/${artist.id}/albums` ? 'active' : 'inactive'}`}>
            Albums
          </NavLink>
        </li>
        <li className="artist-nav-list-item">
          <NavLink to={`/artist/${artist.id}/related`} className={`artist-nav-link ${location === `/artist/${artist.id}/related` ? 'active' : 'inactive'}`}>
            Related
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default ArtistSubNav;
