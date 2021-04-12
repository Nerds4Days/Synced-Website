const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(3000, () => console.log('listening on *:3000'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get('/music.mp4', (req, res) => res.sendFile(__dirname + '/music.mp4'));

app.get('/style.css', (req, res) => res.sendFile(__dirname + '/style.css'));
app.get('/frontend.js', (req, res) => res.sendFile(__dirname + '/frontend.js'));


io.on('connection', socket => {
	console.log('A user connected');

	socket.on("RequestTime", function(someShit){
		let srvSockets = io.sockets.sockets;
		console.log(Object.keys(srvSockets));
		
		socket.broadcast.to(Object.keys(srvSockets)[0]).emit("GiveTimeToServer", "Some Shit");
	});
	
	socket.on("TimeIs", function(data){
		let srvSockets = io.sockets.sockets;
		console.log(Object.keys(srvSockets));
		
		socket.broadcast.to(Object.keys(srvSockets)[Object.keys(srvSockets).length - 1]).emit("GetTimeFromServer", data);
		// io.emit("GetTimeFromServer", data);
	});
	

	socket.on('disconnect', () => console.log('user disconnected'));
});


io.on('connection', socket => {
	console.log('event happening');
	socket.on('event', action => io.emit('event', action));
});
