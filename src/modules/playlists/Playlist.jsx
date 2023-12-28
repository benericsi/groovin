import {useLocation} from 'react-router-dom';
import {FaEllipsisVertical} from 'react-icons/fa6';

const Playlist = () => {
  const playlist = useLocation().state.playlist;

  const createdAt = new Date(playlist.createdAt.seconds * 1000);
  // Format the date
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <section className="playlist-section">
      <div className="playlist-container">
        <header className="playlist-header">
          <div className="playlist-header-photo">
            <img src={playlist.photoURL} alt="" />
          </div>
          <div className="playlist-header-info">
            <h2 className="playlist-header-title">{playlist.title}</h2>
            <span className="playlist-header-length">{playlist.songs.length} tracks</span>
            <p className="playlist-header-description">
              "{playlist.description}" - {formattedDate}
            </p>
          </div>
        </header>
      </div>
    </section>
  );
};

export default Playlist;
