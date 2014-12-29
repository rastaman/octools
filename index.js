#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

var program = require('commander');

program.version('1.0.0')
		.option(
				'-s, --store <store>',
				'use the specified store',
				(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.octools/store.json" )
		.option(
				'-v, --verbose',
				'verbose mode' );

var OcTools = require('./lib/octools.js');

var octools = new OcTools();

octools.store(program.store);
if (program.verbose) {
	console.log('Store is ' + octools.store);
}

program.command('tokens').description('list tokens').action(function() {
		octools.tokens();
	});

program.command('install <token>').description(
		'install one or more tokens in the store').action(function(token) {
			if ( program.verbose )
				console.log('install "%s"', token);
			octools.addToken( token );
	});

program.command('remove <token>').description(
		'remove one token from the store').action(function(token) {
			if ( program.verbose )
				console.log('remove "%s"', token);
			octools.removeToken( token );
	});

program.command('refresh').description(
			'refresh org and servers for all the tokens)').action(function() {
			if ( program.verbose )
				console.log('refresh');
			octools.refresh();
	});

program.command('generate <scope> <type>').description(
	'generate for the given scope ("all" or a name) and type ("ansible" or "dns")').action(function(scope,type) {
		if ( program.verbose )
			console.log('generate "%s" "%s"', scope,type);
		octools.generate(scope,type);
	});

program.command('get <scope> [type]').description(
			'get the infos for the given scope ("all" or a name) and type ("org" or "server")').action(
			function(scope,type) {
				if ( program.verbose )
					console.log('get "%s"%s',scope, ( type != null ? " of type " + type : ""));
				octools.get(scope,type);
			});

program.command('dump <resource> [scope]').description(
'dump full information for the given resource for all or the specified token)').action(function( resource, scope ) {
	if ( program.verbose )
		console.log('dump %s', resource);
	octools.dump( resource, scope );
});

program.parse(process.argv);
