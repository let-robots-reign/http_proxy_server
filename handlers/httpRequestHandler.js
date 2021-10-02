// import * as http from 'http';
//
// import ab2str from 'arraybuffer-to-string';
//
// export const httpRequestHandler = (client_req, client_res, history) => {
//     console.log(client_req.url);
//     delete client_req.headers['proxy-connection'];
//
//     const removedHost = client_req.url.replace(client_req.headers.host, '');
//     const delimiter = '://';
//     const optionPath = removedHost.substr(removedHost.indexOf(delimiter) + delimiter.length);
//     const options = {
//         hostname: client_req.headers.host,
//         port: 80,
//         path: optionPath,
//         method: client_req.method,
//         headers: client_req.headers
//     };
//
//     const proxy = http.request(options, (res) => {
//         client_res.writeHead(res.statusCode, res.headers);
//
//         res.pipe(client_res);
//
//         let body = '';
//         res.on('data', (chunk) => {
//             const json = JSON.stringify(chunk);
//             const parsedJson = JSON.parse(json)
//             const uintArray = new Uint8Array(parsedJson.data);
//             body += ab2str(uintArray);
//         });
//
//         res.on('end', () => {
//             history.push({
//                 req: client_req,
//                 clientSocket: client_res,
//                 type: 'http',
//                 body: body,
//                 optionPath: optionPath,
//             });
//         });
//     });
//
//     client_req.pipe(proxy);
// }
