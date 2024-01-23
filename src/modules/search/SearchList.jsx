import React from 'react';
import {Link} from 'react-router-dom';

import {MdAccountCircle} from 'react-icons/md';

const SearchList = ({data}) => {
  //console.log(data);

  return (
    <div className="search-section-body">
      {data.tracks.length > 0 && (
        <section className="body-section">
          <h2>Tracks</h2>
          <div className="search-list">
            {data.tracks.map((track) => (
              <Link to="" className="search-card" key={track.id}>
                <img className="search-card-photo track" src={track.album.images[1].url} alt={track.name} />
                <div className="search-card-name">{track.name}</div>
                <div className="search-card-info">{track.artists[0].name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.albums.length > 0 && (
        <section className="body-section">
          <h2>Albums</h2>
          <div className="search-list">
            {data.albums.map((album) => (
              <Link to="" className="search-card" key={album.id}>
                <img className="search-card-photo album" src={album.images[1].url} alt={album.name} />
                <div className="search-card-name">{album.name}</div>
                <div className="search-card-info">{album.artists[0].name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.artists.length > 0 && (
        <section className="body-section">
          <h2>Artists</h2>
          <div className="search-list">
            {data.artists.map((artist) => (
              <Link to={`/artist/${artist.id}`} state={{artist: artist}} className="search-card" key={artist.id}>
                {artist.images.length > 0 ? <img className="search-card-photo artist" src={artist.images[1].url} alt={artist.name} /> : <MdAccountCircle className="photo-alt artist" />}
                <div className="search-card-name">{artist.name}</div>
                <div className="search-card-info capitalize">{artist.type}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.playlists.length > 0 && (
        <section className="body-section">
          <h2>Playlists</h2>
          <div className="search-list">
            {data.playlists.map((playlist) => (
              <Link to={`/profile/${playlist.uid}/playlists/${playlist.id}`} className="search-card" key={playlist.id}>
                <img className="search-card-photo playlist" src={playlist.photoURL} alt={playlist.title} />
                <div className="search-card-name">{playlist.title}</div>
                <div className="search-card-info">{playlist.creator}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.users.length > 0 && (
        <section className="body-section">
          <h2>Users</h2>
          <div className="search-list">
            {data.users.map((user) => (
              <Link to={`/profile/${user.id}`} className="search-card" key={user.id}>
                {user.photoURL !== 'default' ? <img className="search-card-photo user" src={user.photoURL} alt={user.displayName} /> : <MdAccountCircle className="photo-alt user" />}
                <div className="search-card-name">{user.displayName}</div>
                <div className="search-card-info">{user.email}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchList;
