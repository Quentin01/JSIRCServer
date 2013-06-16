function Logger() {

}

Logger.prototype.log = function(message) {
	var date = new Date();

	var dateString = '[';
	dateString += ((date.getHours() < 10) ? '0' : '') + date.getHours();
	dateString += ':';
	dateString += ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();
	dateString += ':';
	dateString += ((date.getSeconds() < 10) ? '0' : '') + date.getSeconds();
	dateString += ']';
	
	console.log(dateString + ' ' + message);
};

module.exports = new Logger();