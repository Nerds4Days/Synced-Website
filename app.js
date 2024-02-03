const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const newUserIds = [];
const adminIds = [];
const messages = [];

// Use static folder 'public' for sending files
app.use(express.static(path.join(__dirname, 'public')));
// Start server on port 3000

const PORT = process.env.PORT || 8080

http.listen(PORT, () => console.log(`listening on *:${PORT}`));

// Handle on socket connection
io.on('connection', socket => {
	io.emit('UserJoined', "A User Has Joined!");
	console.log('A user connected');

	// Add all users to room
	socket.join('UserRoom');

	// If Admin has Joined, Add him to the Admin's room
	socket.on('AdminHasJoined', () => {
		adminIds.push(socket.id);
	});

	// When event occurs, emit event to all users
	socket.on('event', action => io.emit('event', action));

	//  When user requests time, emit an event to the admin (oldest user) to return the current synced time
	socket.on('RequestTime', () => {
		const srvSockets = [];
		// Add to new users who joined
		newUserIds.push(socket.id);

		// Get all client Ids
		for ([id, socketInfo] of io.in('UserRoom').adapter.nsp.sockets)
			srvSockets.push(id);

		const firstAdminId = adminIds[0];

		console.log(firstAdminId);

		if (firstAdminId) {
			// Brotcast to Admin
			socket.broadcast.to(firstAdminId).emit('GiveTimeToServer');
		} else {
			// Broadcast to first user to return current synced time
			socket.broadcast.to(srvSockets[0]).emit('GiveTimeToServer');
		}
	});

	// When you get the time from the oldest user, broadcast the time to all the users who clicked join
	socket.on('GotSyncedTime', videoInfo => {
		newUserIds.forEach(id => {
			socket.broadcast.to(id).emit('GotTimeFromServer', videoInfo);
		});
		newUserIds.length = 0;
	});

	// Listen for chat Message:
	socket.on('chatMessage', msg => {
		messages.push(msg);
		io.emit('message', msg);
	});

	socket.on('getMessages', () => {
		socket.emit('recieveMessages', messages);
	});

	socket.on('disconnect', () => console.log('user disconnected'));
});
