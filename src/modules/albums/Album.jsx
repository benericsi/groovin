import {useParams} from 'react-router-dom';
import useSpotifyAuth from '../../hooks/useSpotifyAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useEffect, useState} from 'react';

const Album = () => {
  const [album, setAlbum] = useState(null);

  const {albumId} = useParams();
  const token = useSpotifyAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    const fetchAlbum = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setAlbum(data);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchAlbum();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, token]);

  return (
    <>
      {album && (
        <h1>
          {album.name} by {album.artists[0].name}
        </h1>
      )}
    </>
  );
};

export default Album;
