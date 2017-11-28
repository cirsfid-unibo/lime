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

/**
 * This class provides a set of useful variables, constants and functions.
 * It is a sort of generic repository for stuff that still have to be classified
 * but that is extremely useful in the development process.
 */
Ext.define('LIME.Utilities', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'Utilities',

    /**
     * @property {String} buttonFieldDefault
     */
    buttonFieldDefault : 'behavior',

    /**
     * @property {String} buttonIdSeparator
     * Needed to separate the id of a marked element from the id of the button
     * that was used to mark it.
     */
    buttonIdSeparator : '-',

    /**
     * @property {Object} wrapperClassPatterns
     * A small set of helper functions that retrieve
     * the name of the pattern and the name of the element from a given configuration object
     */
    wrapperClassPatterns : {
        patternName : function(config) {
            return (config.patternName);
        },
        elementName : function(config) {
            return (config.elName);
        }
    },

    /**
     * This function returns type of an object
     * @param {Object} obj The object
     * return {String} The type of the object
     */
    toType : function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },

    /**
     * This function merges two json objects passed as arguments.
     * Greater priority is given to the second object
     * @param {Object} object1 The first object
     * @param {Object} object2 The second object
     * @param {Function} callBefore
     * A function that can be called before merging the objects
     * (a clone of the first object and a reference to the second object are given as arguments)
     * @returns {Object} The merged json object
     */
    mergeJson : function(object1, object2, callBefore) {
        if (!object1)
            return object2;
        if (!object2)
            return object1;
        var objectResult = Ext.clone(object1);
        if (callBefore) {
            var res = callBefore(objectResult, object2);
            objectResult = res.obj1;
            object2 = res.obj2;
        }
        if (Ext.isObject(object2)) {
            for (var i in object2) {
                if (objectResult[i]) {
                    objectResult[i] = this.mergeJson(objectResult[i], object2[i], callBefore);
                } else {
                    objectResult[i] = object2[i];
                }
            }

        } else
            objectResult = object2;
        return objectResult;
    },

    beforeMerge: function(obj1, obj2) {
            if (Ext.isObject(obj2) && !Ext.isObject(obj1)) {
                var tmp = obj1;
                obj1 = {};
                obj1["this"] = tmp;
            }
            return {
                obj1 : obj1,
                obj2 : obj2
            };
    },

    /**
     * This function convert a css string to a json object
     * @param {String} css The css string made of property-value pairs
     * @returns {Object} The css object
     */
    cssToJson : function(css) {
        var styleObj = {};
        if (css && css != "") {
            var styles = css.split(";");
            for (var i in styles) {
                var style = styles[i];
                if (style != "") {
                    var separator = style.indexOf(":");
                    var name = Ext.String.trim(style.substring(0, separator));
                    var value = Ext.String.trim(style.substring(separator + 1));
                    /*if(callback){
                     callback(args,name,value);
                     }*/

                    styleObj[name] = value;
                }
            }
        }
        return styleObj;
    },

    /**
     * This function convert a style object to a css string
     * @param {Object} styleJson The css object
     * @returns {String} The css string
     */
    jsonToCss : function(styleJson) {
        return Ext.encode(styleJson).replace(/}/g, '').replace(/{/g, '').replace(/"/g, '').replace(/,/g, ';');
    },

    /**
     * Change the editor's language.
     * The current implementation refreshes the whole DOM with
     * a different language code.
     * @param {String} languageCode The ISO code of the language (e.g. it, en, etc.).
     */
    changeLanguage : function(languageCode){
        // Keep the current parameters
        var params = Ext.Object.fromQueryString(window.location.search);

        // Replace language
        params.lang = languageCode;

        // Refresh
        window.location.search = Ext.Object.toQueryString(params);
    },

    globalIndexOf: function(substring, string) {
        var a=[],i=-1;
        while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
        return a;
    },

    removeNodeByQuery: function(root, query) {
        var node = root.querySelector(query);
        if(node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    },

    replaceChildByQuery: function(root, query, newChild) {
        var oldChild = root.querySelector(query);
        if (oldChild && oldChild.parentNode) {
            oldChild.parentNode.replaceChild(newChild, oldChild);
        }
        return oldChild;
    },

    createWidget: function(name, config) {
        var widget;
        try {
            widget = Ext.widget(name, config);
        } catch(e) {
            console.warn('Could not instantiate widget ', name, config);
            console.warn(e);
        }
        return widget;
    },

    pushOrValue: function(target, element) {
        var result = target;
        if(Ext.isArray(target)) {
            result.push(element);
        } else if (Ext.isEmpty(target)) {
            result = element;
        } else {
            result = [target];
            result.push(element);
        }
        return result;
    },

    getLastItem: function(array) {
        return array[array.length-1];
    },

    isValidDate: function(date) {
        return Ext.isDate(date) && !isNaN(date.getTime());
    },

    // Update date time calculating the time with timezone
    fixDateTime: function(date) {
        date.setTime(date.getTime() + date.getTimezoneOffset()*60*1000);
        return date;
    },

    // This function is ment to be overridden by some language package
    // Returns the ISO string of the date, removing the time
    normalizeDate: function (date) {
        if (!date) return '';
        return date.toISOString().substring(0, 10);
        return '';
    },

    detectMarkingLang: function(xmlString) {
        var name ;
        for(var i = 0; i < Config.languages.length; i++) {
            name = Config.languages[i].name;
            var config = Config.getLanguageConfig(name);
            if ( config && config.schemaRegex && xmlString.match(config.schemaRegex) ) {
                return name;
            }
        }
    },

    // Events related utilities
    events: {
        // Execute action once, when check returns true.
        // Polling every 100ms.
        delayUntil: function (check, action) {
            function fn () {
                if (check())
                    action();
                else
                    setTimeout(fn, 100);
            };
            fn();
        },

        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered. The function will be called after it stops being called for
        // N milliseconds. If `immediate` is passed, trigger the function on the
        // leading edge, instead of the trailing.
        debounce: function (func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    },

    // Debug utilities
    debug: {
        // Find difference between two strings
        diff: function (a, b, errorLength, backtrack) {
            errorLength = errorLength || 40;
            backtrack = backtrack || 5;
            a = a.replace(/\r?\n|\r/g, '¶');
            b = b.replace(/\r?\n|\r/g, '¶');
            if (a !== b) {
                var maxLength = Math.max(a.length, b.length);
                for (var i = 0; i < maxLength; i++)
                    if (a[i] !== b[i])
                        break;
                backtrack = Math.min(backtrack, i);
                var line = '';
                for (var j = i-backtrack; j < i+errorLength; j++)
                    line += a[j] === b[j] ? ' ': '×';
                console.log('Found difference');
                console.log(a.substr(i - backtrack, errorLength));
                console.log(b.substr(i - backtrack, errorLength));
                console.log(line);
            } else {
                console.log('No difference found');
            }
        }
    }
});
