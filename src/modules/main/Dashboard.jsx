import "../../assets/css/dashboard.css";

import React, { useEffect, useState } from "react";
import { useTitle } from "../../hooks/useTitle";
import { useToast } from "../../hooks/useToast";
import { useLoader } from "../../hooks/useLoader";
import { useSpotifyAuth } from "../../hooks/useSpotifyAuth";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const Dashboard = () => {
  useTitle("Home");

  const [releases, setReleases] = useState([]);

  const { currentUser } = useAuth();

  console.log(currentUser);

  const token = useSpotifyAuth();

  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchNewReleases = async () => {
      showLoader();

      try {
        const response = await fetch(
          "https://api.spotify.com/v1/browse/new-releases?limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setReleases(data.albums.items);
      } catch (error) {
        addToast("error", error.message);
      } finally {
        hideLoader();
      }
    };

    if (token) {
      fetchNewReleases();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className='dashboard-body'>
      <section className='dashboard-section'>
        {releases.length > 0 && (
          <section className='body-section'>
            <div className='list-header'>
              <h2>
                Hi, {currentUser.displayName.split(" ")[0]}! Listen to the top
                releases now
              </h2>
            </div>
            <div className='search-list'>
              {releases.map((release, index) => (
                <Link
                  to={`/album/${release.id}`}
                  className='search-card'
                  key={index}>
                  <img
                    className='search-card-photo album'
                    src={release.images[0].url}
                    alt={release.name}
                  />
                  <div className='search-card-name'>{release.name}</div>
                  <div className='search-card-info capitalize'>
                    {release.artists.map((artist) => artist.name).join(", ")}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
