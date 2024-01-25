import {useOutletContext, Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import useSpotifyAuth from '../../hooks/useSpotifyAuth';

const ArtistAlbums = () => {
  const {artist} = useOutletContext();
  const [albums, setAlbums] = useState(null);
  const [appearsOn, setAppearsOn] = useState(null);

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const token = useSpotifyAuth();

  useEffect(() => {
    const fetchAlbums = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=appears_on%2Calbum&limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        //console.log(data);

        setAlbums(data.items.filter((album) => album.album_group === 'album'));
        setAppearsOn(data.items.filter((album) => album.album_group === 'appears_on'));
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchAlbums();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, token]);

  return (
    <>
      {albums && albums.length === 0 && appearsOn && appearsOn.length === 0 && <h1 className="no-data"> This artist does not have any albums yet. </h1>}

      {albums && albums.length > 0 && (
        <section className="body-section">
          <h2>Albums</h2>
          <div className="list">
            {albums.map((album) => (
              <Link to={`/albums/${album.id}`} state={{album}} className="card" key={album.id}>
                <img className="card-photo album" src={album.images[1].url} alt={album.name} />
                <div className="card-name">{album.name}</div>
                <div className="card-info">{album.artists[0].name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {appearsOn && appearsOn.length > 0 && (
        <section className="body-section">
          <h2>Appears On</h2>
          <div className="list">
            {appearsOn.map((album) => (
              <Link to={`/albums/${album.id}`} state={{album}} className="card" key={album.id}>
                <img className="card-photo album" src={album.images[1].url} alt={album.name} />
                <div className="card-name">{album.name}</div>
                <div className="card-info">{album.artists[0].name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ArtistAlbums;
