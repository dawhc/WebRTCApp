// -------------------------------------------
//             Express Application
// -------------------------------------------

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ip = require('ip');
const https = require('https');
const fs = require('fs');

const app = express();

// *** Engine and Middleware ***
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');
app.set('views', './views');
app.set('ip', ip.address());
app.set('port', 8080);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views/'));
app.use(cookieParser('abc123'));

// *** SSL config ***
const ssl_config = {
    key: fs.readFileSync('./ssl/private.pem', 'utf-8'),
    cert: fs.readFileSync('./ssl/server.crt', 'utf-8')
};

const server = https.createServer(ssl_config, app);

module.exports = app;
module.exports.server = server;