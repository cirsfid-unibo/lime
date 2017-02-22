// This script builds a unique JSON file from a language plugin folder

import walk from 'walk';
import fs from 'fs';
import path from 'path';

const languageBundle = {};
export default (languageDir, cb) => {
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
            addFile(filePath, 'true');
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