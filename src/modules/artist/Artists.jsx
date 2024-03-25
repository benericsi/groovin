import '../../assets/css/artist.css';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useTitle} from '../../hooks/useTitle';
import {useState, useEffect} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useLocation, useNavigate, Link} from 'react-router-dom';

import Button from '../form/Button';

import {MdAccountCircle} from 'react-icons/md';
import {IoPersonOutline} from 'react-icons/io5';
import {IoReload} from 'react-icons/io5';

const Artists = () => {
  useTitle('Artists');

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const q = query.get('q');

  const [artists, setArtists] = useState([]);
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
    fetch(`https://api.spotify.com/v1/search?q=${q}&type=artist&limit=20&offset=${(page - 1) * 20}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setArtists((prev) => [...prev, ...data.artists.items]);
        setHasMore(data.artists.items.length > 0);
        hideLoader();
      })
      .catch((error) => {
        addToast('Error fetching data', 'error');
        hideLoader();
      });

    // eslint-disable-next-line
  }, [q, page, token]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="artists-body">
      <section className="artists-section">
        {artists.length > 0 && (
          <section className="body-section">
            <div className="list-header">
              <h2>
                <IoPersonOutline />
                Artists
              </h2>
            </div>
            <div className="search-list">
              {artists.map((artist) => (
                <Link to={`/artist/${artist.id}`} className="search-card" key={artist.id}>
                  {artist.images.length > 0 ? <img className="search-card-photo artist" src={artist.images[1].url} alt={artist.name} /> : <MdAccountCircle className="photo-alt artist" />}
                  <div className="search-card-name">{artist.name}</div>
                  <div className="search-card-info capitalize">{artist.type}</div>
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
