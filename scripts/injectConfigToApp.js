// This script injects LIME's json config files to app app.json file
// Example node injectConfigToApp.js ../languagesPlugins/akoma3.0

import fs from 'fs-extra';
import path from 'path';
import walk from 'walk';

import appConfig from '../app.json';
import config from '../config.json';
import globalPatterns from '../config/Patterns.json';

if (!config.languages || config.languages.length === 0) {
    console.error('No language was found in config.json!');
    console.error('Set at least one language in config.languages list.');
    process.exit(1);
}

const languagesFolder = '../languagesPlugins';
// By now the script installs only the first language
const languageToInstall = config.languages[0].name;
const languageDir = path.resolve(path.join(__dirname, languagesFolder, languageToInstall));

if (!languageToInstall || !fs.existsSync(languageDir)) {
    console.error(`Language ${languageToInstall} was not found in ${languageDir} folder.`);
    console.error(`Copy the language to ${languageDir} and retry.`);
    process.exit(1);
}

compileLanguagePlugin(languageDir, (languageBundle) => {
    languageBundle['config/Patterns.json'] = globalPatterns;
    config.language = languageBundle;

    // Save the original app.json
    fs.copySync(
        path.resolve(__dirname, '../app.json'),
        path.resolve(__dirname, '../app.back.json')
    );

    appConfig.limeConfig = config;
    // Overwrite the app.json file with the updated configuration
    fs.writeFileSync(
        path.resolve(__dirname, '../app.json'),
        JSON.stringify(appConfig)
    );
});

const languageBundle = {};
// This function builds a unique JSON file from a language plugin folder
function  compileLanguagePlugin(languageDir, cb) {
    const walker = walk.walk(languageDir, { followLinks: false });

    walker.on('file', function(root, fileStat, next) {
        let filePath = path.resolve(root, fileStat.name);
        if (filterJsonName(fileStat.name)) {
            if (fileStat.name === 'structure.json') {
                languageBundle.name = path.basename(root);
            }
            fs.readFile(filePath, 'utf8', (err, data) => {
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
    walker.on('end', function() {
        cb(languageBundle);
    });
}

function addFile(filePath, data) {
    filePath = path
                    .relative(path.resolve(__dirname, '../'), filePath)
                    .replace(/\\/g, '/');
    languageBundle[filePath] = data;
}

function filterJsonName(name) {
    return name.toLowerCase().endsWith('.json');
}

