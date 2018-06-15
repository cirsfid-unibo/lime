var commander = require('commander');
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var prompt = require('inquirer').prompt;


var configFile = path.join(__dirname, '../app.json');
var appConfig = getAppConfig();
checkLimeBuild();

commander
	.command('get <property>')
	.action(get);

commander
	.command('set <property> <value>')
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

function set(property, value) {
	var fields = property.split('.');
	var limeConfig = getLimeConfig();
	var field = fields.pop();
	var config = fields.reduce(function(prev, curr) {
		return prev[curr];
	}, limeConfig);
	setRaw(config, field, value, function(updated) {
		if(updated) {
			writeToFile();
		}
	});
}

function setRaw(obj, property, value, cb) {
	if (obj[property] && obj[property] instanceof Object) {
		console.error(make_red('Property "'+property+ '" is an object you cannot set it.'));
		return cb(false);
	}
	var update = function(res) {
		if (res) {
			obj[property] = value;
		}
		cb(res);
	};
	if (obj[property]) {
		askConfirm('Are you sure you want to replace the value of "'+
						property+'" from: \n"'+obj[property]+'" \nto\n"'+value+'"',
					update);
	} else {
		update(true);
	}
}

function askConfirm(msg, cb) {
	prompt([{
		type : 'confirm',
		name : 'response',
		message : make_orange(msg)
	}]).then(function(ans) {
		cb(ans.response);
	});
}

function writeToFile() {
	fs.writeFile(configFile, JSON.stringify(appConfig), function(err) {
		if (err) return console.error(make_red(err));
		console.log(make_green('LIME configuration was successfully updated.'))
	});
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
	return colors.red(txt);
}

function make_orange(txt) {
	return colors.yellow(txt);
}

function make_green(txt) {
	return colors.green(txt);
}