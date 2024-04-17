import '../../assets/css/categories.css';
import {useTitle} from '../../hooks/useTitle';
import {useState, useEffect} from 'react';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {Link} from 'react-router-dom';

const Categories = () => {
  useTitle('Categories');

  const [categories, setCategories] = useState([]);

  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    if (!token) return;
    showLoader();
    fetch('https://api.spotify.com/v1/browse/categories?locale=en-EN', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data.categories.items);
        setCategories(data.categories.items);
        hideLoader();
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      })
      .finally(() => {
        hideLoader();
      });

    // eslint-disable-next-line
  }, [token]);

  return (
    <div className="categories-body">
      <section className="categories-section">
        {categories.length > 0 && (
          <section className="body-section">
            <div className="list-header">
              <h2>Categories</h2>
            </div>
            <div className="search-list">
              {categories.map((category, index) => (
                <Link to={`/category/${category.id}`} className="search-card" key={index}>
                  <img className="search-card-photo playlist" src={category.icons[0].url} alt={category.name} />
                  <div className="search-card-name">{category.name}</div>
                  <div className="search-card-info capitalize">Playlist</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default Categories;
