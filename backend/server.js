const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

// ✅ Your Spotify credentials
const clientId = 'fea2449175aa40608b0876b9a631f319';
const clientSecret = '9f53d3aa2c3f4b23ba3161872d9e3e47';

let accessToken = '';
let tokenExpiry = 0;

// Function to get Spotify access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const res = await axios.post(
    'https://accounts.spotify.com/api/token', 
    'grant_type=client_credentials', 
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      }
    }
  );

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in * 1000) - 60000; // refresh 1min early
  return accessToken;
}

// Endpoint to fetch trending songs
app.get('/trending', async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      'https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M', // Today’s Top Hits
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const tracks = response.data.tracks.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      album: item.track.album.name,
      img: item.track.album.images[0].url
    }));

    res.json(tracks);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching trending songs');
  }
});

app.listen(3000, () => console.log('Spotify proxy running on http://localhost:3000'));
