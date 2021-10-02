'use strict';
import { config } from './config/config.js';
// import { httpRequestHandler } from './handlers/httpRequestHandler.js';
// import { httpsRequestHandler } from './handlers/httpsRequestHandler.js';
import * as http from 'http';
import * as https from 'https';
import url from 'url';
import net from 'net';
import { options } from "./genCert.js";
import { requestHandler } from "./requestHandler.js";

https
    .createServer(options, (req, res) =>
        requestHandler(req, res, true))
    .on('tlsClientError',  (e) => console.log(e))
    .listen(config.httpsPort,  () => console.log(`HTTPS server listening on port 443`));

http
    .createServer((req, res) => requestHandler(req, res, false))
    .on('connect', (req, clientSocket, head) => {
        const parsedURL = url.parse(`http://${req.url}`);
        const serverSocket = net.connect(
            Number(parsedURL.port),
            parsedURL.hostname,
            () => {
                clientSocket.write([
                    'HTTP/1.0 200 Connection established',
                    'Proxy-agent: Node.js-Proxy',
                ].join('\r\n'));
                serverSocket.write(head);
                serverSocket.pipe(clientSocket).on('error', (e) => console.log('serverSocket', e));
                clientSocket.pipe(serverSocket).on('error', (e) => console.log('clientSocket', e));
            },
        );
    })
    .listen(config.port, () => console.log('HTTP server listening on port 8080'));
