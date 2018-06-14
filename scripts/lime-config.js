var commander = require('commander');
var colors = require('colors');
var fs = require('fs');
var path = require('path');


var configFile = path.join(__dirname, '../app.json');
var appConfig = getAppConfig();
checkLimeBuild();

commander
	.command('get <config>')
	.action(get);

commander
	.command('set <config>')
	.action(set);

commander.parse(process.argv);

function checkLimeBuild() {
	var isBuild = appConfig && appConfig.hasOwnProperty('buildDatetime') &&
			!isNaN(new Date(appConfig.buildDatetime).getTime());
	if (!isBuild)
		return console.error(make_red('Fatal error: LIME build not detected, make sure you are in a build version of LIME.'));
}

function getLimeConfig() {
	var hasConfig = appConfig && appConfig.hasOwnProperty('limeConfig');
	if (!hasConfig)
		return console.error(make_red('Fatal error: LIME config not found, make sure you are in a build version of LIME.'));
	return appConfig['limeConfig'];
}

function getAppConfig() {
	if (fs.existsSync(configFile)) {
		return require(configFile);
	}
	return console.error(make_red('Fatal error: '+configFile+ ' file not found.'));
}

function get(property) {
	var limeConfig = getConfigProperty(getLimeConfig(), property);
	if (!limeConfig)
		return console.error(make_red('"'+property+ '" not found in config.'));
	if (limeConfig instanceof Object) {
		console.log(JSON.stringify(limeConfig, null, 4));
	} else {
		console.log(limeConfig);
	}
}

function set(property) {
	getLimeConfig();
}

function getConfigProperty(limeConfig, property) {
	var fields = property.split('.');
	var config = fields.reduce(function(prev, curr) {
		return prev[curr];
	}, limeConfig);
	return config;
}

if (!process.argv.slice(2).length) {
	commander.outputHelp(make_red);
}

function make_red(txt) {
	return colors.red(txt); //display the help text in red on the console
}