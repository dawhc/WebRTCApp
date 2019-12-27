const mysql = require('mysql');

const db_conn = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'a123456',
    database: 'OnlineEducation',
    //useConnectionPooling: true
});

db_conn.connect('', () => {console.log('[App] Database has connected');});

module.exports = db_conn;