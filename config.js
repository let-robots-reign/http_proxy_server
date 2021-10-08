const config = {
    port: 8080,
    portHTTPS: 443,
    portStatic: 8000,
    startMarkup: `
    <!DOCTYPE html>
    <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Зотов Алексей, АПО-31</title>
            <style>
                * {
                font-size: 28px;
                }
            </style>
        </head>
        <body>
    `,
    endMarkup: `
        </body>
    </html>`,
}

module.exports = config;
