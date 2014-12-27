// Constructor
function OcTools() {
	this.options = {};
	this.currentRequests = [];
	this.totalRequests = 0;
}

// class variables
var accountsUrl = "https://account.cloud.online.net/organizations";
var serversUrl = "https://api.cloud.online.net/servers";
var request = require('request');
var fs = require('fs');
var printf = require('printf');

// class methods
OcTools.prototype.store = function(storeFile) {
	this.store = storeFile;
	return this;
};

OcTools.prototype.port = function(portNumber) {
	this.port = portNumber;
	return this;
};

OcTools.prototype.generate = function(scope, type) {
	var conf = this.readConf(this.store);
	for ( var t in conf.tokens) {
		var servers = conf.tokens[t].servers;
		for (var i = 0; i < servers.length; i++) {
			var server = servers[i];
			if ("all" == scope || server.hostname == scope) {
				if ("dns" == type) {
					console.log(printf("%-23s 28800  %-5s  %s", server.hostname,
						"A", server.public_ip.address));
				}
				if ("ansible" == type) {
					console.log("[%s]", server.hostname);
					console.log(printf(
						"%-16s  ansible_connection=%-5s  ansible_ssh_user=%s",
						server.public_ip.address, "ssh", "root"));
				}
			}
		}
	}
};

OcTools.prototype.refresh = function() {
	var self = this;
	this.conf = this.readConf(this.store);
	if (this.conf != null && this.conf.tokens) {
		this.currentRequests = 0;
		this.totalRequests = (Object.keys(this.conf.tokens).length * 2);
		for ( var t in this.conf.tokens) {
			var token = this.conf.tokens[t];
			for ( var i in token) {
				delete token[i];
			}
			request({
				method : 'GET',
				headers : {
					'X-Auth-Token' : t,
					"Content-Type" : "application/json"
				},
				url : accountsUrl
			}, function(error, response, body) {
				var u = response.request.getHeader('X-Auth-Token');
				if (!error && response.statusCode == 200) {
					var body = JSON.parse(body);
					self.conf.tokens[u]['organizations'] = body.organizations;
				} else if (error) {
					console.log('Error: ' + error);
				}
				self.refreshEnd(u + "-org");
			});
			request({
				method : 'GET',
				headers : {
					'X-Auth-Token' : t,
					"Content-Type" : "application/json"
				},
				url : serversUrl
			}, function(error, response, body) {
				var u = response.request.getHeader('X-Auth-Token');
				if (!error && response.statusCode == 200) {
					var body = JSON.parse(body);
					self.conf.tokens[u]['servers'] = body.servers;
				} else if (error) {
					console.log('Error: ' + error);
				}
				self.refreshEnd(u + "-server");
			});
		}
	}
};

OcTools.prototype.refreshEnd = function(t) {
	this.currentRequests++;
	console.log("Received " + t + " (" + this.currentRequests + "/"
			+ this.totalRequests + ")");
	if (this.currentRequests == this.totalRequests) {
		console.log("Write config at " + this.store);
		this.writeConf(this.conf, this.store);
	}
};

OcTools.prototype.addToken = function(token) {
	var conf = this.readConf(this.store);
	if (conf == null) {
		console.log("Create new config ( %s didn't exist)", program.store)
		conf = {};
	}
	if (!conf.tokens) {
		conf.tokens = {};
	}
	if (!conf.tokens[token]) {
		conf.tokens[token] = {};
	}
	this.writeConf(conf, this.store);
};

OcTools.prototype.removeToken = function(token) {
	var conf = this.readConf(this.store);
	if (conf != null && conf.tokens[token]) {
		delete conf.tokens[token];
	}
	this.writeConf(conf, this.store);
};

OcTools.prototype.tokens = function() {
	var conf = this.readConf(this.store);
	if (conf != null) {
		for ( var t in conf.tokens) {
			console.log(t);
		}
	}
};

OcTools.prototype.get = function(scope,type) {
	var conf = this.readConf(this.store);
	if (conf != null) {
		for ( var t in conf.tokens) {
			var token = conf.tokens[t];
			if ( type == null || type == "org" ) {
				for ( var o in token.organizations) {
					var org = token.organizations[o];
					if ("all" == scope || org.name == scope)
						console.log(JSON.stringify(org, null, 2));
				}
			}
			if ( type == null || type == "server" ) {
				for ( var s in token.servers) {
					var server = token.servers[s];
					if ("all" == scope || server.hostname == scope)
						console.log(JSON.stringify(server, null, 2));
				}
			}
		}
	}
};

OcTools.prototype.writeConf = function(confObj, confPath) {
	var data = JSON.stringify(confObj, null, 2);
	if (!fs.existsSync(confPath)) {
		var confDir = path.dirname(confPath);
		if (!fs.existsSync(confDir)) {
			fs.mkdirSync(confDir, "0700");
		}
	}
	fs
			.writeFile(
					confPath,
					data,
					function(err) {
						if (err) {
							console
									.log('There has been an error saving your configuration data.');
							console.log(err.message);
							return;
						}
						console.log('Configuration saved successfully.')
					});
}

OcTools.prototype.readConf = function(confPath) {
	var exist = fs.existsSync(confPath);
	if (exist) {
		var data = fs.readFileSync(confPath), conf;
		try {
			conf = JSON.parse(data);
		} catch (err) {
			console.log('There has been an error parsing your JSON.')
			console.log(err);
		}
		return conf;
	}
	return null;
}

// server

OcTools.prototype.start = function() {
	//
};

OcTools.prototype.stop = function() {
	//
};

OcTools.prototype.run = function() {
	//
};

OcTools.prototype.status = function() {
	//
};
// export the class
module.exports = OcTools;