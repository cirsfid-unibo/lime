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
	 * TODO
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
	 * @property {Object} ajaxUrls
	 * A set of urls needed to load some data dynamically.
	 */
	ajaxUrls : {
		// the base url of the ajax calls
		'baseUrl' : 'php/Services.php'
	},
	
	/**
	 * Return a well formed url that contains the given arguments
	 * properly encoded (to be set into the url).
	 * @param {Array} params The parameters to be set into the url
	 * @returns {String} The final url 
	 */
	getAjaxUrl : function(params) {
		// get the url for the requested service
		var requestedServiceUrl = this.ajaxUrls['baseUrl'] + '?';

		// itereate through the params
		for (param in params) {
			// create the request url
			requestedServiceUrl = requestedServiceUrl + param + '=' + encodeURI(params[param]) + '&';
		}

		// cut the last & character of the string
		requestedServiceUrl = requestedServiceUrl.substring(0, requestedServiceUrl.length - 1);
		//used for debug!!
		/*
        if(WaweDebug && window.location.href.indexOf('127.0.0.1') != -1 || window.location.href.indexOf('localhost') != -1){
        requestedServiceUrl = Statics.debugUrl+requestedServiceUrl;
        }
        */
		// return the url
		return requestedServiceUrl;
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
	 * This function converts a Date object to an ISO compliant string
	 * taking care about the problems related to GMT.
	 * @param {Date} d The Date object (see MDN by Mozilla)
	 * @returns {String} The stringified date
	 */
	toISOString : function(d) {
		function pad(n) {
			return n < 10 ? '0' + n : n
		}
		if(d.getFullYear){
			return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + 'Z'
		}
		return "";
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
	 * This function returns the index of array item if it contains the input string.
	 * Case insensitive search.
	 * @param {String[]} array
	 * @param {String} str
	 * @returns {Number} The index of array item or -1
	 */
	arrayIndexOfContains : function(array, str){
		str = str.toLowerCase();
		for(var i=0;i<array.length;i++){
			if(array[i].toLowerCase().indexOf(str)!=-1){
				return i;
			}
		}
		return -1;
	},
	
	
	/**
	 * This serialize an array of objects
	 * @param {Object[]} array
	 * @param {String[]} needEl Names of need elements to serialize
	 * @param {Object} [config] Configuration object 
	 * @returns {String}
	 */
	serializeObjArray : function(array, needEl, config){
		var res = [],
			str = "";
		Ext.each(array,function(obj){
			Ext.each(needEl,function(el){
				if(Ext.isString(obj[el])){
					res.push(obj[el]);
				}else if(Ext.isArray(obj[el])){
					Ext.each(obj[el],function(ch){
						res.push(ch);	
					});
				}
			},this);
		},this);
		if(config && config.sort){
			res = res.sort();
			if(config.reverse){
				res = res.reverse()
			}
		}
		Ext.each(res,function(element){
			if(config.capitalize){
				element = Ext.String.capitalize(element);
			}
			str+=element+"|"		
		},this);
		return str.substr(0,str.length-1);
	},
	
	reMatch : function(re,str,flags){
		var matches = [],
			match;
		if(Ext.isString(re)){
			re = new RegExp(re,flags);
		} 
		while(match = re.exec(str)){
			matches.push(match);
		}	
		return matches;		
	},
	
	reGroupExec : function(reObj, flags, str) {
		var res = [],
			matches = this.reMatch(reObj.re, str, flags);
		Ext.each(matches, function(match){
			var resObj = {}, group, groupMatch;
			resObj.match = match[0];
			resObj.groups = {};
			for (var i=1; i<match.length; i++) {
				group = reObj.groups[i - 1];
				groupMatch = match[i];
				if(groupMatch) {
					resObj.groups[group] = groupMatch;
				}
			}
			res.push(resObj);
		}, this);
		
		return res;
	},
	
	execRe : function(reObj, str){
		var matches = this.reMatch(reObj.re,str,'ig');
		
		Ext.each(matches,function(res){
			var resObj = {},
				count = 0;
			resObj.matches = {match:res[0]};
			resObj.matchGroups = res;
			
			for(var i=1; i<res.length; i++){
				var group = reObj.groups[i-1],
					match = res[i];
				if(match){
					resObj.matches[group] = {match:match};
				}
			}
		},this);
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
	
	
    /**
     * Convert a JSON into HTML DOM node.
     * Each element's name represents the class of a div.
     * Elements starting with @ represents attributes.
     */
    jsonToHtml : function(json){
        
        if (!json) return null;
        
        // Create the div for the current object
        var root = document.createElement('div'),
            current,
            currentDom;
            
        root.removeAttribute('class');
        
        for (var obj in json){
            current = json[obj];
            if (obj.indexOf('@') == 0){
                // Set attribute (if the value is null use the XML strict boolean value repeating the name of the attribute)
                //root.setAttribute(obj.substr(1), (!current)? obj.substr(1) : current);
                root.setAttribute(obj.substr(1), (!current)? "" : current);
            } else if(obj.charAt(0) != "!") {
                // Append new div and call the conversion on it
                if (current){
                    if (Ext.isString(current)){
                        var el = document.createElement('div');
                        el.innerHTML = current;
                        root.appendChild(el);
                        el.setAttribute('class', obj);
                    } else {
                        currentDom = root.appendChild(this.jsonToHtml(current));
                        currentDom.setAttribute('class', obj);
                    }
                }
            }
        }
        return root;
    },
    
    /**
     * Convert a JSON into XML FRBR DOM node.
     * Each element's name represents the class of a div.
     * Elements starting with @ represents attributes.
     */
    jsonToFrbr : function(json, noroot){
        
        if (!json) return null;
        
        // Create the div for the current object
        var root = document.createElement('meta'),
            current,
            currentDom,
            currentChild;
        
        for (var obj in json){
            current = json[obj];
            if (obj.indexOf('@') == 0){
                // Set attribute (if the value is null use the XML strict boolean value repeating the name of the attribute)
                root.setAttribute(obj.substr(1), (!current)? obj.substr(1) : current);
            } else {
                // Append new div and call the conversion on it
                if (current){
                    currentDom = root.appendChild(document.createElement(obj));
                    currentChild = currentDom.appendChild(this.jsonToFrbr(json[obj]), true);
                    if (noroot){
                        root = currentChild;
                    }
                }
            }
        }
        
        return root;
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
    
    filterUrls: function(reqUrls, content, success, failure, scope) {
        var params = {
            requestedService : Statics.services.filterUrls,
            urls : Ext.encode(reqUrls)
        };
        if(content) {
            params = Ext.merge(params, {content: true});
        }
        Ext.Ajax.request({
            // the url of the web service
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            params : params,
            scope : this,
            success : function(result, request) {
                var newUrls  = Ext.decode(result.responseText, true);
                if (Ext.isFunction(success) && newUrls) {
                    Ext.bind(success, scope)(newUrls);
                } else if(Ext.isFunction(failure)) {
                    Ext.bind(failure, scope)(reqUrls);
                }
            },
            failure: function() {
                if (Ext.isFunction(failure)) {
                    Ext.bind(failure, scope)(reqUrls);
                }
            }
        });
    }
});
