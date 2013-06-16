var net = require('net');
var dns = require('dns');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var logger = require('./logger');

function Server(debug) {
	this._server = undefined;
	this._host = undefined;
	this._port = undefined;

	this.channels = {};
	this.registeredUser = {};
	this.users = [];

	this._sockets = [];
	this._plugins = [];

	this._initializeServer();
	this._loadData();
}

util.inherits(Server, EventEmitter);

Server.prototype._initializeServer = function() {
	var self = this;

	this._server = net.createServer(function(socket) {
		self.emit('routine');

		self._sockets.push(socket);

		socket.on('data', function(data) {
			self.emit('routine');
			self._data(self._sockets.indexOf(socket), data);
		});

		socket.on('error', function(error) {
			// TO-DO : Client error
		});

		socket.on('close', function() {
			
		});

		self._newConnection(socket);
	});
};

Server.prototype._loadData = function() {
	// TO-DO : Load data from /data/
};

Server.prototype._newConnection = function(socket) {
	var idSocket = this._sockets.indexOf(socket);

	var user = {
		nick : undefined,
		user : undefined,
		realname : undefined,
		last : Date.now(),
		host : undefined,
		socketId : idSocket,
		addr : socket.remoteAddress,
		pinged : false,
		auth : false,
		motd : false,
		channels : []
	};

	this.users.push(user);
	var idUser = this.users.indexOf(user);

	this.sendData(idUser, "NOTICE AUTH :***Looking up your hostname", 'none');
	this.sendData(idUser, "NOTICE AUTH :***Checking ident", 'none');
	this.sendData(idUser, "NOTICE AUTH :***No ident found", 'none');

	var self = this;
	dns.reverse(socket.remoteAddress, function(err, domains) {
		var domain = undefined;

		if(err !== undefined || domains.length == 0) {
			domain = socket.remoteAddress

			self.sendData(idUser, "NOTICE AUTH :***Hostname not found, using your IP instead", 'none');
		} else {
			domain = domains[0];

			self.sendData(idUser, "NOTICE AUTH :***Found your hostname", 'none');
		}

		self.users[idUser].host = domain;
	});

	logger.log('New client(id:' + idUser + ') connected (' + user.addr + ')');
};

Server.prototype._data = function(id, data) {
	data = data.toString();

	for (var i in data = data.split('\n')) {
		var line = data[i]
		var command = line.split(' ')[0].toUpperCase();

		this.emit('command#' + command, {
			'socket' : id,
			'user' : this.getUserIdBySocketId(id),
			'line' : line,
		});
	}
};

Server.prototype.sendData = function(id, data, type, source) {
	if(type == undefined) type = 'server';

	if(this.users[id] === undefined)
		return;

	if(type == 'client') {
		data = ':' + 
			this.users[source].nick + 
			'!' + this.users[source].user +
			'@' + this.users[source].host + 
			' ' + data + "\r\n";
	} else if(type == 'server') {
		data = ':' + 
			((this._host == undefined) ? 'unknow' : this._host) + 
			' ' + data + "\r\n";
	} else {
		data = data + "\r\n";
	}

	this._sockets[this.users[id].socketId].write(new Buffer(data));
};

Server.prototype.listen = function(port, host) {
	this._port = port;

	if(net.isIP(host) !== 0) {
		this._host = host;

		var self = this;
		dns.reverse(host, function(err, domains) {
			if(err === undefined && domains.length !== 0) {
				self._host = domains[0];
			}
		});

		this._server.listen(port, host);

		logger.log('Server listen on ' + host + ':' + port);
	} else {
		this._server.listen(port);

		logger.log('Server listen on port ' + port);
	}
};

Server.prototype.getUserIdBySocketId = function(socketId) {
	for(var i in this.users) {
		if(this.users[i].socketId == socketId) 
			return i;
	}
};

Server.prototype.loadPlugin = function(name) {
	try {
		this._plugins.push(new (require('./../plugins/' + name))());
	} catch(e) {
		throw new Error('Cannot load the plugin "' + name + '"');
	}

	this._plugins[this._plugins.length - 1].initialize(this);

	logger.log('Initialization plugin : "' + name + '"');
};

Server.prototype.loadPlugins = function(names) {
	for(var i in names)
		this.loadPlugin(names[i]);
};

module.exports = Server;