import '../../assets/css/playlists.css';

import React from 'react';
import {useOutletContext} from 'react-router-dom';
import {useState} from 'react';

import {AiOutlinePlusCircle} from 'react-icons/ai';

const Playlists = () => {
  const {isOwnProfile} = useOutletContext();

  const [playlists, setPlaylists] = useState([]);

  return (
    <section className="playlists-section">
      {!isOwnProfile && playlists !== null && playlists.length === 0 && <h2>There are no playlists yet.</h2>}
      <div className="playlists-container">
        {isOwnProfile && (
          <div className="playlist-card create">
            <div className="playlist-card-photo">
              <AiOutlinePlusCircle />
            </div>
            <div className="playlist-card-name">Create New Playlist</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Playlists;
