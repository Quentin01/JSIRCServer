var util = require('util');

var plugin = require('./../lib/plugin');

function UsersPlugin() {
	
}

util.inherits(UsersPlugin, plugin);

UsersPlugin.prototype._initialize = function() {
	this.registerCommands(['NICK', 'USER', 'WHOIS']);
};

UsersPlugin.prototype.onNick = function(data) {
	var nick = data.line.split(' ')[1];

	if(nick == undefined) {
		this._server.sendServerData(data.user, this._codes.ERR_NEEDMOREPARAMS, "Not enough parameters");
		return;
	} else if(this._server.getUserIdByNick(nick) !== false) {
		this._server.sendServerData(data.user, this._codes.ERR_NICKNAMEINUSE, "Nick already in use");
		return;
	}

	this._server.users[data.user].nick = nick;

	for(var i in this._server.users[data.user].channels) {
		this._server.broadcastOnChannel(this._server.users[data.user].channels[i], 'NICK ' + nick, [], 'client', data.user);
	}

	if(this._server.users[data.user].user !== undefined) {
		this._server.sendData(data.user, 'PING :' + Date.now(), 'none');
	}
};

UsersPlugin.prototype.onUser = function(data) {
	var datas = data.line.split(' ');
	var real = data.line.split(':')[1];

	if(datas[4] !== undefined) {
		this._server.users[data.user].user = datas[1];

		if(real !== undefined) {
			this._server.users[data.user].realname = real;
		} else {
			this._server.users[data.user].realname = datas[4];
		}

		if(this._server.users[data.user].user !== undefined) {
			this._server.sendData(data.user, 'PING :' + Date.now(), 'none');
		}
	} else {
		this._server.sendServerData(data.user, this._codes.ERR_NEEDMOREPARAMS, "Not enough parameters");
	}
};

UsersPlugin.prototype.onWhois = function(data) {
	// TO-DO : Response
};

module.exports = UsersPlugin;