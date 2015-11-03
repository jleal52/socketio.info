# socketio.info
Connector for socketio.info cloud platform.

Move your current socket.io implementation to the cloud.

socketio.info uses standard socket.io server as it's backend!

Request a beta preview host and password to info@socketio.info


Change your server side code from this:

	var io = require('socket.io')(app);


To this:

	var io = require('socketio.info')(app,
				{ username: 'c333333.socketio.info', 
				password: 'xxxxxxxxxxxxxxxxxxxxxxxx'});
				
Now change your socket.io client js from this:

	<script src="socket.io/socket.io.js"></script>
	var socket = io();

To this:

	<script src="https://cdn.socket.io/socket.io-1.3.7.js"></script>
	var socket = io('https://c333333.socketio.info');
