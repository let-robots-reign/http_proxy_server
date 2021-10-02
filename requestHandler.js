import https from 'https';
import http from 'http';
import { config } from './config/config.js';

export const requestHandler = (req, res, isSecure) => {
    const options = {
        port: isSecure ? config.httpsPort : config.httpPort,
        host: req.headers.host,
        method: req.method,
        path: req.url,
        headers: req.headers
    };

    // TODO: сохранить запрос

    console.log(isSecure);

    const proxyReq = isSecure ? https.request(options) : http.request(options);
    proxyReq.addListener('response',  (proxyRes) => {
        proxyRes.addListener('data', (chunk) => res.write(chunk, 'binary'));
        proxyRes.addListener('end', () => res.end());

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
    });

    req.addListener('data', (chunk) => proxyReq.write(chunk, 'binary'));
    req.addListener('end', () => proxyReq.end());
};
