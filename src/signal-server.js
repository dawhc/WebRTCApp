// -------------------------------------------
//             WebSocket Server
// -------------------------------------------
//
// Error Code:
// 1: Room Not Found
//
const WebSocketServer = require('ws').Server;
const server = require('./app').server;
const Room = require('./liveroom');
let rooms = [];

const wss = new WebSocketServer({
    server: server
});

wss.on('connection', client => {
    console.log(`[Signal Server] New Connection`);

    client.on('message', msg => {
        const data = JSON.parse(msg);
        switch(data.event) {
            case "join": {
                client.username = data.username;
                client.roomId = data.roomId;
                client.identity = data.identity;
                if (data.identity === 'teacher') {
                    console.log(`[Signal Server] Teacher ${data.username} has joined the room ${data.roomId}`);
                    rooms[data.roomId] = new Room(data.roomId, client);
                }
                else {
                    if ('object' === typeof rooms[data.roomId]) {
                        console.log(`[Signal Server] Student ${data.username} has joined the room ${data.roomId}`);
                        rooms[data.roomId].join(client, data.username);
                        //rooms[data.roomId].send('log', `[Message] ${data.username} has joined the room.`);
                    }
                    else {
                        console.log(`[Signal Server] Student ${data.username} failed to join the room ${data.roomId}`);
                        client.send(JSON.stringify({
                            event: 'error',
                            data: {
                                code: 1,
                                log: `Room ${data.roomId} Not Found`
                            }
                        }));
                    }
                }
                client.send('joined', {});
                break;
            }
            case "offer of camera": {
                console.log('[Signal Server] Sending offer of camera to teacher');
                rooms[client.roomId].sendToCreator('offer of camera', {
                    offer: data.offer,
                    username: client.username
                });
                break;
            }

            case "answer of camera": {
                console.log(`[Signal Server] Sending answer to ${data.ano_username}`);
                rooms[client.roomId].sendTo(data.ano_username, 'answer of camera', {answer: data.answer});
                break;
            }

            case "teacher candidate of camera": {
                console.log(`[Signal Server] Sending teacher camera candidate to ${data.ano_username}`);
                rooms[client.roomId].sendTo(data.ano_username,'candidate of camera', {candidate: data.candidate});
                break;
            }
            case "student candidate of camera": {
                console.log(`[Signal Server] Sending camera candidate of student ${client.username} to teacher`);
                rooms[client.roomId].sendToCreator('candidate of camera', {
                    username: client.username,
                    candidate: data.candidate
                });
                break;
            }


            case "offer of screen": {
                console.log('[Signal Server] Sending offer of screen to teacher');
                rooms[client.roomId].sendToCreator('offer of screen', {
                    offer: data.offer,
                    username: client.username
                });
                break;
            }
            case "answer of screen": {
                console.log(`[Signal Server] Sending answer to ${data.ano_username}`);
                rooms[client.roomId].sendTo(data.ano_username, 'answer of screen', {answer: data.answer});
                break;
            }
            case "teacher candidate of screen": {
                console.log(`[Signal Server] Sending teacher screen candidate to ${data.ano_username}`);
                rooms[client.roomId].sendTo(data.ano_username,'candidate of screen', {candidate: data.candidate});
                break;
            }
            case "student candidate of screen": {
                console.log(`[Signal Server] Sending screen candidate of student ${client.username} to teacher`);
                rooms[client.roomId].sendToCreator('candidate of screen', {
                    username: client.username,
                    candidate: data.candidate
                });
                break;
            }
            case "leave": {

                if (client.identity === 'teacher') {
                    console.log(`Teacher has left`);
                    rooms[client.roomId].send('leave', {username: client.username});
                    delete rooms[client.roomId];
                }
                else{
                    console.log(`Student ${client.username} has left`);
                    rooms[client.roomId].sendToCreator('leave', {username: client.username});
                }

                break;
            }
            case "sendmsg": {
                rooms[client.roomId].send('msg', msg);
            }
        }
    });
});

module.exports = wss;
