import '../../assets/css/search.css';
import Input from '../form/Input';

import {useEffect, useState} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';

import SearchList from './SearchList';
import {useSpotifyAuth} from '../../hooks/useSpotifyAuth';

import {db} from '../../setup/Firebase';
import {useTitle} from '../../hooks/useTitle';
import {useQueryParam} from 'use-query-params';

const Search = () => {
  useTitle('Search');
  const [searchString, setSearchString] = useQueryParam('q', '');
  const [data, setData] = useState(null);
  const [lastSearches, setLastSearches] = useState([]);
  const token = useSpotifyAuth();

  const {currentUser} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const debouncedSearch = useDebounce(
    async () => {
      if (!token) return;
      if (searchString === '' || searchString === null || searchString === undefined) {
        setData(null);
        return;
      }
      showLoader();
      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${searchString}&type=track,album,artist&limit=8&offset=0`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const spotifyData = await response.json();

        const usersRef = db.collection('users');
        const usersSnapshot = await usersRef
          .where('displayName', '>=', searchString)
          .where('displayName', '<=', searchString + '\uf8ff')
          .orderBy('displayName')
          .limit(8)
          .get();
        const usersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });

        const playlistsRef = db.collection('playlists');
        // get all playlists and then filter by title
        const playlistsSnapshot = await playlistsRef.get();
        const playlistsData = playlistsSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          })
          .filter((playlist) => playlist.title.toLowerCase().includes(searchString.toLowerCase()));

        setData({
          tracks: spotifyData.tracks.items,
          albums: spotifyData.albums.items,
          artists: spotifyData.artists.items,
          users: usersData,
          playlists: playlistsData,
        });

        // Check if the search string already exists in Firebase for the current user
        const searchesRef = db.collection('searches');
        const existingSearchSnapshot = await searchesRef.where('searchString', '==', searchString).where('uid', '==', currentUser.uid).get();

        if (!existingSearchSnapshot.empty) {
          // If the search string exists, update the timestamp
          const existingSearchDoc = existingSearchSnapshot.docs[0];
          await searchesRef.doc(existingSearchDoc.id).update({timestamp: Date.now()});
        } else {
          // If the search string doesn't exist, add a new document
          await searchesRef.add({searchString, timestamp: Date.now(), uid: currentUser.uid});
        }

        // Fetch the last 5 search strings from Firebase for the current user
        const lastSearchesSnapshot = await searchesRef.where('uid', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(5).get();
        const lastSearchesData = lastSearchesSnapshot.docs.map((doc) => doc.data().searchString);
        setLastSearches(lastSearchesData);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    },
    750,
    [searchString]
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchString, debouncedSearch]);

  useEffect(() => {
    // Fetch the last 5 search strings from Firebase for the current user
    const fetchLastSearches = async () => {
      if (!currentUser) return;

      try {
        const searchesRef = db.collection('searches');
        const lastSearchesSnapshot = await searchesRef.where('uid', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(5).get();
        const lastSearchesData = lastSearchesSnapshot.docs.map((doc) => doc.data().searchString);
        setLastSearches(lastSearchesData);
      } catch (error) {
        addToast('error', error.message);
      }
    };

    fetchLastSearches();

    // eslint-disable-next-line
  }, []);

  return (
    <div className="search-body">
      <section className="search-section">
        <div className="search-section-header">
          <h1>What are you looking for?</h1>
          <Input
            type="text"
            value={searchString}
            label="Search for songs, artists, or more .."
            onChange={(value) => {
              setSearchString(value);
            }}
            className="input-field light"
          />

          {lastSearches.length > 0 && (
            <>
              <h2>Latest</h2>
              <ul className="last-searches">
                {lastSearches.map((search, index) => (
                  <li key={index} onClick={() => setSearchString(search)}>
                    {search}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {data ? <SearchList data={data} q={searchString} /> : <h1 className="no-search-data">Start typing . . .</h1>}
      </section>
    </div>
  );
};

export default Search;
