// Configuration for the asad.to platform
// During development, this is usually http://localhost:3000
// For remote access or production, change this to your public IP or Domain

const config = {
    // Si nous sommes sur un domaine de production (pas localhost), on utilise l'URL du backend distant
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://chatt-bot-serveur.vercel.app',
};

export default config;
