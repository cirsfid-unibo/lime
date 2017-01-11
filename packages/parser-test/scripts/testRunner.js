var fs = require('fs');
var glob = require('glob');
var path = require('path');
var execFile = require('child_process').execFile;

if (process.argv.length < 3) {
    console.log('Missing input folder');
    process.exit(1);
}

var inputDir = process.argv[2];
var filesUrl = 'http://localhost:8080/files/';
var totalFiles = 0, doneFiles = 0;
console.time('totalTime');
glob(inputDir+'/**/*', function (er, files) {
    totalFiles = files.length;
    console.log(totalFiles+' files found.');
    files.forEach(function(file) {
        var url =  filesUrl+path.basename(file);
        transformFile(url);
    });
    console.timeEnd('totalTime');
});

function transformFile(url) {
    console.time('tranformTime');
    execFile(
        path.join(__dirname, '../node_modules/casperjs/bin/casperjs.exe'),
        ['parseFile.js', url], {
            'disk-cache': 'yes'
        }, function(err, stdout, stderr) {
            if (err) {
                console.error('Error transform url:'+url, err);
            }
            console.timeEnd('tranformTime');
            console.log(++doneFiles + '/'+totalFiles+' '+stdout);
            if (stderr)
                console.error(stderr);
        }
    );
}
