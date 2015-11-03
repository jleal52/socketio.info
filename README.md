# socketio.info
Connector for socketio.info cloud platform.

Move your current socket.io implementation to the cloud.

Change this:

	var io = require('socket.io')(app);


To this:

 var io = require('<strong>socketio.info</strong>')(app<strong>, 
                { username: 'c333333.socketio.info', 
                  password: 'xxxxxxxxxxxxxxxxxxxxxxxx'}</strong>);