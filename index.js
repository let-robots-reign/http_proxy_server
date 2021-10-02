'use strict';

import * as http from 'http';

import { config } from './config/config.js';
import { httpRequestHandler } from './handlers/httpRequestHandler.js';
import { httpsRequestHandler } from './handlers/httpsRequestHandler.js';

const server = http.createServer(httpRequestHandler);

const listener = server.listen(config.PROXY_PORT, (err) => {
    if (err) return console.error(err);

    const address = listener.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.on('connect', httpsRequestHandler);
