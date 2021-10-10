const http = require('http');
const https = require('https');

const getCookies = (request) => {
    const cookies = {};
    request.headers?.cookie?.split(';').forEach((cookie) => {
        const parts = cookie.match(/(.*?)=(.*)$/);
        cookies[parts[1].trim()] = (parts[2] || '').trim();
    });
    return cookies;
};

const requestHandler = async (req, res, isSecure, db) => {
    // TODO: Отдельно записать get и post параметры
    const options = {
        port: isSecure ? 443 : 80,
        host: req.headers.host,
        method: req.method,
        path: req.url,
        headers: req.headers,
        body: req.body,
        cookies: getCookies(req),
        get_params: req.query,
        uri: req.url
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
