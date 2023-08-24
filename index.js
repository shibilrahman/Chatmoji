const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from the public directory

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('userJoined', (username) => {
    socket.username = username;
    io.emit('userJoined', `${username} joined the chat`);
  });

  socket.on('chatMessage', (message) => {
    const emojiMap = {
      'smile': '😊',
      'sad': '😢',
      'hey': '👋',
      'react': '⚛️',  // Atom symbol
      'woah': '😮',
      'congratulations': '🎉',
      'lol': '😂',
      'like': '❤️',  // Heart symbol
    };

    // Replace words with emojis (case-insensitive)
    const modifiedMessage = message
      .split(' ')
      .map(word => emojiMap[word.toLowerCase()] || word)
      .join(' ');

    io.emit('chatMessage', { username: socket.username, message: modifiedMessage });
  });

  socket.on('disconnect', () => {
    io.emit('userLeft', `${socket.username} left the chat`);
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});