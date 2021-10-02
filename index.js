'use strict';

const http = require('http');
const net = require('net');
const url = require('url');

const PROXY_PORT = 8080;

const requestHandler = (client_req, client_res) => {
    /**
     * - считать хост и порт из первой строчки
     * - заменить путь на относительный
     * - удалить заголовок Proxy-Connection
     * Отправить на считанный хост получившийся запрос
     */
    console.log(`serving url: ${client_req.url}`);

    delete client_req.headers['proxy-connection'];

    const regexpHost = new RegExp(client_req.headers.host);
    const optionPath = client_req.url
                            .replace(regexpHost, '')
                            .substr(
                                client_req.url
                                    .replace(regexpHost, '')
                                    .indexOf('://') + 3
                                );
    const options = {
        hostname: client_req.headers.host,
        port: 80,
        path: optionPath,
        method: client_req.method,
        headers: client_req.headers
    };

    const proxy = http.request(options, (res) => {
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res);
    });

    client_req.pipe(proxy);
};

const server = http.createServer(requestHandler);

const listener = server.listen(PROXY_PORT, (err) => {
    if (err) return console.error(err);

    const address = listener.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.on('connect', (req, clientSocket, head) => {
    // listening for HTTP/1.1 CONNECT
    const { port, host } = url.parse(`//${req.url}`, false, true);
    if (!(host && port)) {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
        clientSocket.destroy();
        return;
    }

    const serverErrHandler = (err) => {
        console.error(err);
        if (clientSocket) clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
    };

    const serverEndHandler = () => { if (clientSocket) clientSocket.end(`HTTP/1.1 500 External Server End\r\n`); };

    const serverSocket = net.connect(port, host);

    const clientErrHandler = (err) => {
        console.error(err);
        if (serverSocket) serverSocket.end(); 
    };

    const clientEndHandler = () => { if (serverSocket) serverSocket.end(); };

    clientSocket.on('error', clientErrHandler);
    clientSocket.on('end', clientEndHandler);

    serverSocket.on('error', serverErrHandler);
    serverSocket.on('end', serverEndHandler);
    serverSocket.on('connect', () => {
        clientSocket.write([
            'HTTP/1.1 200 Connection Established',
            'Proxy-agent: node-proxy',
        ].join('\r\n'));
        clientSocket.write('\r\n\r\n');
        serverSocket.pipe(clientSocket, { end: false });
        clientSocket.pipe(serverSocket, { end: false });
    });
});
