var util = require('util');
var fs = require('fs');

var plugin = require('./../lib/plugin');

function MiscPlugin() {
	
}

util.inherits(MiscPlugin, plugin);

MiscPlugin.prototype._initialize = function() {
	this.registerCommands(['PING', 'PONG', 'QUIT']);

	var self = this;
	this.addRoutine(function() {
		self.timeout();
	});
};

MiscPlugin.prototype.onPing = function(data) {
	var token = data.line.split(':')[1];
	this._server.sendData(data.user, 'PONG ' + this._server._host + ' :' + token, 'server');
};

MiscPlugin.prototype.onPong = function(data) {
	if(this._server.users[data.user].motd === false) {
		this._server.users[data.user].motd = true;

		var self = this;
		fs.readFile('data/MOTD.txt', 'utf8', function (err, content) {
			if (err) throw err;
			
			content = content.split("\n");

			self._server.sendServerData(data.user, self._codes.RPL_WELCOME, content[0]);
			self._server.sendServerData(data.user, self._codes.RPL_MOTDSTART, "- Message Of The Day");
		
			for(var i in content) {
				if(i > 0) 
					self._server.sendServerData(data.user, self._codes.RPL_MOTD, content[i]);
			}

			self._server.sendServerData(data.user, self._codes.RPL_ENDOFMOTD, "End of MOTD command");
		});
	}
};

MiscPlugin.prototype.onQuit = function(data) {
	var reason = data.line.split(':')[1];
	this._server.disconnectUser(data.user, (reason == undefined) ? 'QUIT' : reason);
};

MiscPlugin.prototype.timeout = function() {
	for(var id in this._server.user) {
		if(this._server.users[id].last + 120 >= Date.now()) {
			this._server.users[id].pinged = false;
		} else if(this._server.users[id].last + 120 < Date.now() && this._server.users[id].pinged == false) {
			this._server.users[id].pinged = true;
			this._server.sendData(id, 'PING :' + Date.now(), 'none');
		} else if(this._servers.users[id].last + 150 < Date.now()) {
			this._server.disconnectUser(id, 'Ping timeout');
		}
	}
};

module.exports = MiscPlugin;