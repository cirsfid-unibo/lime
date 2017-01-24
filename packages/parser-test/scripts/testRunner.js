var fs = require('fs');
var glob = require('glob');
var path = require('path');
var execFile = require('child_process').execFile;
var eachSeries = require('async').eachSeries;

if (process.argv.length < 4) {
    console.log('Missing input and output folders.');
    process.exit(1);
}

var inputDir = process.argv[2];
var outputDir = process.argv[3];
var filesUrl = 'http://localhost:8080/files/';
var totalFiles = 0, doneFiles = 0;

var totalTime = process.hrtime();
glob(inputDir+'/**/*', function (er, files) {
    //files = files.slice(0, 10);

    files = files.map(normalizeFileName).filter(fileNotTransformed);
    totalFiles = files.length;
    console.log(totalFiles+' files to be tranformed found.');
    tranformFiles(files, function() {
        var totalTimeEnd = process.hrtime(totalTime);
        console.info('Transformed %d files in %ds', totalFiles, totalTimeEnd[0]);
    });

});

function fileNotTransformed(filePath) {
    var filename = getFileName(filePath)+'.akn.xml';
    var resultPath = path.join(__dirname, outputDir, filename);
    return !fs.existsSync(resultPath);
}

function getFileName(url) {
    var name = url.substring(url.lastIndexOf('/')+1);
    // remove extension
    return name.substring(0, name.lastIndexOf('.'));
};


function normalizeFileName(filePath) {
    var name = path.basename(filePath);
    // remove every special character
    var normalizedName = name.replace(/[^a-zA-Z0-9\.]/g, '_');
    var newFilePath = filePath.replace(name, normalizedName);
    fs.renameSync(filePath, newFilePath);
    return newFilePath;
}

function tranformFiles(files, cb) {
    eachSeries(files, transformFile, function(err) {
        if (err) {
            console.log('A fail failed to process');
        }
        return cb();
    });
}

function transformFile(file, cb) {
    var tranformTime = process.hrtime();
    var url =  filesUrl+path.basename(file);
    execFile(
        path.join(__dirname, '../node_modules/casperjs/bin/casperjs.exe'),
        ['parseFile.js', url, outputDir], {
            'disk-cache': 'yes'
        }, function(err, stdout, stderr) {
            var tranformTimeEnd = process.hrtime(tranformTime);
            if (err) {
                console.error('Error transform url:'+url, err);
                //return cb(true);
            }
            console.info('%d/%d (%ds) %s', ++doneFiles, totalFiles, tranformTimeEnd[0], stdout);
            if (stderr)
                console.error(stderr);
            cb();
        }
    );
}
