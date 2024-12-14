# Groovin - Music Streaming Web Application

Groovin is a web application built using **React**, **Firebase**, and the **Spotify Web API**. It provides users with a seamless music streaming experience, allowing them to explore songs, manage playlists, and interact with friends in a user-friendly interface.

---

## Features

- **User Authentication**: Secure login and registration using email/password or Google account (Firebase Authentication).
- **Explore Music**: Search for songs, albums, and artists using the Spotify Web API.
- **Playlist Management**: Create, edit, and manage playlists.
- **Social Features**: Add friends, send/receive friend requests, and chat in real time.
- **Music Player**: Play songs with a queue system, next/previous song controls, and playlist navigation.

---

## Tech Stack

- **Frontend**: React, SCSS
- **Backend**: Firebase (Authentication, Firestore Database, Realtime Sync)
- **API Integration**: Spotify Web API
- **State Management**: React Context API, useReducer

---

## Getting Started

### Prerequisites

- Node.js and npm installed
- Spotify Developer Account (to access API credentials)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/groovin.git
   cd groovin

2. Install dependencies:

   ```bash
   npm install

3. Set up your environment variables:
   - Create a `.env` file in the root directory.
   - Add your Firebase and Spotify API credentials:
     ```
     # Firebase Configuration
     REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
     REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
     REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
     REACT_APP_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id

     # Spotify API Configuration
     REACT_APP_SPOTIFY_CLIENT_ID=your-spotify-client-id
     REACT_APP_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
     ```

4. Start the development server:

   ```bash
   npm start

5. Open your browser and navigate to `http://localhost:3000`.
