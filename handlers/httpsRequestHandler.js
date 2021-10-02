import * as net from 'net';
import * as url from 'url';


export const httpsRequestHandler = (req, clientSocket, head) => {
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
};
