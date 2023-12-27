import {useLocation} from 'react-router-dom';

const Playlist = () => {
  const playlist = useLocation().state.playlist;

  return (
    <div>
      <h1>{playlist.title}</h1>
    </div>
  );
};

export default Playlist;
