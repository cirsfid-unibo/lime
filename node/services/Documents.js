/*
 * Copyright (c) 2014 - Copyright holders CIRSFID and Department of
 * Computer Science and Engineering of the University of Bologna
 * 
 * Authors: 
 * Monica Palmirani – CIRSFID of the University of Bologna
 * Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
 * Luca Cervone – CIRSFID of the University of Bologna
 * 
 * Permission is hereby granted to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The Software can be used by anyone for purposes without commercial gain,
 * including scientific, individual, and charity purposes. If it is used
 * for purposes having commercial gains, an agreement with the copyright
 * holders is required. The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the
 * Software.
 * 
 * Except as contained in this notice, the name(s) of the above copyright
 * holders and authors shall not be used in advertising or otherwise to
 * promote the sale, use or other dealings in this Software without prior
 * written authorization.
 * 
 * The end-user documentation included with the redistribution, if any,
 * must include the following acknowledgment: "This product includes
 * software developed by University of Bologna (CIRSFID and Department of
 * Computer Science and Engineering) and its authors (Monica Palmirani, 
 * Fabio Vitali, Luca Cervone)", in the same place and form as other
 * third-party acknowledgments. Alternatively, this acknowledgment may
 * appear in the software itself, in the same form and location as other
 * such third-party acknowledgments.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var express = require('express'),
    auth = require('basic-auth'),
    VError = require('verror'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

var db = require('../utils/mongodb.js'),
    documentsPath = require('../config.json').filesystem.documents,
    Users = require('./Users.js');


var router = express.Router();

router.use(Users.middleware);

// Parse path and file parameters.
router.use(function (req, res, next) {
    if (req.path[req.path.length-1] == ('/')) {
        var dir = req.path;        
        console.log('DIR', req.method, dir);
    } else {
        var dir = path.dirname(req.path);
        req.file = path.basename(req.path);
        req.filePath = path.join(documentsPath, dir, req.file);
        console.log('FILE', req.method, dir, req.file);
    }
    req.dirPath = path.join(documentsPath, dir);
    next();
});

// Check permissions
router.use(function (req, res, next) {
    if (!isAllowed(req.user, req.path))
        return res.status(401).end();
    else next();
});

function isAllowed(user, path) {
    if (!user) return false;
    if (user instanceof Error) return false;
    var allowedPaths = user.preferences.folders || [];
    return allowedPaths.filter(function (allowedPath) {
        return path.indexOf(allowedPath) == 0;
    }).length > 0;
}

// Get file
// Es. GET /Documents/pippo@gmail.com/examples/it/doc/file.akn
router.get('*', function (req, res, next) {
    if (!req.file) return next();

    var fileStream = fs.createReadStream(req.filePath);
    fileStream.on('open', function () {
        fileStream.pipe(res);
    });
    fileStream.on('error', function(err) {
        if (err.code == 'ENOENT' || err.code == 'EISDIR')
            res.status(404).end();
        else
            next(new VError(err, 'Error opening file'));
    });
});

// List directory
// Es. GET /Documents/pippo@gmail.com/examples/it/doc/
router.get('*', function (req, res, next) {
    fs.readdir(req.dirPath, function (err, files) {
        if (err && err.code == 'ENOENT')
            res.json([]).end();
        else if (err)
            next(new VError(err, 'Error reading directory'));
        else
            res.json(files.map(function(file) {
                return req.path + file;
            })).end();
    });
});

// Update/create a file
// Es. PUT /Documents/pippo@gmail.com/examples/it/doc/file.akn
router.put('*', function (req, res, next) {
    mkdirp(req.dirPath, function (err) {
        if (err) next(new VError(err, 'Error creating directory'));

        var fileStream = fs.createWriteStream(req.filePath);
        req.pipe(fileStream);
        req.on('end', function () {
            // Todo: add content-type header
            res.end();
        });
        fileStream.on('error', function(err) {
            next(new VError(err, 'Error saving file'));
        });
    });
});

exports.router = router;
