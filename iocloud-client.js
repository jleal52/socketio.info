

var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');

module.exports = ioCloud;

function ioCloud(srv, opts) {
	if (!(this instanceof ioCloud)) return new ioCloud(srv, opts);
	if ('object' == typeof srv && !srv.listen) {
	  opts = srv;
	  srv = null;
	}

	/* Server compatibility */
	this.name = '/';
	this.path = function() {
		return "/socket.io";
	};
	this.adapter = function() {};
	this.origins = function() {};
	this.attach = function() {};
	this.listen = function() {};
	this.bind = function() {};
	this.use = function() {};
	var self = this;
	this.connected = {};
	this.clients = function(cb) {
		cb(null, this.connected);
	};

	this.event = new EventEmitter();
	this.on = function() {
		self.event.on.apply(self.event, Array.prototype.slice.call(arguments));
	};
	this.emit = function() {
		self.client.emit('newall', { args:Array.prototype.slice.call(arguments) });
	};
	this.sockets = {emit: this.emit}; //Compatibility
	this.of = function(nsp) {
		if (nsp != '/') throw new Exception("No namespaces supported yet.");
		return self;
	};
	this.close = function() {
		self.client.disconnect();
	};

	this.client = io('https://broker.socketio.info',
			{
				extraHeaders: { 'Authorization': 'Basic ' + (new Buffer(opts.username + ':' + opts.password)).toString('base64')}
			});

	this.client.on('sconn', function(data, cb) {
		var sc = new ioSocket(data.id, self);
		self.connected[data.id] = sc;
		self.event.emit('connection', sc);
		self.event.emit('connect', sc);
		cb();
	});

	this.client.on('sdisc', function(data, cb) {
			delete self.connected[data.id];
	});

	this.client.on('sevent', function(data, cb) {
		var vSocket = self.connected[data.id];
		if (vSocket != null) {
			data.args.splice(0,0,data.name);
			if (cb != null) {
				data.args.push(cb);
			}
			vSocket.event.emit.apply(vSocket.event, data.args);
		}
	});

}

function ioSocket(id, cloud) {
	var self = this;
	this.id = id;
	this.cloud = cloud;

	this.compress = function() { return self; };

	this.event = new EventEmitter();
	this.event.on('newListener', function(evt) {
		self.cloud.client.emit('newevent', {name: evt, id: self.id});
	});

	this.on = function() {
		self.event.on.apply(self.event, Array.prototype.slice.call(arguments));
	};

	this.broadcast = {
		emit: function() {
			self.cloud.client.emit('newbroad', {id:self.id, args:Array.prototype.slice.call(arguments)});
		}
	};
	this.to = this['in'] = function(room) {
		return {
				emit: function() {
					self.cloud.client.emit('newto', {id: self.id, room: room, args:Array.prototype.slice.call(arguments)});
				}
			};
	};

	this.join = function(name, cb) {
		self.cloud.client.emit('newjoin', {id: self.id, room: name}, cb);
	};
	this.leave = function(name, cb) {
		self.cloud.client.emit('newleave', {id: self.id, room: name}, cb);
	}

	this.emit = function() {
		var args = Array.prototype.slice.call(arguments);
		var cb = null;
		if (args.length > 0 && typeof args[args.length-1] == 'function') {
			cb = args[args.length-1];
			args.splice(-1,1);
		}
		self.cloud.client.emit('newemit', {id: self.id, args: args}, cb);
	};

}


