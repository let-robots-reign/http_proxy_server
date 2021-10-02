// import * as net from 'net';
// import * as url from 'url';
//
// import ab2str from 'arraybuffer-to-string';
//
// export const httpsRequestHandler = (req, clientSocket, head, history) => {
//     console.log(req.headers.referer);
//
//     const regPath = new RegExp(req.headers.host.slice(0, req.headers.host.length - 4));
//     const removedPath = req.headers.referer.replace(regPath, '');
//     const optionPath = removedPath.substr(removedPath.indexOf('://') + 3);
//     const { port, hostname } = url.parse(`//${req.url}`, false, true);
//
//     if (!hostname || !port) {
//         clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
//         clientSocket.destroy();
//         return;
//     }
//
//     const serverSocket = net.connect(Number(port), hostname);
//     serverSocket.on('error', (err) => {
//         console.error(err.message);
//         if (clientSocket) clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
//     });
//     serverSocket.on('end', () => { if (clientSocket) clientSocket.end(`HTTP/1.1 500 External Server End\r\n`); });
//     serverSocket.on('connect', () => {
//         clientSocket.write([
//             'HTTP/1.1 200 Connection Established',
//             'Proxy-agent: Node-VPN',
//         ].join('\r\n'));
//
//         let body = '';
//         clientSocket.on('data', (chunk) => {
//             const json = JSON.stringify(chunk);
//             const parsedJson = JSON.parse(json);
//             const uintArray = new Uint8Array(parsedJson.data);
//             body += ab2str(uintArray);
//         });
//         clientSocket.on('end', () => {
//             history.push({
//                 req: req,
//                 clientSocket: clientSocket,
//                 type: 'https',
//                 body: body,
//                 optionPath: optionPath,
//             });
//         });
//
//         clientSocket.write('\r\n\r\n');
//         serverSocket.pipe(clientSocket, { end: false });
//         clientSocket.pipe(serverSocket, { end: false });
//     });
//
//     clientSocket.on('error', (err) => {
//         console.error(err.message);
//         if (serverSocket) serverSocket.end();
//     });
//     clientSocket.on('end', () => { if (serverSocket) serverSocket.end(); });
// }
