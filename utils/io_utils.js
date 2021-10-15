
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('connected');
        socket.on('room', (room) => {
            socket.join(room);
        });
    });

}