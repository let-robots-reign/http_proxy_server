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
            <hr>`;
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

    return app;
}

module.exports = createAPIApp;
