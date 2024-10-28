import "../../assets/css/categories.css";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSpotifyAuth } from "../../hooks/useSpotifyAuth";
import { useToast } from "../../hooks/useToast";
import { useLoader } from "../../hooks/useLoader";
import { Link } from "react-router-dom";

const Category = () => {
  const [category, setCategory] = useState({});

  const { categoryId } = useParams();
  const token = useSpotifyAuth();
  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (!token) return;
    showLoader();
    fetch(
      `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?offset=0&limit=20&locale=en-EN`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setCategory(data);
        hideLoader();
      })
      .catch((error) => {
        addToast("error", error.message);
        hideLoader();
      })
      .finally(() => {
        hideLoader();
      });

    // eslint-disable-next-line
  }, [token, categoryId]);

  return (
    <div className='categories-body'>
      <section className='categories-section'>
        {category && (
          <>
            <section className='body-section'>
              <div className='list-header'>
                <h2>{category.message}</h2>
              </div>
              {category.playlists &&
                category.playlists.items &&
                category.playlists.items.length === 0 && (
                  <h1 className='no-data'>
                    {" "}
                    This category does not have any playlists yet.{" "}
                  </h1>
                )}
              <div className='search-list'>
                {category.playlists &&
                  category.playlists.items.map((playlist, index) => (
                    <Link
                      to={`/category/playlist/${playlist.id}`}
                      className='search-card'
                      key={index}>
                      <img
                        className='search-card-photo playlist'
                        src={playlist.images[0].url}
                        alt={playlist.name}
                      />
                      <div className='search-card-name'>{playlist.name}</div>
                      <div className='search-card-info capitalize'>
                        {playlist.type}
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
};

export default Category;
