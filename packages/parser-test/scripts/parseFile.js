var fs = require('fs');
var casper = require('casper').create({
                    waitTimeout: 60000
                });

if (casper.cli.args.length < 2) {
    console.log('Missing file url and output folder');
    process.exit(1);
}

var url = casper.cli.args[0];
var outputDir = casper.cli.args[1];
var debug = casper.cli.args[2];
var xml;

if (debug) {
    casper.on('remote.message', function(message) {
        this.echo(message);
    });
}

casper.start('http://localhost:8080/lime/build/production/LIME/?fileToParse='+url, function() {
    this.waitForSelector('div#aknResult');
});

casper.then(function () {
    xml = this.evaluate(function() {
        var textarea = document.querySelector('div#aknResult textarea');
        return textarea.value;
    });
});

casper.run(function () {
    var filename = getFileName(url)+'.akn.xml';
    var resultPath = fs.pathJoin(fs.workingDirectory, outputDir, filename);
    try {
        fs.write(resultPath, xml, 'w');
        console.log('File was written: '+ resultPath);
    } catch(err) {
        console.log('Error writting: '+ resultPath, err);
    }
    this.exit();
});


function getFileName(url) {
    var name = url.substring(url.lastIndexOf('/')+1);
    // remove extension
    return name.substring(0, name.lastIndexOf('.'));
};
