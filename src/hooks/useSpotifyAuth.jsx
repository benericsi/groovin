import {useEffect, useState} from 'react';
import {useAuth} from './useAuth';

const CLIENT_ID = 'b8e2f2f4c7fb47d28a9bb1a0884127c9';
const CLIENT_SECRET = '135fac7fb4dd448b828a8f494bcc0dc5';

const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const {currentUser} = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const fetchToken = async () => {
      var params = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET,
      };

      const response = await fetch('https://accounts.spotify.com/api/token', params);
      const data = await response.json();
      setToken(data.access_token);
    };
    fetchToken();
  }, [currentUser]);

  return token;
};

export default useSpotifyAuth;
