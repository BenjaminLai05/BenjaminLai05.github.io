// API Configuration
// In production (Docker), REACT_APP_API_URL is set to "" so the frontend
// uses relative URLs (same origin). In local dev, it defaults to localhost.
const API_BASE_URL =
  typeof process.env.REACT_APP_API_URL === 'string'
    ? process.env.REACT_APP_API_URL   // "" in production → relative URLs
    : 'http://localhost:8000';         // undefined in dev → localhost

export default API_BASE_URL;


