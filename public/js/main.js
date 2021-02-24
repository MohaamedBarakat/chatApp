const chatForm = document.getElementById('chat-form');

const chatMessage = document.querySelector('.chat-messages');

const roomName = document.getElementById('room-name');

const userList = document.getElementById('users');

// Get username and room from URl
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();
//Join Chat room
socket.emit('joinRoom', { username, room });

// Get room users
socket.on('roomUsers', ({ room, users }) => {
        outputRoomName(room);
        outputUsers(users);
    })
    //Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    // Scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

//messgae submit

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //Get value of input from form
    const msg = e.target.elements.msg.value;
    //console.log(msg);

    //emit messgae to server
    socket.emit('chatMessage', msg);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

// Output messgae to DOM
const outputMessage = (messageFormate) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${messageFormate.username} <span>${messageFormate.time}</span></p>
    <p class="text">
    ${messageFormate.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
};

// Add room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room;

};

//Add users to DOM
const outputUsers = (users) => {
        userList.innerHTML = `
${users.map(user=>`<li>${user.username}</li>`).join('')}
`;
};