import '../../assets/css/albums.css';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useTitle} from '../../hooks/useTitle';
import {useState, useEffect} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useLocation, useNavigate, Link} from 'react-router-dom';

import Button from '../form/Button';

import {IoReload} from 'react-icons/io5';

const Artists = () => {
  useTitle('Albums');

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const q = query.get('q');

  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    if (!token) return;
    if (q === '' || q === null || q === undefined) {
      navigate('/search');
      return;
    }
    showLoader();
    fetch(`https://api.spotify.com/v1/search?q=${q}&type=album&limit=20&offset=${(page - 1) * 20}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAlbums((prev) => [...prev, ...data.albums.items]);
        setHasMore(data.albums.items.length > 0);
        hideLoader();
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      });

    // eslint-disable-next-line
  }, [q, page, token]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="albums-body">
      <section className="albums-section">
        {albums.length > 0 && (
          <section className="body-section">
            <div className="list-header">
              <h2>Albums</h2>
            </div>
            <div className="search-list">
              {albums.map((album, index) => (
                <Link to={`/album/${album.id}`} className="search-card" key={index}>
                  <img className="search-card-photo album" src={album.images[1].url} alt={album.name} />
                  <div className="search-card-name">{album.name}</div>
                  <div className="search-card-info capitalize">{album.type}</div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <form className="load-more">
                <Button className="primary " onClick={loadMore} text="Load more">
                  <IoReload />
                </Button>
              </form>
            )}
          </section>
        )}
      </section>
    </div>
  );
};

export default Artists;
