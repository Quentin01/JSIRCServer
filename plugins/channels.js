var util = require('util');

var plugin = require('./../lib/plugin');

function ChannelsPlugin() {
	
}

util.inherits(ChannelsPlugin, plugin);

ChannelsPlugin.prototype._initialize = function() {
	this.registerCommands(['JOIN', 'PART', 'MODE', 'KICK', 'TOPIC', 'LIST']);

	var self = this;
	this.addRoutine(function() {
		for(var i in self._server.channels) {
			if(Object.keys(self._server.channels[i].users).length == 0) {
				delete self._server.channels[i];
			}
		}
	});
};

ChannelsPlugin.prototype.onJoin = function(data) {
	var channel = data.line.split(' ')[1].toLowerCase();

	if(this._server.channels[channel] !== undefined) {
		if(this._server.users[data.user].channels.indexOf(channel) === -1) {
			this._server.channels[channel].users[data.user] = {
				id : data.user,
				modes : ''
			};

			this._server.users[data.user].channels.push(channel);

			var nickList = [];
			for(var i in this._server.channels[channel].users) {
				var user = this._server.channels[channel].users[i];
				var nick = this._server.users[user.id].nick;

				if(user.modes.indexOf('o') != -1) {
					nickList.push('@' + nick);
				} else if(user.modes.indexOf('h') != -1) {
					nickList.push('%' + nick);
				} else if(user.modes.indexOf('v') != -1) {
					nickList.push('+' + nick);
				} else {
					nickList.push(nick);
				}
			}

			this._server.broadcastOnChannel(channel, 'JOIN ' + channel, [], 'client', data.user);
			this._server.sendData(data.user, this._codes.RPL_NAMREPLY + ' = ' + this._server.users[data.user].nick + ' ' + channel + ' :' + nickList.join(' '), 'server', data.user);
			this._server.sendServerData(data.user, this._codes.RPL_ENDOFNAMES, 'End of NAMES list', [channel]);

			if(this._server.channels[channel].topic.length > 0)
				this._server.sendData(data.user, 'TOPIC ' + channel + ' :' +  this._server.channels[channel].topic, 'client', data.user);
		} else {
			this._server.sendServerData(data.user, this._codes.ERR_ALREADYONCHANNEL, 'You\'re already on this channel');
		}
	} else {
		this._server.channels[channel] = {
			users : {},
			topic : '',
			modes : 'tn'
		};

		this._server.channels[channel].users[data.user] = {
			id : data.user,
			modes : 'o'
		};

		this._server.users[data.user].channels.push(channel);

		this._server.sendData(data.user, 'JOIN ' + channel, 'client', data.user);
		this._server.sendData(data.user, this._codes.RPL_NAMREPLY + ' = ' + this._server.users[data.user].nick + ' ' + channel + ' :@' + this._server.users[data.user].nick, 'server', data.user);
		this._server.sendServerData(data.user, this._codes.RPL_ENDOFNAMES, 'End of NAMES list', [channel]);
	}
};

ChannelsPlugin.prototype.onPart = function(data) {

};

ChannelsPlugin.prototype.onMode = function(data) {

};

ChannelsPlugin.prototype.onKick = function(data) {

};

ChannelsPlugin.prototype.onTopic = function(data) {

};

ChannelsPlugin.prototype.onList = function(data) {

};

module.exports = ChannelsPlugin;