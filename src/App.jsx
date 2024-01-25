import './assets/css/globals.css';

import React, {lazy, Suspense} from 'react';
import {Routes, Route} from 'react-router-dom';

import Loader from './common/Loader';
import PrivateRoute from './setup/PrivateRoute';
const Authentication = lazy(() => import('./modules/authentication/Authentication'));
const Main = lazy(() => import('./modules/main/Main'));
const Dashboard = lazy(() => import('./modules/main/Dashboard'));
const ErrorPage = lazy(() => import('./common/ErrorPage'));

const Playlists = lazy(() => import('./modules/playlists/Playlists'));
const Playlist = lazy(() => import('./modules/playlists/Playlist'));

const Profile = lazy(() => import('./modules/profile/Profile'));
const ProfileMain = lazy(() => import('./modules/profile/ProfileMain'));
const Friends = lazy(() => import('./modules/profile/Friends'));
const Requests = lazy(() => import('./modules/profile/Requests'));
const Messages = lazy(() => import('./modules/messages/Messages'));
const ChatRoom = lazy(() => import('./modules/messages/ChatRoom'));
const Notifications = lazy(() => import('./modules/profile/Notifications'));

const Search = lazy(() => import('./modules/search/Search'));

const Artist = lazy(() => import('./modules/artist/Artist'));
const ArtistMain = lazy(() => import('./modules/artist/ArtistMain'));
const ArtistAlbums = lazy(() => import('./modules/artist/ArtistAlbums'));
const ArtistRelated = lazy(() => import('./modules/artist/ArtistRelated'));

const Album = lazy(() => import('./modules/albums/Album'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/auth" element={<Authentication />} />

        <Route element={<PrivateRoute />}>
          <Route exact path="/" element={<Main />}>
            <Route index element={<Dashboard />} />

            <Route exact path="/profile/:uid" element={<Profile />}>
              <Route index element={<ProfileMain />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="playlists/:playlistId" element={<Playlist />} />
              <Route path="friends" element={<Friends />} />
              <Route path="requests" element={<Requests />} />
              <Route path="messages" element={<Messages />}>
                <Route path=":partnerId" element={<ChatRoom />} />
              </Route>
              <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route path="/search" element={<Search />} />

            <Route exact path="/artist/:artistId" element={<Artist />}>
              <Route index element={<ArtistMain />} />
              <Route path="albums" element={<ArtistAlbums />} />
              <Route path="related" element={<ArtistRelated />} />
            </Route>

            <Route exact path="/album/:albumId" element={<Album />} />
          </Route>
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
