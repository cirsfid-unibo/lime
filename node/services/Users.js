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
    db = require('../utils/mongodb.js'),
    VError = require('verror');

var router = express.Router();

// Register a new user.
// POST /Users
// {
//    username: string   
//    password: string   
//    preferences: generic object  
// }
router.post('/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var preferences = req.body.preferences || {};
    preferences.folders = ['/' + req.body.username + '/'];

    if (!username) return error(res, 'Missing username parameter');
    if (!password) return error(res, 'Missing password parameter');

    db.users.updateOne({
        username: username
    }, {
        $setOnInsert: { 
            username: username,
            password: password,
            preferences: preferences,
        }
    }, { 
        upsert: true
    }, function (err, r) {
        if (err)
            next(new VError(err, 'Error registering user'));
        else if (r.upsertedCount == 0)
            error(res, 'User already exists');
        else
            res.send('User created').end();
    });
});

// Authentication middleware
router.param('user', function (req, res, next) {
    var password = (auth(req) || {}).pass;

    if (!req.params.user) return error(res, 'Missing username');
    if (!password) return error(res, 'Missing password');

    db.users.findOne({
        username: req.params.user
    }, function(err, user) {
        if (err)
            next(new VError(err, 'Error retriving user'));
        if (!user)
            return error(res, 'User does not exist');
        req.user = user;
        if (req.user.password != password)
            return error(res, 'Wrong password');
        next();
    });
});

// Get user informations.
// GET /Users/marco@gmail.com
// Basic access authentication required (Http Authorization header)
// -> { 
//    username: string   
//    password: string   
//    preferences: generic object  
// }
router.get('/:user', function (req, res, next) {
    res.json(req.user).end();
});

// Update user informations.
// PUT /Users/marco@gmail.com
// Basic access authentication required (Http Authorization header)
// {
//    password: string
//    preferences: generic object
// }
router.put('/:user', function (req, res, next) {
    db.users.updateOne({
        username: req.user.username
    }, {
        $set: {
            preferences: req.body.preferences || req.user.preferences,
            password: req.body.password || req.user.password,
        } 
    }, function (err, result) {
        if (err)
            next(new VError(err, 'Error updating user'));
        else
            res.send('Ok').end();
    });
});

function error(res, msg) {
    res.status(400).send(msg).end();
}

// User authentication middleware: parses Basic Auth headers and
// sets req.user to user object or Error.
exports.middleware = function (req, res, next) {
    var authInfo = auth(req);
    if (!authInfo) {
        req.user = new Error ('Missing authentication');
        next();
    } else {
        db.users.findOne({
            username: authInfo.name
        }, function(err, user) {
            if (err)
                next(new VError(err, 'Error searching for user'));
            else if (!user)
                req.user = new Error('User not found');
            else if (user && user.password != authInfo.pass)
                req.user = new Error('Wrong password');
            else 
                req.user = user;
            next();
        });
    }
}

exports.router = router;
