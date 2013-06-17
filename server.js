var Server = require('./lib/server');

var server = new Server();

server.loadPlugins(['misc', 'users', 'channels']);

server.listen(6667);