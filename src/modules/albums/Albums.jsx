import '../../assets/css/albums.css';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useTitle} from '../../hooks/useTitle';
import {useState, useEffect, useRef} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useLocation, useNavigate, Link} from 'react-router-dom';

const Albums = () => {
  useTitle('Albums');

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const q = query.get('q');

  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const loadMoreRef = useRef(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore]);
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
          </section>
        )}
        <div ref={loadMoreRef} style={{height: '1px'}} />
      </section>
    </div>
  );
};

export default Albums;
