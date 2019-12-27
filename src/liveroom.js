class LiveRoom {
    constructor(roomId, creator, maxSize = 1) {
        this.cnt = 0;
        this.roomId = roomId;
        this.creator = creator;
        this.users = [];
    }
    join(user, id) {
        this.users[id] = user;
    }
    leave(user, id) {
        this.users[id] = null;
    }
    sendToCreator(event, args) {
        this.creator.send(JSON.stringify({
            event: event,
            data: args
        }));
    }
    send(event, args) {
        this.users.forEach(user => {
            user.send(JSON.stringify({
                event: event,
                data: args
            }));
        });
    }
    sendTo(id, event, args) {
        if (this.users[id])
            this.users[id].send(JSON.stringify({
                event: event,
                data: args
            }));
    }
}

module.exports = LiveRoom;