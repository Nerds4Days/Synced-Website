<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<script
			src="https://kit.fontawesome.com/03ea0d3614.js"
			crossorigin="anonymous"
		></script>
		<title>🍿 MOVIE NIGHT! 🍿</title>

		<link rel="stylesheet" href="/style.css" />
	</head>

	<body>
		<div class="container video-container my-S">
			<div class="overlay">
				<div class="user-join-container">
					<label for="username" class="label user-label"
						>Username</label
					>
					<input
						type="text"
						name="username"
						id="username"
						class="input user-input my-S"
						autocomplete="off"
						placeholder="Enter Username..."
					/>
					<button class="btn user-join">Join</button>
				</div>
				<div class="admin-join-container">
					<button class="btn admin-join">Join As Admin</button>
					<input
						type="text"
						name="pin"
						id="pin"
						placeholder="Enter Pin..."
						class="input admin-input"
						autocomplete="off"
					/>
				</div>
			</div>
			<video src=""></video>
			<div class="controls">
				<i class="fas fa-play fa-2x" id="play-pause"></i>
				<i class="fas fa-backward fa-2x" id="backward"></i>
				<i class="fas fa-forward fa-2x" id="forward"></i>
				<div class="slider">
					<div class="bar"></div>
					<div class="slider-btn"></div>
				</div>
				<p class="time">00:00</p>
				<i class="fas fa-expand fa-2x" id="fullscreen"></i>
			</div>
		</div>

		<aside class="chat-container">
			<div class="messages-container"></div>
			<div class="message-form">
				<form id="message-submit">
					<input
						id="msg"
						type="text"
						placeholder="Message..."
						class="input message-input"
						autocomplete="off"
					/>
					<input
						type="submit"
						value="Send"
						class="btn btn-block btn-disabled message-send"
						disabled
					/>
				</form>
			</div>
		</aside>

		<script
			src="https://cdn.socket.io/3.1.3/socket.io.min.js"
			integrity="sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh"
			crossorigin="anonymous"
		></script>
		<script src="/socket.io/socket.io.js"></script>
		<script src="./frontend.js"></script>
	</body>
</html>
