import "./assets/css/globals.css";

import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Loader from "./component/Loader";
import PrivateRoute from "./setup/PrivateRoute";

const Authentication = lazy(() =>
  import("./modules/authentication/Authentication")
);
const Main = lazy(() => import("./modules/main/Main"));
const Dashboard = lazy(() => import("./modules/main/Dashboard"));
const ErrorPage = lazy(() => import("./component/ErrorPage"));

const Playlists = lazy(() => import("./modules/playlists/Playlists"));
const Playlist = lazy(() => import("./modules/playlists/Playlist"));

const Profile = lazy(() => import("./modules/profile/Profile"));
const Friends = lazy(() => import("./modules/profile/Friends"));
const Requests = lazy(() => import("./modules/profile/Requests"));
const Messages = lazy(() => import("./modules/messages/Messages"));
const ChatRoom = lazy(() => import("./modules/messages/ChatRoom"));
const Notifications = lazy(() => import("./modules/profile/Notifications"));

const Search = lazy(() => import("./modules/search/Search"));

const Artists = lazy(() => import("./modules/artist/Artists"));
const Artist = lazy(() => import("./modules/artist/Artist"));
const ArtistAlbums = lazy(() => import("./modules/artist/ArtistAlbums"));
const ArtistRelated = lazy(() => import("./modules/artist/ArtistRelated"));

const Albums = lazy(() => import("./modules/albums/Albums"));
const Album = lazy(() => import("./modules/albums/Album"));

const Favourites = lazy(() => import("./modules/favourites/Favourites"));

const Tracks = lazy(() => import("./modules/tracks/Tracks"));

const Categories = lazy(() => import("./modules/categories/Categories"));
const Category = lazy(() => import("./modules/categories/Category"));
const CategoryPlaylist = lazy(() =>
  import("./modules/categories/CategoryPlaylist")
);

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path='/auth' element={<Authentication />} />

        <Route element={<PrivateRoute />}>
          <Route exact path='/' element={<Main />}>
            <Route index element={<Dashboard />} />

            <Route exact path='/profile/:uid' element={<Profile />}>
              <Route index element={<Playlists />} />
              <Route path='playlists' element={<Playlists />} />
              <Route path='playlists/:playlistId' element={<Playlist />} />
              <Route path='friends' element={<Friends />} />
              <Route path='requests' element={<Requests />} />
              <Route path='messages' element={<Messages />}>
                <Route path=':partnerId' element={<ChatRoom />} />
              </Route>
              <Route path='notifications' element={<Notifications />} />
            </Route>

            <Route path='/search' element={<Search />} />

            <Route exact path='/artists' element={<Artists />} />
            <Route exact path='/artist/:artistId' element={<Artist />}>
              <Route index element={<ArtistAlbums />} />
              <Route path='albums' element={<ArtistAlbums />} />
              <Route path='related' element={<ArtistRelated />} />
            </Route>

            <Route exact path='/albums' element={<Albums />} />
            <Route exact path='/album/:albumId' element={<Album />} />

            <Route exact path='/favs' element={<Favourites />} />

            <Route exact path='/tracks' element={<Tracks />} />

            <Route exact path='/categories' element={<Categories />} />
            <Route exact path='/category/:categoryId' element={<Category />} />
            <Route
              exact
              path='/category/playlist/:playlistId'
              element={<CategoryPlaylist />}
            />
          </Route>
        </Route>

        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
