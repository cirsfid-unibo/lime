'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _walk = require('walk');

var _walk2 = _interopRequireDefault(_walk);

var _app = require('../app.json');

var _app2 = _interopRequireDefault(_app);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _Patterns = require('../config/Patterns.json');

var _Patterns2 = _interopRequireDefault(_Patterns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This script injects LIME's json config files to app app.json file
// Example node injectConfigToApp.js ../languagesPlugins/akoma3.0

if (!_config2.default.languages || _config2.default.languages.length === 0) {
    console.error('No language was found in config.json!');
    console.error('Set at least one language in config.languages list.');
    process.exit(1);
}

var languagesFolder = '../languagesPlugins';
// By now the script installs only the first language
var languageToInstall = _config2.default.languages[0].name;
var languageDir = _path2.default.resolve(_path2.default.join(__dirname, languagesFolder, languageToInstall));

if (!languageToInstall || !_fsExtra2.default.existsSync(languageDir)) {
    console.error('Language ' + languageToInstall + ' was not found in ' + languageDir + ' folder.');
    console.error('Copy the language to ' + languageDir + ' and retry.');
    process.exit(1);
}

compileLanguagePlugin(languageDir, function (languageBundle) {
    languageBundle['config/Patterns.json'] = _Patterns2.default;
    _config2.default.language = languageBundle;

    // Save the original app.json
    _fsExtra2.default.copySync(_path2.default.resolve(__dirname, '../app.json'), _path2.default.resolve(__dirname, '../app.back.json'));

    _app2.default.limeConfig = _config2.default;
    // Overwrite the app.json file with the updated configuration
    _fsExtra2.default.writeFileSync(_path2.default.resolve(__dirname, '../app.json'), (0, _stringify2.default)(_app2.default));
});

var languageBundle = {};
// This function builds a unique JSON file from a language plugin folder
function compileLanguagePlugin(languageDir, cb) {
    var walker = _walk2.default.walk(languageDir, { followLinks: false });

    walker.on('file', function (root, fileStat, next) {
        var filePath = _path2.default.resolve(root, fileStat.name);
        var relativePath = _path2.default.relative(languageDir, root);
        // Ignore 'scripts' folder
        if (relativePath.split(_path2.default.sep)[0] === 'scripts') return next();
        if (filterJsonName(fileStat.name)) {
            if (fileStat.name === 'structure.json') {
                languageBundle.name = _path2.default.basename(root);
            }
            _fsExtra2.default.readFile(filePath, 'utf8', function (err, data) {
                addFile(filePath, JSON.parse(data));
                next();
            });
        } else {
            // Exlude hidden files
            if (!fileStat.name.startsWith('.')) {
                addFile(filePath, 'true');
            }
            next();
        }
    });
    walker.on('end', function () {
        cb(languageBundle);
    });
}

function addFile(filePath, data) {
    filePath = _path2.default.relative(_path2.default.resolve(__dirname, '../'), filePath).replace(/\\/g, '/');
    languageBundle[filePath] = data;
}

function filterJsonName(name) {
    return name.toLowerCase().endsWith('.json');
}
