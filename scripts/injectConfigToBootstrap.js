// This script injects LIME's json config files to app bootstrap.json file
// Example babel-node injectConfigToBootstrap.js ../languagesPlugins/akoma3.0
import fs from 'fs';
import path from 'path';

if (process.argv.length < 3) {
    console.error('Missing language folder');
    process.exit(1);
}

import compileLanguagePlugin from './compileLanguagePlugin.js';
import bootstrap from '../bootstrap.json';
import config from '../config.json';
import globalPatterns from '../config/Patterns.json';

const languageDir = process.argv[2];

compileLanguagePlugin(languageDir, (languageBundle) => {
    languageBundle['config/Patterns.json'] = globalPatterns;
    config.language = languageBundle;
    bootstrap.limeConfig = config
    fs.writeFileSync(
        path.resolve(__dirname, '../bootstrap.json'),
        JSON.stringify(bootstrap)
    );
});


