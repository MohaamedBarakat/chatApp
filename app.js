const express = require('express');

const bodyParser = require('body-parser');

const socketio = require('socket.io');

const path = require('path');

const formatMessage = require('./utils/messages');

const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();

const bot = 'ChatApp Bot';

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

const server = app.listen(process.env.PORT, () => {
    console.log(`App is on fire from port ${process.env.PORT}`);
});

const io = socketio(server);

io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log(user);
        console.log('New WS connection...');
        socket.join(user.room);
        socket.emit('message', formatMessage(bot, 'Welcome to ChatApp!'));
        socket.broadcast.to(user.room).emit('message', formatMessage(bot, `A ${user.username} have joined chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        //console.log(msg);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(bot, `${user.username} has left chat`));
        }
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});