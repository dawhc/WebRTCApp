const app = require('./app');
const wss = require('./signal-server');
const server = require('./app').server;

// *** applications ***
require('./login-app');
require('./liveroom-app');
require('./student-app');
require('./teacher-app');
require('./course-app');


server.listen(8080, () => {
    console.log(`Server Started at https://${app.get('ip')}:${app.get('port')}/`);
});