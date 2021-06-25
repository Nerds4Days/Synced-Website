// APP VARIABLES
const socket = io();
const video = document.querySelector('video');
const pBtn = document.querySelector('#play-pause');
const forwBtn = document.querySelector('#forward');
const backwBtn = document.querySelector('#backward');
const fullScrnBtn = document.querySelector('#fullscreen');
const bar = document.querySelector('.bar');
const barContainer = document.querySelector('.slider');
const sliderBtn = document.querySelector('.slider-btn');
// GLOBAL VARIABLES
 const VIDEO_SRC = 'https://icecube-eu-828.icedrive.io/download?p=FPQtjwcMs2BwiZVRCs0p4N0KU5hGYnATuhLNaMfUN5yMe%2BT3J%2BdG43datd%2FFo%2FkrxBRTNqp8Ks0bmuANKzzi7Zn0%2FU%2FtNZ5uJ87N5LqR7YeFnej6DYu38s49WjSiOcjjGOzA8muGhBoXXhIMUlYRtAmDIuR4CfhMthMeZuaOYuDU1elHj5c%2BEDX64LyCFEj9noKgHJeDBtxNyfKIQIu1pQ%3D%3D';
const ADMINPIN = '555';
let isFullScreen = false;
let username;
let isAdmin = false;

// EVENT LISTENERS
function initAdminEvents() {
	pBtn.addEventListener('click', handlePlayPause);
	forwBtn.addEventListener('click', () =>
		socket.emit('event', {
			type: 'ForwardBy10s',
			payload: video.currentTime
		})
	);
	backwBtn.addEventListener('click', () =>
		socket.emit('event', {
			type: 'BackwardBy10s',
			payload: video.currentTime
		})
	);
	bar.addEventListener('click', handleBarBtnPosChange);
	sliderBtn.addEventListener('mousedown', handleBarBtnSlide);
}

video.addEventListener('timeupdate', handleTimeChange);
fullScrnBtn.addEventListener('click', toggleFullScreen);
// When resized, change the position of the slider button because slider bar changes width
window.addEventListener('resize', changeSliderBtnPos);
document.querySelector('.user-join').addEventListener('click', handleJoin);
document
	.querySelector('.admin-join')
	.addEventListener('click', toggleAdminJoin);
document
	.querySelector('#message-submit')
	.addEventListener('submit', sendMessage);
document.addEventListener('DOMContentLoaded', getMsgsFromServerAndDisplay);

// UI FUNCTIONS
function handlePlayPause(e) {
	if (e.target.classList.contains('fa-play')) {
		return socket.emit('event', {
			type: 'play',
			payload: video.currentTime
		});
	}

	return socket.emit('event', { type: 'pause', payload: video.currentTime });
}

function handleTimeChange() {
	// If video ends, change button to play button
	if (video.currentTime == video.duration) {
		pBtn.classList.remove('fa-pause');
		pBtn.classList.add('fa-play');
	}

	let time = video.currentTime;

	// Calculate minutes and seconds and set in time value container in UI
	let hours = ~~(time / 3600);
	let minutes = ~~((time % 3600) / 60);
	let seconds = ~~time % 60;

	if (String(hours).length == 1) hours = '0' + hours;
	if (String(minutes).length == 1) minutes = '0' + minutes;
	if (String(seconds).length == 1) seconds = '0' + seconds;

	document.querySelector('.time').innerHTML = `${hours}:${minutes}:${seconds}`;

	// Move slider button because time changed
	changeSliderBtnPos();
}

function handleBarBtnPosChange(e) {
	// Calculate and set UI position of slider button
	let barPos = bar.getBoundingClientRect();
	let leftValue = e.clientX - barPos.left;
	sliderBtn.style.left = leftValue - 4 + 'px';

	// Calculate and set video time
	video.currentTime = (leftValue / bar.clientWidth) * video.duration;

	socket.emit('event', {
		type: 'videoTimeChange',
		payload: video.currentTime
	});
}

function handleBarBtnSlide() {
	// Slide bar button in mouse direction when mouse moves on bar container
	barContainer.onmousemove = handleBarBtnPosChange;
	// If mouse up, stop the sliding of the button
	document.onmouseup = stopSliding;
}

function stopSliding() {
	document.onmouseup = null;
	barContainer.onmousemove = null;
}

function changeSliderBtnPos() {
	// Calculate and set UI position of button
	let leftValue = bar.clientWidth * (video.currentTime / video.duration);
	sliderBtn.style.left = leftValue - 4 + 'px';
}

function toggleFullScreen() {
	const videoContainer = document.querySelector('.video-container');

	if (isFullScreen) {
		// Cancel full screen
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();

		isFullScreen = false;
	} else {
		// Request full screen
		if (videoContainer.requestFullscreen)
			videoContainer.requestFullscreen();
		else if (videoContainer.msRequestFullscreen)
			videoContainer.msRequestFullscreen();
		else if (videoContainer.mozRequestFullScreen)
			videoContainer.mozRequestFullScreen();
		else if (videoContainer.webkitRequestFullScreen)
			videoContainer.webkitRequestFullScreen();

		isFullScreen = true;
	}
}

function handleJoin() {
	const usernameInput = document.querySelector('.user-input').value;
	if (
		!usernameInput ||
		usernameInput.trim().length === 0 ||
		usernameInput.length > 100
	)
		return document
			.querySelector('.user-input')
			.classList.add('danger-input');
	username = usernameInput;

	const pin = document.querySelector('.admin-input').value;
	if (pin === ADMINPIN) {
		initAdminEvents();
		isAdmin = true;
	}

	// If it's admin, give permitions to pause, play and stuff
	isAdmin ? socket.emit('AdminHasJoined') : removeUnecesarryBtns();

	document.querySelector('.overlay').style.display = 'none';
	video.src = VIDEO_SRC;



	initChat();
	// Request current synced time from server
	socket.emit('RequestTime');
}

function initChat() {
	document.querySelector('.message-send').disabled = false;
	document.querySelector('.message-send').classList.remove('btn-disabled');
}

// Hide not-permitted buttons from regular user
function removeUnecesarryBtns() {
	(forwBtn.style.display = 'none'), (backwBtn.style.display = 'none');
}

function toggleAdminJoin() {
	const input = document.querySelector('.admin-input');
	if (input.style.visibility !== 'visible')
		return (input.style.visibility = 'visible');

	input.style.visibility = 'hidden';
}

// HANDLE SOCKET EVENT
socket.on('event', action => {
	switch (action.type) {
		case 'play':
			video.currentTime = action.payload;
			video.play();
			pBtn.classList.add('fa-pause');
			pBtn.classList.remove('fa-play');
			break;
		case 'pause':
			video.currentTime = action.payload;
			video.pause();
			pBtn.classList.remove('fa-pause');
			pBtn.classList.add('fa-play');
			break;
		case 'ForwardBy10s':
			video.currentTime += 10;
			break;
		case 'BackwardBy10s':
			video.currentTime -= 10;
			break;
		case 'videoTimeChange':
			video.currentTime = action.payload;
			break;
		default:
			return action;
	}
});

socket.on('GiveTimeToServer', () => {
	socket.emit('GotSyncedTime', {
		time: video.currentTime,
		isPaused: video.paused
	});
});

socket.on('GotTimeFromServer', videoInfo => {
	video.currentTime = videoInfo.time + 0.2;
	if (videoInfo.isPaused) {
		video.pause();
		pBtn.classList.add('fa-play');
		pBtn.classList.remove('fa-pause');
	} else {
		video.play();
		pBtn.classList.add('fa-pause');
		pBtn.classList.remove('fa-play');
	}
});

// CHAT

// Message submit:
function sendMessage(e) {
	e.preventDefault();

	const message = document.querySelector('.message-input').value;
	console.log(message, username, message.trim());
	if (
		!message ||
		!username ||
		message.trim().length === 0 ||
		message.length > 100
	)
		return;

	// Emitting a message to the server:
	socket.emit('chatMessage', { message, username });

	document.querySelector('.message-input').value = '';
}

// Get Message from server:
socket.on('message', messageInfo => outputMessage(messageInfo));

// Outputing the message to all users:
function outputMessage(messageInfo) {
	const messagesContainer = document.querySelector('.messages-container');
	const div = document.createElement('div');
	
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
	div.classList.add('message-container', 'my-XS');
	messageInfo.username === username && div.classList.add('sender');
	div.innerHTML = 
			`<small class="message-username">${messageInfo.username}</small>
			<p class="message">${messageInfo.message}</p>`;

	messagesContainer.appendChild(div);
}

function getMsgsFromServerAndDisplay() {
	socket.emit('getMessages');
}

socket.on('recieveMessages', messages =>
	messages.forEach(msg => outputMessage(msg))
);



socket.on('UserJoined', message =>
	OutputServerMessage(message)
);

function OutputServerMessage(msg) {
	const messagesContainer = document.querySelector('.messages-container');
	const div = document.createElement('div');
	
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
	div.classList.add('message-container', 'my-XS');
	div.innerHTML = 
			`<p class="message server-message">${msg}</p>`;

	messagesContainer.appendChild(div);
}
