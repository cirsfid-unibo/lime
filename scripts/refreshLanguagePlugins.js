// This script injects LIME's languagePlugins json config files to app.json
// Example: node refreshLanguagePlugins.js

import fs from 'fs-extra';
import path from 'path';
import walk from 'walk';

import appConfig from '../app.json';

import globalPatterns from '../config/Patterns.json';

//console.log(appConfig);
if (appConfig.env != 'production' || !appConfig.limeConfig) {
    console.error('Failed to detect LIME build in app.json!');
    console.error('Make sure you are running this script from LIME\'s build and not from sources.');
    process.exit(1);
}

if (!appConfig.limeConfig.language || !appConfig.limeConfig.language.name) {
    console.error('No language was found in app.json!');
    console.error('app.json seams to be damaged!');
    process.exit(1);
}

const languagesFolder = '../languagesPlugins';
const languageToInstall = appConfig.limeConfig.language.name;
const languageDir = path.resolve(path.join(__dirname, languagesFolder, languageToInstall));

if (!fs.existsSync(languageDir)) {
    console.error(`Language ${languageToInstall} was not found in ${languageDir} folder.`);
    console.error(`Copy the language to ${languageDir} and retry.`);
    process.exit(1);
}

compileLanguagePlugin(languageDir, (languageBundle) => {
    languageBundle['config/Patterns.json'] = globalPatterns;
    appConfig.limeConfig.language = languageBundle;
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
        const filePath = path.resolve(root, fileStat.name);
        const relativePath = path.relative(languageDir, root);
        // Ignore 'scripts' folder
        if (relativePath.split(path.sep)[0] === 'scripts') return next();
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

