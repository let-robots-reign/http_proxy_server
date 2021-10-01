'use strict';

const http = require('http');

const PROXY_PORT = 8080;

http.createServer(requestHandler).listen(PROXY_PORT);

function requestHandler(client_req, client_res) {
    /**
     * - считать хост и порт из первой строчки
     * - заменить путь на относительный
     * - удалить заголовок Proxy-Connection
     * Отправить на считанный хост получившийся запрос
     */
    console.log(`serving url: ${client_req.url}`);

    delete client_req.headers['proxy-connection'];

    const options = {
        hostname: client_req.headers.host,
        port: 80,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    const proxy = http.request(options, (res) => {
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res);
    });

    client_req.pipe(proxy);
}
