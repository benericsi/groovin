import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

export const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const fetchToken = async () => {
      var params = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:
          "grant_type=client_credentials&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET,
      };

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        params
      );
      const data = await response.json();
      setToken(data.access_token);
    };
    fetchToken();
  }, [currentUser]);

  return token;
};
