const isLocal = window.location.hostname === 'localhost';

const config = {
  apiBaseUrl: isLocal 
    ? 'http://localhost:8000/api' 
    : `${window.location.origin}/api`,
};

export default config;