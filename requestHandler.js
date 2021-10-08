const http = require('http');
const https = require('https');

const requestHandler = async (req, res, isSecure, db) => {
    const options = {
        port: isSecure ? 443 : 80,
        host: req.headers.host,
        method: req.method,
        path: req.url,
        headers: req.headers
    };

    await db.saveRequest(options);

    const proxyReq = isSecure ? https.request(options) : http.request(options);
    proxyReq.addListener('response', (proxyRes) => {
        proxyRes.addListener('data', (chunk) => res.write(chunk, 'binary'));
        proxyRes.addListener('end', () => res.end());

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
    });

    req.addListener('data', (chunk) => proxyReq.write(chunk, 'binary'));
    req.addListener('end', () => proxyReq.end());
};

module.exports = requestHandler;
