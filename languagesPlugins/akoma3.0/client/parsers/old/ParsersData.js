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

Ext.define('LIME.store.ParsersData', {
    extend : 'Ext.data.Store',
    
    model : 'LIME.model.Json',
    
    baseDirectory : "config/parsers",
    
    configFile : "config.json",

    /* File names */
    requiredFiles : [],

    /* Initially empty, loaded dinamically */
    dataObjects : {},
    
    separators : {"main":":","element":",","require":";"},
    
    /**
     * This function loads config files and search for other files to include
     */
    loadConfig : function() {
        var docLang = DocProperties.getLang(),
            dir = this.baseDirectory+'/'+docLang+'/',
            vocDir = dir+"vocabularies/";

        if(!docLang || this.dataObjects[docLang]){
            /*The configuration is loaded and there's nothing to do*/
            return;
        }   
        this.load({
            url : dir+this.configFile,
            scope : this,
            callback : function(records, operation, success) {
                if (success && (operation.response.responseText != "")) {
                    Ext.each(records[0].raw.vocabularies,function(file){
                        this.requiredFiles.push({'name':file,'path':vocDir+file+'.json'});                      
                    },this);
                    this.dataObjects[docLang] = {patternsOrder:[]};
                    Ext.each(records[0].raw.parsers,function(file){
                        this.requiredFiles.push({'type':'parser','name':file,'path':dir+file+'.json'});
                        this.dataObjects[docLang].patternsOrder.push(file);     
                    },this);
                    this.loadParsersData(docLang);
                }
            }
        });
    },

    /**
     * This function merges all the different parsers files
     * and stores a complete configuration in this store.
     */
    loadParsersData : function(lang) {
        var dataObj = this.dataObjects[lang];
        this.countLoaded = 0;
        this.addListener('parsersfilesloaded', this.buildParsersRules, this);
        Ext.each(this.requiredFiles,function(fileObj,index){
            dataObj.patterns = {};
            this.load({
                url : fileObj.path,
                scope : this,
                callback : function(records, operation, success) {
                    if (success && (operation.response.responseText != "")) {
                        var fileName = fileObj.name;
                        if(records[0].raw[fileName]){
                            dataObj[fileName] = records[0].raw;
                            dataObj[fileName]["values"] = dataObj[fileName][fileName]; 
                        }else if(fileObj.type && fileObj.type =='parser'){
                            dataObj.patterns[fileName] = records[0].raw;
                        }else{
                            dataObj[fileName] = records[0].raw;
                        }
                    }
                    if (++this.countLoaded == this.requiredFiles.length) {
                        /* Fire the event only if this is the last url to load */
                        this.fireEvent('parsersfilesloaded');
                    }
                }
            });
        },this);
    },
    /**
     * This function builds parsers rules from their configuration object.
     * The rules are RegExp strings not compiled RegExp objects.
     */
    buildParsersRules : function(){
        var data = this.getData();
        data.re = {};
        data.foundElements = {};
        Ext.each(data.patternsOrder,function(parser){
            var parserObj = data.patterns[parser],
                res="",
                groups = [];
            if (!parserObj) return;
            Ext.each(parserObj.patterns,function(pattern){
                var tmpObj = this.patternSolver(pattern,parserObj);
                res += "(?:"+tmpObj.re+")|";    
                Ext.Array.push(groups,tmpObj.groups);           
            }, this);
            data.re[parserObj.name] = {
                re:res.substr(0,res.length-1),
                groups:groups,
                requireToPass:[],
                test : function(str){
                    var re = new RegExp(data.re[parserObj.name].re, 'i');
                    return Parsers.testRe(re, str, data.re[parserObj.name]);
                }
            };
            Ext.Object.each(parserObj.utilities,function(name, pattern){        
                data.re[parserObj.name+Ext.String.capitalize(name)] = this.patternSolver(pattern,parserObj).re;
            },this);
            Ext.each(parserObj.requireToPass,function(patterns,index){
                var tmpArr = [];
                Ext.each(patterns,function(pattern){
                    tmpArr.push(this.patternSolver(pattern,parserObj));
                }, this);
                data.re[parserObj.name].requireToPass[index] = Ext.Array.push(data.re[parserObj.name].requireToPass[index],tmpArr);
            },this);
        },this);
        
        if(data["partitions"]){
            var markingPartitions = Ext.Array.filter(data["partitions"]["values"],function(a){return (a["marking"]);});
            var alternatives = [];
            markingPartitions = Ext.Array.map(markingPartitions,function(a,i,p){
                var name;
                if(a["marking"]=="capitalized"){
                    name = Ext.String.capitalize(a["name"]);
                    if(a["markingAlternative"]){
                        alternatives.push(Ext.String.capitalize(a["markingAlternative"]));
                    }
                }
                return name;
            },this);
            markingPartitions = Ext.Array.merge(markingPartitions, alternatives);
            data.re["markingPartitions"] = markingPartitions.join("|").replace(/\./g,"\\.").replace(/\s/g,"\\s").replace(/(\)|\()/g,"\\$1");
        }
    },
    /**
     * This recursive function solves pattern string and replaces 
     * keywords like this {{keyword}} with its definition.
     * The keyword definition could be in the same object,
     * in the "data.re" object or in a vocabolary.
     * All solved patterns are stored in the "data.re" object.
     * 
     * Example date pattern:
     * 
     *  "{{day}}\\s+{{months}}\\s+{{year}}"
     * 
     * The result will be:
     * 
     *  "(?:\\d{1,2})\\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\\s+(?:\\d{4}|'?\\d{2})"
     * 
     * @param {String} pattern RegExp string that can contain keywords, {{keyword}}
     * @param {Object} obj Configuration object pattern "parent"
     * @returns {String} RegExp string without keywords
     */
    
    patternSolver: function(pattern, obj) {
        var data = this.getData(),
            partRes = pattern,
            matchRe = new RegExp("{{([\\w:,;!]*)}}",'g'),
            matches = pattern.match(matchRe),
            groups = [];
        Ext.each(matches, function(match){
            var key = match.replace(matchRe,"$1");
            if(obj[key]){
                var tmpRe = this.patternSolver(obj[key],obj);
                partRes = partRes.replace(match,"("+tmpRe.re+")");
                data.re[key] = tmpRe;
                groups.push(key);
                Ext.Array.push(groups,tmpRe.groups);
            } else if (data.re[key]) {
                partRes = partRes.replace(match,"("+data.re[key].re+")");
                groups.push(key);
                Ext.Array.push(groups,data.re[key].groups);
            } else {
                vocRe = this.vocToRe(key);
                if(vocRe){
                    vocRe.re = "\\b(?:"+vocRe.re+")"; 
                    partRes = partRes.replace(match,"("+vocRe.re+")");
                    groups.push(vocRe.name);
                    //Save the re to the data object
                    data.re[vocRe.name] = {re:vocRe.re,groups:[],getter:vocRe.getter};
                }
            }
        }, this);
        return {re:partRes,groups:groups}; 
    },
    
    /**
     * This function serializes a vocabolary to RegExp string.
     * First check if the passed vocabolary exists.
     * A vocabolary may be a simple list of words or an complex object,
     * in the latter case the "voc" parameter must contain which properties
     * are interesting.
     * 
     * Example:
     * Suppose we have this vocabolary months.json:
     *  {
     *   "months":[
     *     {
     *      "name": "january",
     *      "abbr" : "jan",
     *      "value" : 1
     *     },
     *     {
     *      "name": "february",
     *      "abbr" : "feb",
     *      "value" : 2
     *     }
     *    ...
     *   ]  
     *  }
     * 
     * To serialize this the "voc" parameter can be:
     * 
     * "months:name"       -> the result will be: "january|february"
     * "months:name,abbr"  -> the result will be: "january|jan|february|feb"
     * 
     * @param {String} voc Name of vocabolary to serialize. Example: "months" or "months:name,value"
     * @returns {Object} name and vocabolary items joined with a "|" 
     */
    
    vocToRe: function(voc) {
        var data = this.getData(),
            result = "",
            sepIndex = voc.indexOf(this.separators.main),
            sepReqIndex = voc.indexOf(this.separators.require),
            vocName = voc,
            vocAttributes = "",
            vocAttRequire = "",
            getter;
        if(sepIndex!=-1){
            vocName = voc.substr(0,sepIndex);
            if(sepReqIndex!=-1){
                vocAttributes = voc.substring(sepIndex+1,sepReqIndex);      
                vocAttRequire = voc.substr(sepReqIndex+1);
            }else{
                vocAttributes = voc.substr(sepIndex+1);
            }
        }
        if(!data[vocName]){
            return;
        }
        if(vocAttributes){              
            var attributes = vocAttributes.split(this.separators.element);
            var elements = data[vocName]["values"];
            var cap = false;
            if(vocAttRequire){
                var requireAttributes = vocAttRequire.split(this.separators.element);
                elements = Ext.Array.filter(elements,function(a){
                    var success = true;
                    for(var i=0; i<requireAttributes.length;i++){
                        var att= requireAttributes[i];
                        if(att=="marking" && a[att]=="capitalized"){
                            cap = true;
                        }
                        if(att.indexOf("!")==-1){
                            if(!a[att]){
                                success = false;
                                break;
                            }
                        }else{
                            att = att.replace("!",Ext.emptyString);
                            if(a[att]){
                                success = false;
                                break;
                            }
                        }
                    }
                    return success;             
                });
            }
            /*Reverse sorting is just for putting the elements that contain 
                more that one word before elements that contain just a word*/ 
            result = Utilities.serializeObjArray(elements,attributes,{sort:true,reverse:true,capitalize:cap});
            //TODO: find the bug
            getter = function(value) {
                var list = data[vocName],
                    value = value.toLowerCase();
                for(var i=0; i<list.length; i++) {
                    var element = list[i];
                    for(var att=0; att<attributes.length; att++) {
                        var field = element[attributes[att]];
                        if(field){
                            if(Ext.isArray(field) && Ext.Array.contains(field,value)){
                                return element;
                            }else if(Ext.isString(field) && field.toLowerCase()==value){
                                return element;
                            }
                        }
                    }
                }
                return;
            };
        }else{
            result = data[vocName]["values"].join("|");
            getter = function(value){
                return(data[vocName]);
            };
        }
        result = result.replace(/\./g,"\\.").replace(/\s/g,"\\s").replace(/(\)|\()/g,"\\$1");
        return {name:vocName,re:result,getter:getter};
    },
    
    /**
     * This function returns the already retrieved data in a raw format.
     * NOTICE: This function DOES NOT check if the data is already available in the store!
     * @returns {Object}
     */
    getData : function() {
        return this.dataObjects[DocProperties.getLang()];
    }

}); 
