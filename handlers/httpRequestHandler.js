import * as http from 'http';

export const httpRequestHandler = (client_req, client_res) => {
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
