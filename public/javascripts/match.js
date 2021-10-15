let socket = io();

socket.on('connect', function(){
    //todo replace 123 with the room number that is supposed to be placed
    socket.emit('room', '123');
});