
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('room', (room) => {
            socket.join(room);
        });
    });

}