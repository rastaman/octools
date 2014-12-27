#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

var program = require('commander');

program.version('1.0.0').option(
		'-s, --store [store]',
		'Use the specified store',
		(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE)
				+ "/.octools/store.json").option('-v, --verbose',
		'Verbose mode').parse(process.argv);


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
	console.log('install "%s"', token);
	octools.addToken( token );
});

program.command('refresh <scope>').description(
		'refresh org and servers of the given scope (all or a list of tokens)').action(function(scope) {
	console.log('refresh "%s"', scope);
	octools.refresh( scope );
});

program.command('generate <scope> <type>').description(
'generate ').action(function(scope,type) {
	console.log('generate "%s" "%s"', scope,type);
	octools.generate(scope,type);
});

program.command('search <query>').description(
		'search the tokens with optional query').action(function(query) {
	console.log('search "%s"', query);
});

program.command('get <scope> <type>').description(
		'get the infos for the given scope and type').action(
		function(scope, type) {
			console.log('Scope "%s", Type "%s"', scope, type);
		});

/*
 * program .command('teardown <dir> [otherDirs...]') .description('run teardown
 * commands') .action(function(dir, otherDirs) { console.log('dir "%s"', dir);
 * if (otherDirs) { otherDirs.forEach(function (oDir) { console.log('dir "%s"',
 * oDir); }); } });
 * 
 * program .command('*') .description('deploy the given env')
 * .action(function(env) { console.log('deploying "%s"', env); });
 */

/*
 * // Ceate a new express app
 * 
 * var app = express(); // Serve static files from the frontend folder
 * 
 * app.use('/', express.static(path.join(__dirname, 'frontend'))); // Serve
 * files from the current directory under the /files route
 * 
 * app.use('/files', express.static(process.cwd(), { index: false, setHeaders:
 * function(res, path){ // Set header to force files to download
 * 
 * res.setHeader('Content-Disposition', contentDisposition(path)) } })); // This
 * endpoint is requested by our frontend JS
 * 
 * app.get('/scan', function(req,res){ res.send(tree); }); // Everything is
 * setup. Listen on the port.
 * 
 * app.listen(port);
 */
program.parse(process.argv);
