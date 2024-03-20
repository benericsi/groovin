import '../../assets/css/artist.css';

import React, {useEffect, useState} from 'react';
import {Outlet, useParams} from 'react-router-dom';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';
import ColorThief from 'colorthief';

import ArtistSubNav from './ArtistSubNav';
import {RiAccountCircleFill} from 'react-icons/ri';

const Artist = () => {
  const [dominantColor, setDominantColor] = useState('');
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const {artistId} = useParams();
  const token = useSpotifyAuth();

  const [artist, setArtist] = useState(null);
  const [readableFollowers, setReadableFollowers] = useState(0);

  //const readableFollowers = artist.followers ? artist.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;

  useEffect(() => {
    const fetchArtist = async () => {
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data);

        if (data.images.length > 0) {
          const colorThief = new ColorThief();
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = data.images[2].url;
          img.onload = () => {
            const color = colorThief.getColor(img);
            setDominantColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
          };
        }

        setArtist(data);
        setReadableFollowers(data.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchArtist();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId, token]);

  return (
    <>
      {artist && (
        <>
          <div className="artist-header">
            <div className="header-pre">
              <div className="artist-background" style={{backgroundColor: dominantColor}}></div>
            </div>
            <div className="artist-profile-details">
              <div className="artist-profile-image">{artist.images.length > 0 ? <img src={artist.images[2].url} alt={artist.name} /> : <RiAccountCircleFill className="default-photo" />}</div>
              <div className="artist-profile-actions">
                <span className="artist-profile-name">{artist.name}</span>
                <div className="artist-info">
                  <span>Followers: {readableFollowers}</span>
                </div>
              </div>
            </div>

            <ArtistSubNav artist={artist} />
          </div>

          <div className="artist-body">
            <Outlet context={{artist}} />
          </div>
        </>
      )}
    </>
  );
};

export default Artist;
