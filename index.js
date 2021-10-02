'use strict';

const http = require('http');

import { config } from './config/config';
import { httpRequestHandler } from './handlers/httpRequestHandler';
import { httpsRequestHandler } from './handlers/httpsRequestHandler';

const server = http.createServer(httpRequestHandler);

const listener = server.listen(config.PROXY_PORT, (err) => {
    if (err) return console.error(err);

    const address = listener.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.on('connect', httpsRequestHandler);
