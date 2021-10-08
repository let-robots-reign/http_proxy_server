const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

class Database {
    constructor() {
    }

    async initDB() {
        this.db = await sqlite.open({
            filename: 'database.sqlite3',
            driver: sqlite3.Database
        });

        const sql = `CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, request TEXT)`;
        return this.db.run(sql);
    }

    getRequests() {
        return this.db.all('SELECT * FROM requests');
    }

    getRequest(id) {
        return this.db.get('SELECT * FROM requests WHERE id=?', [id]);
    }

    saveRequest(request) {
        return this.db.run(
            'INSERT INTO requests (request) VALUES (?)',
            [JSON.stringify(request)]
        );
    }
}

module.exports = Database;
