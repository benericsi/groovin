import {useOutletContext, Link} from 'react-router-dom';
import {useState, useEffect} from 'react';

import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';

import {MdAccountCircle} from 'react-icons/md';

const ArtistRelated = () => {
  const {artist} = useOutletContext();
  const [relatedArtists, setRelatedArtists] = useState(null);

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const token = useSpotifyAuth();

  useEffect(() => {
    const fetchRelatedArtists = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/related-artists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        //console.log(data);

        setRelatedArtists(data.artists);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchRelatedArtists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, token]);

  return (
    <>
      {relatedArtists && relatedArtists.length === 0 && <h1 className="no-data"> This artist does not have any related artist. </h1>}

      {relatedArtists && relatedArtists.length > 0 && (
        <section className="body-section">
          <h2>Related Artists</h2>
          <div className="list">
            {relatedArtists.map((artist) => (
              <Link to={`/artist/${artist.id}`} className="card" key={artist.id}>
                {artist.images.length > 0 ? <img className="card-photo artist" src={artist.images[1].url} alt={artist.name} /> : <MdAccountCircle className="photo-alt artist" />}
                <div className="card-name">{artist.name}</div>
                <div className="card-info capitalize">{artist.type}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ArtistRelated;
