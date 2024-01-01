const io = require('socket.io')(3000);

const users = {};

io.on('connection', socket => {
  // Error handling
  socket.on('error', err => {
    console.error(`Socket error: ${err.message}`);
    // Handle the error as needed
  });

  // New user connection
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  // Joining/leaving rooms
  socket.on('join-room', room => {
    socket.join(room);
    socket.to(room).emit('user-connected', users[socket.id]);
  });

  socket.on('leave-room', room => {
    socket.leave(room);
    socket.to(room).emit('user-disconnected', users[socket.id]);
  });

  // Sending and broadcasting chat messages
  socket.on('send-chat-message', data => {
    const timestamp = new Date().toLocaleTimeString();
    io.to(data.room).emit('chat-message', { message: data.message, name: users[socket.id], timestamp });
  });

  // Getting user list
  socket.on('get-users', () => {
    socket.emit('user-list', Object.values(users));
  });

  // User disconnection
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});
