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
 * This class is the client side part for comunicate with server side parsers.
 * Contains also complete client side parsers.
 */

Ext.define('LIME.Parsers', {
	singleton : true,
	alternateClassName: 'Parsers',

	/**
	 * May be DEPRECATED!! the new is parseDatesAuto that is 10x faster
	 * This function marks all input parsed dates in the passed editor with the passed marker
	 * @param {Object} data An object with some Date objects as fields
	 * @param {Object} editor An istance of the editor controller
	 * @param {Object} app A reference to the whole application object (to fire global events)
	 */
	parseDates : function(data, editor, app) {
		var dates = data.response.dates,
			button = Ext.getCmp('date0');
		if (dates) {
			var indexSearched,
				config = {},
				editorContent = editor.getContent();
			for (var match in dates) {
				indexSearched = 0;
				var dateParsed = dates[match];
				var originalData = dateParsed.match;
				if (dateParsed.counter == 1) {
					var reg = new RegExp(originalData);
					editorContent = editorContent.replace(reg, this.getParsingTemplate(originalData,dateParsed.date));
					//editor.setContent(editorContent);
				} else {
					for (var i = 0; i < dateParsed.counter; i++) {
						var tmpIndex = editorContent.indexOf(originalData, indexSearched);
						var replacedData = this.getParsingTemplate(originalData,dateParsed.date);
						indexSearched = tmpIndex + replacedData.length;
						var firstPart = editorContent.substr(0, tmpIndex);
						var secondPart = editorContent.substr(tmpIndex + originalData.length);
						editorContent = firstPart + replacedData + secondPart;
					}
				}

				config[dateParsed.date] = {
					button : button,
					attribute : {
						name : 'date',
						value : dateParsed.date
					}
				};
			}
			editor.setContent(editorContent,{ no_events: true });
			this.searchMarkElements(config, editor, app);
		}
	},
	/**
	 * This function marks all input parsed dates in the passed editor with the passed marker
	 * @param {Object} data An object with some Date objects as fields
	 * @param {Object} editor An istance of the editor controller
	 * @param {Object} app A reference to the whole application object (to fire global events)
	 * @param {String} [avoidButtonName] the node will be marked if its parent doesn't have the avoidButtonName name
	 * @param {Object} [progress] Progress bar configuration start and end
	 */
	parseDatesAuto : function(data, editor, app, avoidButtonName, progress) {
		var dates = data.response.dates,
			button = Ext.getCmp('date0'),
			attributeName = button.waweConfig.rules.askFor.date1.insert.attribute.name;
		if (dates) {
			var indexSearched,
				config = {},
				editorContent = editor.getContent(),
				editorBody = editor.getBody(),
				nodesToMark = [], attributes = [];
			app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.searchingDates);
			Ext.Object.each(dates, function(dateParsed,objDate){
				var originalData = objDate.match;
				var textNodes = DomUtils.findTextNodes(originalData,editorBody);
				Ext.each(textNodes,function(tNode){
					if(!this.canPassNode(tNode,button.id,[DomUtils.tempParsingClass],avoidButtonName)){
						return;
					}
					this.textNodeToSpans(tNode, originalData, function(node){
						nodesToMark.push(node);
						attributes.push({name:attributeName,value:objDate.date});
					});				
				},this);
			},this);	
			if(nodesToMark.length>0){
			    app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.markingDates);
				app.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark, attributes:attributes});
			}
		}
	},
	
	/* This function parse all references in the editor content
	 * @param {Object} editor An istance of the editor controller
	 * @param {Object} app A reference to the whole application object (to fire global events)
	 * @param {Object} [progress] Progress bar configuration start and end
	 * */
	clientParseReferences : function(editor, app, progress){
		var data = app.getStore("ParsersData").getData(),
			parsers = this,
			editorContent,editorBody,button,configObj,possibleRefsRe,matchKnown,
			matchActs,matchNpoint,dateMatch,trimB,trimE,possibleRefs,
			refs = [], nodesToMark = [], filter, progressStatus = progress.start+0.1;
		if (!data) {
			return;
		}
		app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.searchingRefs);
		editorContent = editor.getContent();
		editorBody = editor.getBody();
		button = Ext.getCmp('ref0');
		try{
			configObj = data.re["ref"];
			possibleRefsRe = new RegExp(configObj.re,'ig');
			//These are test matches don't use the global 'g'
			matchKnown = new RegExp(data.re["knownActs"].re,'i');
			matchActs = new RegExp(data.re["typesOfActs"].re,'i');
			matchNpoint = new RegExp(data.re["nPoint"].re,'i');
			dateMatch = new RegExp(data.re["date"].re,'i');
			trimB = new RegExp(data.re["refTrimB"]);
			trimE = new RegExp(data.re["refTrimE"]);
		}catch(e){
			console.log("Error on loading regexp strings.");
			return button.waweConfig.name;
		}
		refs = this.matchRe(possibleRefsRe, editorContent, configObj,function(matchRef, index){
			if(index==0 && !DocProperties.getMarkedElement("docType0_1") && dateMatch.test(matchRef)){
				data.foundElements["docType"] = Ext.Array.push(data.foundElements["docType"],matchRef);
			}else if(parsers.isPartition(matchRef)){
				data.foundElements["article-num"] = Ext.Array.push(data.foundElements["article-num"],matchRef);
			}else{
				return true;
			}
			return false;
		});
		
		refs = Ext.Array.unique(refs).sort(function(a,b){return (b.length-a.length)});
		console.log("Refs: "+refs.length);
		Ext.each(refs, function(ref, index) {
			var matchStr = ref.replace(trimB,Ext.emptyString).replace(trimE,Ext.emptyString);
			var textNodes = DomUtils.findTextNodes(matchStr,editorBody);
			Ext.each(textNodes,function(tNode){		
				if(!this.canPassNode(tNode,button.id,[DomUtils.tempParsingClass])){
					return;
				}
				this.textNodeToSpans(tNode, matchStr, function(node){
					//Check if is an external reference TODO: define this in the file
					if(matchKnown.test(matchStr) || (matchActs.test(matchStr) && matchNpoint.test(matchStr))){
						node.setAttribute("style","font-weight:bold;");						
					}					
					nodesToMark.push(node);	
				});
			}, this);
		}, this);
		
		if (nodesToMark.length>0) {
		    app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.markingRefs);
			app.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark});
		}
		return button.waweConfig.name;
	},
	/* This function decides if a node can pass by parent class or id
	 * @param {HTMLElement} node
	 * @param {String} parentButtonId if this is equal to parent's button id the function returns false
	 * @param {String[]} [parentClasses] if parent has one of these classes the function returns false
	 * @returns boolean
	 */
	canPassNode : function(node,parentButtonId,parentClasses, parentButtonName){
		var parent = node.parentNode;
		if(parent){
			var parentId = parent.getAttribute(DomUtils.elementIdAttribute);
			if(DomUtils.getButtonIdByElementId(parentId) == parentButtonId){
				return false;
			}
			if(parentButtonName && parentId){
				var markedElement = DocProperties.getMarkedElement(parentId);
				if(markedElement && markedElement.button.waweConfig.name == parentButtonName)
					return false;
			}
			var classes = parent.getAttribute("class");
			if(classes && parentClasses){
				for(var i=0; i<parentClasses.length; i++){
					if(classes.indexOf(parentClasses[i])!=-1)
						return false;
				}
			}
		}
		return true;
	},
	
	/*
	 * This function returns true if the passed string is a partition, false otherwise
	 * @param {String} str
	 * @returns {Boolean}
	 * */
	isPartition : function(str){
		var data = Ext.getStore("ParsersData").getData(),
			matchMarkingPartition = new RegExp(data.re["markingPartitions"]),
			mRes = matchMarkingPartition.exec(str),
			index;
		//if str starts with the match partition return true
		return (mRes && (((index = str.indexOf(mRes[0]))==0) || Ext.String.trim(str.substr(0, index))==Ext.emptyString));
	},
	
	/*
	 * This function returns true if the passed string is a final formula, false otherwise
	 * @param {String} str
	 * @returns {Boolean}
	 * */
	isFinalFormula : function(str){
		var data = Ext.getStore("ParsersData").getData(),
			re = new RegExp(data.re["finalFormula"].re, 'i');
		return this.testRe(re, str, data.re["finalFormula"]);
	},
	
	/* IS USED ONLY IN DEBUG MODE because is not complete! 
	 * This function parse dates in the editor content
	 * @param {Object} editor An istance of the editor controller
	 * @param {Object} app A reference to the whole application object (to fire global events)
	 * */
	clientParseDocDates : function(editor,app){
		var editorContent = editor.getContent(),
			button = Ext.getCmp('date0'),
			attributes = [],
			attributeName = button.waweConfig.rules.askFor.date1.insert.attribute.name,
			dateType = "Y-m-d",
			reTypeAttributeName = "reType",
			tmpDateAttribute = "date";
			
		//var time1 = new Date().getTime();
		var months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre|setiembre","octubre","noviembre","diciembre"];
		var monthsRe = months.join("|");
		
		var reConfig = [
			{
				type : "d-m-Y",
				re : "(((\\d{1,2})\\s+de\\s+)?("+monthsRe+")\\s+de\\s+(\\d{4}))"
			},
			{
				type : "m-d-Y",
				re : "(("+monthsRe+")\\s+((\\d{1,2})\\s+de\\s+)de\\s+(\\d{4}))"
			},
			{
				type : "d-m-Y",
				re : "(((\\d{1,2})\\W?\\s+)?("+monthsRe+")\\W?\\s+(\\d{4}))"
			},
			{
				type : "m-d-Y",
				re : "(("+monthsRe+")\\W?\\s+((\\d{1,2})\\W?\\s+)?(\\d{4}))"
			},
			{
				type : "m-Y-d",
				re : "(("+monthsRe+")\\W?\\s+(\\d{4})((\\d{1,2})\\W?\\s+))"
			}
		];
		//var time1 = new Date().getTime();
		var newContent=editorContent,
			reObj = new RegExp();
		for(var i=0;i<reConfig.length;i++){
			reObj.compile(reConfig[i].re,"ig");
			console.log(reObj);
			newContent = newContent.replace(reObj,"<span class=\""+DomUtils.tempParsingClass+"\"  "+reTypeAttributeName+"=\""+reConfig[i].type+"\" "+tmpDateAttribute+"=\"$3-$4-$5\">$1</span>");
		}
		editor.setContent(newContent,{ no_events: true });
		var tmpParsingNodes = Ext.query("."+DomUtils.tempParsingClass,editor.getBody()),
			nodesToMark = [];
		
		
		Ext.each(tmpParsingNodes,function(node){	
			var parent = node.parentNode;
			if(parent){
				var classess = parent.getAttribute("class");
				if(classess && (classess.indexOf(DomUtils.tempParsingClass)!=-1 || DomUtils.getButtonIdByElementId(parent.getAttribute(DomUtils.elementIdAttribute)) == button.id)){
					while(node.firstChild){
						parent.appendChild(node.firstChild);
					}
					parent.removeChild(node);
					return;
				}
				var reType = node.getAttribute(reTypeAttributeName),
					date = node.getAttribute(tmpDateAttribute),
					newDate;
				if(date && reType){
					var datePart = reType.split("-"),
						dateRes = dateType;
					date = date.split("-");
					
					Ext.each(datePart,function(part,index){
						var subDate  = date[index];
						if(part=="m"){
							subDate = Utilities.arrayIndexOfContains(months,subDate)+1;
						}else if(part=='d' && !subDate){
							subDate = 1;
						}
						subDate = (subDate < 10) ? '0' + subDate : subDate;
						dateRes = dateRes.replace(part,subDate);
					});
					if(!Ext.Date.parse(dateRes, dateType,true)){
						dateRes='';
					}	
					node.removeAttribute(tmpDateAttribute);
					node.removeAttribute(reTypeAttributeName);
					nodesToMark.push(node);		
					attributes.push({name:attributeName,value:dateRes});
				}
			}
		},this);
		//var time2 = new Date().getTime();
		//console.log(tmpParsingNodes.length+" nodi: "+(time2-time1));
		if(nodesToMark.length>0){
			app.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark, attributes:attributes});
		}
	},
		
	
	/**
	 * First incomplete implementation of articles marking
	 * @param {Object} editor An istance of the editor controller
     * @param {Object} app A reference to the whole application object (to fire global events)
	 * */
	clientParseArticles : function(editor, app) {
		var data = app.getStore("ParsersData").getData(),
			editorContent, editorBody, button, numButton, configObj, matches=[],
			nodesToMark = [], numsToMark = [], dateMatch, locationsMatch, elButton;
		if (!data) {
			return;
		}
		editorContent = editor.getContent();
		editorBody = editor.getBody();
		button = Ext.getCmp('article0');
		numButton = button.getChildByName("num");
		function addNodes(node, onlyWrapper) {
            var newWrapper, elButton, markedParent,
                extNode = new Ext.Element(node); 
            markedParent = extNode.parent("."+button.getPattern(), true);
            elButton = DomUtils.getButtonByElement(markedParent);
            if (elButton && (elButton.id === button.id)) {
                if (!onlyWrapper) {   
                    numsToMark.push(node);
                }
            } else {
                newWrapper = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls: DomUtils.tempParsingClass
                });
                //TODO: improve this, parent.parent
                /* Insert the wrapper before the node's parentNode*/
                node.parentNode.parentNode.insertBefore(newWrapper,node.parentNode);
                newWrapper.appendChild(node.parentNode);
                nodesToMark.push(newWrapper);
                if (!onlyWrapper) {   
                    numsToMark.push(node);
                }
            }       
        }
		try {	
			configObj = data.re["article"];
			re = new RegExp(configObj.re,'g');
			dateMatch = new RegExp(data.re["date"].re,'i');
			locationsMatch = new RegExp(data.re["articleLocations"],'i');
		} catch(e) {
			console.log("Error on loading regexp strings."+e);
			return;
		}	
		//TODO: use matchReGroup 
		matches = this.matchRe(re, editorContent, configObj);
		matches = Ext.Array.unique(matches);
		Ext.each(matches, function(match,index) {
			var textNodes = DomUtils.findTextNodes(match,editorBody);
			Ext.each(textNodes, function(tNode) {
			    var extNode = new Ext.Element(tNode),
			        extParent = extNode.parent("."+DomUtils.tempParsingClass, true);  
			    if (extParent) { 
			        return;
			    } else {
			        extParent = extNode.parent("."+numButton.getButtonName(), true);
			        elButton = DomUtils.getButtonByElement(extParent);
			        if (elButton && (elButton.id === numButton.id)) { 
			           addNodes(extParent, true);
			           return; 
			        }
			    } 
				this.textNodeToSpans(tNode, match, addNodes);
			}, this);
		}, this);
		
		/* Improve this, look at sibling first */
		Ext.each(nodesToMark,function(node) {
			var sibling = node.nextSibling, extSib, child, content;
			while (sibling) {
			    extSib = new Ext.Element(sibling);
				elButton = DomUtils.getButtonByElement(sibling);
                /* If sibling is marked with the same button or it is temp element then stop the loop */
				if ((elButton && (elButton.id === button.id)) || (extSib.is('.'+DomUtils.tempParsingClass))) {
					break;
				}
			    content = extSib.getHTML();
				//TODO: a better way
				/* If the content of sibling contains a date and a location or a final formula then stop the loop */
				if ((dateMatch.test(content) && locationsMatch.test(content)) || data.re["finalFormula"].test(content)) {
					break;
				}
				node.appendChild(sibling);
				sibling = node.nextSibling;
			}
		}, this);
		
		if(numsToMark.length>0){
			console.log(numsToMark);		
			app.fireEvent('markingRequest', numButton, {silent:true, nodes:numsToMark});
		}
		if(nodesToMark.length>0){
			console.log(nodesToMark);		
			app.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark});
		}
	},
	
	
	/*
	* This function execute the passed regex with the massed string and 
	* apply requireToPass and/or passed filer to regex matches
	* @param {RegExp} re RegExp object to execute
	* @param {String} str
	* @param {Object} parserConfig Object that contains "re" and parser configuration
	* @param {Function} [filter] Function that takes arguments (matchedString, index) 
	* and returns boolean if false the matchedString will not be taken.
	* @returns {String[]} All matches that have passed the filters
	* */
	matchRe : function(re, str, parserConfig, filter) {
		var matches, results = [];
		matches = str.match(re) || [];
		console.log(matches);
		Ext.each(matches, function(matchStr,index) {
			if (this.reFilter(matchStr, parserConfig, filter, index)) {
				results.push(matchStr);
			}
		}, this);
		return results;
	},
	//TODO: complete this function
	matchReGroups : function(str, parserConfig, filter) {
        var matches, results = [];
        matches = Utilities.reGroupExec(parserConfig,"g",str);
        console.log(matches);
        Ext.each(matches, function(matchObj,index) {
            if (this.reFilter(matchObj.match, parserConfig, filter, index)) {
                results.push(matchObj);
            }
        }, this);
        return results;
    },
	/*
	 * This function apply test regex on the passed string and apply filters 
	 * 
	 * @param {RegExp} re RegExp object to execute
	 * @param {String} str
	 * @param {Object} parserConfig Object that contains "re" and parser configuration
	 * @param {Function} [filter] Function that takes arguments (matchedString, index) 
	 * and returns boolean if false the matchedString will not be taken.
	 * @returns {Boolean} True if the test and filters are passed
	 * */
	testRe : function(re,str,parserConfig, filter){
		//TODO:ensure that re is not global
		if(re.test(str) && this.reFilter(str, parserConfig, filter)){
			return true;
		}
		return false;
	},
	/*   
	 * This function apply the implicit object filters (requireToPass)
	 * and explicit passed filter function to the passed string
	 * 
	 * @param {String} str
	 * @param {Object} parserConfig Object that contains "re" and parser configuration
	 * @param {Function} [filter] Function that takes arguments (matchedString, index) 
	 * @param {Number} [index] 
	 * @returns {Boolean} True if all filters are passed
	 * */
	reFilter : function(str, parserConfig, filter, index){
		var canPass = 1;
		if(parserConfig.requireToPass){
			for(var or=0, orLength = parserConfig.requireToPass.length; or<orLength;or++){
				var success = 1;
				for(var and=0, andLength = parserConfig.requireToPass[or].length; and<andLength; and++){
					//This is a test match don't use the global 'g'
					//TODO: config case sensetive
					var rePass = new RegExp(parserConfig.requireToPass[or][and].re,'i');
					if(!rePass.test(str)){
						success = 0;
						break;
					}
				}
				if(success){
					canPass = 1;
					break;
				}else{
					canPass = 0;
				}
			}
		}
		if(((!parserConfig.requireToPass || !parserConfig.requireToPass.length) || canPass) 
				&& (!Ext.isFunction(filter) || filter(str, index))){
			return true;
		}
		return false;
	},
	
	/**
	 * This function searches and fires a marking event for all temp parsing elements 
	 * @param {Object} config 
	 * @param {Object} editor
	 * @param {Object} app
	 */
	searchMarkElements : function(config, editor, app, node) {
		console.log(config);
		var editorDom = editor.getDom();
		var tempElements = Ext.query("." + DomUtils.tempParsingClass, editorDom);
		Ext.each(tempElements, function(tempElement) {
			var classes = tempElement.getAttribute('class').split(" "),
				type_date = classes[classes.length-1],
				elConf = (type_date == DomUtils.tempParsingClass)? config : config[type_date];
			if(elConf){	
				if(elConf.mark=='parent'){
					var tempWrapper = new Ext.Element(tempElement),
						parent = tempWrapper.parent();
					tempWrapper.remove();
					editor.selectNode(parent.dom);
				}else{
					tempElement.removeAttribute("class");	
					editor.selectNode(tempElement);
				}
				app.fireEvent('markingMenuClicked', elConf.button,{silent:true, attribute:elConf.attribute});
			}
		});
	}
});
