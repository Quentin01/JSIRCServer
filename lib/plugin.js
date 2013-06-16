var codes = require('./codes');

function Plugin() {
	this._server = undefined;
	this._codes = undefined;
}

Plugin.prototype.initialize = function(server) {
	this._server = server;
	this._codes = codes;
	
	this._initialize();
};

Plugin.prototype.registerCommand = function(command, functionName) {
	var self = this;

	if(functionName == undefined) {
		functionName = 'on' + command.charAt(0).toUpperCase() + command.slice(1).toLowerCase();
	}

	this._server.on('command#' + command.toUpperCase(), function(data) {
		self[functionName](data);
	});
};

Plugin.prototype.registerCommands = function(commands) {
	for(var i in commands) {
		this.registerCommand(commands[i]);
	}
};

Plugin.prototype.addRoutine = function(callback) {
	this._server.on('routine', callback);
};

module.exports = Plugin;