// class variables

var accountsUrl = "https://account.cloud.online.net/organizations";

var serversUrl = "https://api.cloud.online.net/servers";

// Constructor
function OcTools() {
	// always initialize all instance properties
	this.options = {};
	this.currentRequests = [];
	this.totalRequests = 0;
}

// class methods
OcTools.prototype.store = function(storeFile) {
	this.store = storeFile;
	return this;
};

var request = require('request');
var fs = require('fs');
var printf = require('printf');

OcTools.prototype.generate = function( scope, type ) {
	var conf = this.readConf(this.store);
	console.log("Generate %s from %s",type,scope);
	for ( var t in conf.tokens ) {
		var servers = conf.tokens[t].servers;
		for ( var i=0 ; i< servers.length;i++ ) {
			var server = servers[i];
			//console.log("Generate server %s (%s/%s)",server.hostname,server.private_ip,server.public_ip.address);
			//hercule                 28800  A      212.47.236.48
			console.log(printf("%-23s 28800  %-5s  %s",server.hostname,"A",server.public_ip.address));
			//console.log();
			//console.log(JSON.stringify( server, null, 2 ));
		}
	}
};

OcTools.prototype.refresh = function( scope ) {
	var self = this;
	this.conf = this.readConf(this.store);
	if (this.conf != null && this.conf.tokens ) {
		this.currentRequests = 0;
		this.totalRequests = ( Object.keys(this.conf.tokens).length * 2 );
		for ( var t in this.conf.tokens ) {
			var token = this.conf.tokens[t];
			for ( var i in token ) {
				delete token[i];
			}
			request({ method: 'GET', headers: { 'X-Auth-Token': t, "Content-Type": "application/json" },
				url: accountsUrl }, function(error, response, body) {
					var u = response.request.getHeader('X-Auth-Token');
					if (!error && response.statusCode == 200) { 
						var body = JSON.parse(body);
						self.conf.tokens[u]['organizations'] = body.organizations;
						//console.log( response );
						//console.log( body );
					} else if (error) { 
						console.log('Error: ' + error); 
					}
					self.refreshEnd( u + "-org");
				});
			request({ method: 'GET', headers: { 'X-Auth-Token': t, "Content-Type": "application/json" },
				url: serversUrl }, function(error, response, body) {
					var u = response.request.getHeader('X-Auth-Token');
					if (!error && response.statusCode == 200) { 
						var body = JSON.parse(body);
						self.conf.tokens[u]['servers'] = body.servers;
						//console.log( body );
					} else if (error) { 
						console.log('Error: ' + error); 
					}
					self.refreshEnd( u + "-server");
				});
		}
	}
};

OcTools.prototype.refreshEnd = function( t ) {
	this.currentRequests++;
	console.log("Received " + t + " (" + this.currentRequests + "/" + this.totalRequests +")");
	if ( this.currentRequests == this.totalRequests ) {
		console.log("Write config at " + this.store);
		this.writeConf( this.conf, this.store);
		//console.log(JSON.stringify(this.conf,null,2));
	}
};

OcTools.prototype.addToken = function( token ) {
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

OcTools.prototype.removeToken = function( token ) {
	var conf = this.readConf(this.store);
	if (conf != null && conf.tokens[token]) {
		delete conf.tokens[token];
	}
	this.writeConf(conf, this.store);	
};

OcTools.prototype.tokens = function() {
	var conf = this.readConf(this.store);
	if (conf != null) {
		for ( var t in conf.tokens ) {
			console.log( t );
		}
	}
};

OcTools.prototype.writeConf = function(confObj, confPath) {
	var data = JSON.stringify(confObj,null,2);
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

// export the class
module.exports = OcTools;