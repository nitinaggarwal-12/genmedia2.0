/*
 * Maestro — Frontend Static File Server
 * A lightweight, zero-dependency Node.js HTTP server running on localhost:3000.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`[Frontend Server] ${req.method} ${req.url}`);
    
    // Serve empty response for favicon to avoid console warnings
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Normalize URL path and strip query parameters to support cache-busters
    const urlPath = req.url.split('?')[0];
    let filePath = urlPath === '/' ? 'index.html' : urlPath.substring(1);
    
    // Resolve absolute file path safely
    const resolvedPath = path.resolve(__dirname, filePath);
    
    // Prevent directory traversal attacks
    if (!resolvedPath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden: Access denied.');
        return;
    }
    
    // Check if file exists and serve it
    fs.stat(resolvedPath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: File does not exist.');
            return;
        }
        
        // Determine Content-Type
        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Read and stream file content
        fs.readFile(resolvedPath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error: Failed to read file.');
                return;
            }
            
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            });
            res.end(content, 'utf-8');
        });
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n=============================================================`);
    console.log(`🎨 Maestro Frontend UI Canvas is running on: http://localhost:3000`);
    console.log(`=============================================================\n`);
});
