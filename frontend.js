// APP VARIABLES
const socket = io();
const video = document.querySelector('video');
const pBtn = document.querySelector('#play-pause');
const forwBtn = document.querySelector('#forward');
const backwBtn = document.querySelector('#backward');
const bar = document.querySelector('.bar');
const barContainer = document.querySelector('.slider');
const sliderBtn = document.querySelector('.slider-btn');
const VIDEO_SRC = './music.mp4';

// EVENT LISTENERS
pBtn.addEventListener('click', handlePlayPause);
forwBtn.addEventListener('click', () =>
	socket.emit('event', { type: 'ForwardBy10s', payload: video.currentTime })
);
backwBtn.addEventListener('click', () =>
	socket.emit('event', { type: 'BackwardBy10s', payload: video.currentTime })
);
video.addEventListener('timeupdate', handleTimeChange);
bar.addEventListener('click', handleBarBtnPosChange);
sliderBtn.addEventListener('mousedown', handleBarBtnSlide);
// When resized, change the position of the slider button because slider bar changes width
window.addEventListener('resize', changeSliderBtnPos);
// Hide overlay on join
document.querySelector('.join').addEventListener('click', () => {
	document.querySelector('.overlay').style.display = 'none';
	video.src = VIDEO_SRC;
	socket.emit("RequestTime", "Requesting Time");
});

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

	// Calculate minutes and seconds and set in time value container in UI
	let minutes = String(Math.floor((video.currentTime / 60) % 10));
	let seconds = String(Math.floor(video.currentTime % 60));
	if (minutes.length == 1) minutes = '0' + minutes;
	if (seconds.length == 1) seconds = '0' + seconds;

	document.querySelector('.time').innerHTML = `${minutes}:${seconds}`;

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


socket.on("GiveTimeToServer", function(SomeRandomShit){
	console.log("This Works");
	socket.emit("TimeIs", video.currentTime);
});

socket.on("GetTimeFromServer", function(data){
	video.currentTime = data + 0.2;
	video.play();
	pBtn.classList.add('fa-pause');
	pBtn.classList.remove('fa-play');
});
