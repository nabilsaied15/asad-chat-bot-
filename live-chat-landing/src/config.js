// Configuration for the asad.to platform
// During development, this is usually http://localhost:3000
// For remote access or production, change this to your public IP or Domain

const config = {
    // API_URL: 'http://localhost:3000', // Local only
    API_URL: 'http://' + window.location.hostname + ':3000', // Auto-detects IP if accessed via IP
};

export default config;
