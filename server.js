const path = require('path');
const fs = require('fs');

// Log context for Render debugging
console.log('--- asad.to Proxy Loader ---');
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

const TARGET_DIR = path.join(__dirname, 'live-chat-server');
const TARGET_SCRIPT = path.join(TARGET_DIR, 'server.js');

if (fs.existsSync(TARGET_SCRIPT)) {
    console.log(`Switching working directory to: ${TARGET_DIR}`);
    process.chdir(TARGET_DIR);
    console.log(`Starting target script: ${TARGET_SCRIPT}`);
    require(TARGET_SCRIPT);
} else {
    console.error(`CRITICAL: Target server script not found at ${TARGET_SCRIPT}`);
    process.exit(1);
}
