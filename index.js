const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const config = require("./config");
const createAPIApp = require("./web");

const requestHandler = require('./requestHandler');
const SNICallback = require('./genCert');
const Database = require("./db");

const db = new Database();
(async () => db.initDB())();

https
    .createServer({SNICallback}, (req, res) => requestHandler(req, res, true, db))
    .on('tlsClientError', (e) => console.log(e))
    .listen(config.portHTTPS, () => console.log(`HTTPS server listening on port ${config.portHTTPS}`));

http
    .createServer((req, res) => requestHandler(req, res, false, db))
    .on('connect', (req, clientSocket, head) => {
        const parsedURL = url.parse(`http://${req.url}`);
        const serverSocket = net.connect(
            Number(parsedURL.port),
            parsedURL.hostname,
            () => {
                clientSocket.write([
                    'HTTP/1.0 200 Connection established',
                    'Proxy-agent: Node.js-Proxy',
                    ''
                ].join('\r\n'));
                serverSocket.write(head);
                serverSocket.pipe(clientSocket).on('error', (e) => console.log('serverSocket', e));
                clientSocket.pipe(serverSocket).on('error', (e) => console.log('clientSocket', e));
            },
        );
    })
    .listen(config.port, () => console.log(`HTTP server listening on port ${config.port}`));

const app = createAPIApp(db);
app.listen(config.portStatic, () => {
    console.log(`Web API listening at port ${config.portStatic}`);
});
