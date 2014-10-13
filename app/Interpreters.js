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
 * This class has different interpreters uses in all application.
 */
Ext.define('LIME.Interpreters', {
	singleton : true,
	alternateClassName: 'Interpreters',
	
	/**
	 * @property {Object} flags
	 * This object contains flags that are used by interpreters 
	 */
	flags : {
		content : '&content;'
	},
	/**
	 * This function parses a pattern
	 * @param {String} elName the name of element
	 * @param {Object} patternConfig the raw pattern config
	 * @param {Object} buttonConfig button configuration
	 * @returns {Object} parsed pattern
	 */
	parsePattern : function(elName, patternConfig, buttonConfig) {
		/*Clone the pattern configuration*/
		var patternConfigClone = Ext.clone(patternConfig);
		var patternName = buttonConfig.pattern;
        
        if(!patternConfigClone) return buttonConfig;
        
		
		if (buttonConfig.remove) {
            for (var i in buttonConfig.remove) {
                var elementsToRemove = buttonConfig.remove[i];
                if (elementsToRemove.length > 0) {
                    Ext.each(elementsToRemove, function(elementToRemove) {
                        delete patternConfigClone[i][elementToRemove];
                    });
                } else {
                    delete patternConfigClone[i];
                }
            }
        }
        /*Return the result of the mergePattern function that returns a new pattern configuration*/
		var newPattern = this.mergePattern(patternConfigClone, buttonConfig);
		newPattern.wrapperClass = this.parseClass(newPattern.wrapperClass, elName, patternName);
		/*if (newPattern.remove) {
			for (var i in newPattern.remove) {
				var elementsToRemove = newPattern.remove[i];
				if (elementsToRemove.length > 0) {
					Ext.each(elementsToRemove, function(elementToRemove) {
						delete newPattern[i][elementToRemove];
					});
				} else {
					delete newPattern[i];
				}

			}

		}*/
		return newPattern;
	},
	/**
	 * This function applies the given rules to the marked element 
	 * it is used only before translation
	 * @param {HTMLElement} markedNode
	 */
	wrappingRulesHandlerOnTranslate : function(markedNode) {
		var me = this,
			elementId = markedNode.getAttribute(DomUtils.elementIdAttribute);
			button = (DocProperties.markedElements[elementId]) ? DocProperties.markedElements[elementId].button : null,
			rules = (button) ? button.waweConfig.pattern.wrapperRules : [],  /* TODO vedere dove mettere ste regole */
			prefix = (button) ? (button.waweConfig.rules[Utilities.buttonFieldDefault].attributePrefix || '') : '';
			
		var rulesReference = {
			/**
			 * Put this element on top of the hierarchy
			 */ 
			headingElement : function(rule, markedNode, buttonConfig) {
				if (rule.conditions["parentClassContains"]) {
					var extEl = new Ext.Element(markedNode),
						parent = extEl.parent('.'+rule.conditions["parentClassContains"]),
						contentElement = extEl.parent('.content'),
						contentChild = parent.down('.content');
					//If content elements are the same	
					if(parent && contentElement && contentChild && contentChild==contentElement){
						extEl.insertBefore(contentElement);
					//In this case the contentElement is outside parent and we can't insert extEl before it	
					}else if(parent && !contentChild){
						if(!me.headings){
							me.headings = {};
							me.headings.list = [];
							parent.insertFirst(extEl);
						}else{
							var lastHeading,
								downHeadings = parent.query(me.headings.cls);
							//Search the last direct child heading element, downHeadings contains all heading descendants 
							Ext.each(downHeadings,function(child){
								if(child.parentNode==parent.dom){
									lastHeading = child;
								}
							},this);
							if(!lastHeading){
								parent.insertFirst(extEl);
							}else{
								extEl.insertAfter(lastHeading);	
							}	
						}
						//Save the name and build a cls string of heading elements
						if(!Ext.Array.contains(me.headings.list, buttonConfig.name)){
							me.headings.list.push(buttonConfig.name);
							if(me.headings.list.length==1){
								me.headings.cls="."+buttonConfig.name;
							}else{
								me.headings.cls+=", ."+buttonConfig.name;
							}				
						}	
					}
				}
			},
			// Apply generic attributes
			applyAttributes : function(rule, markedNode) {
				if (!rule.values) {
					Ext.log({level: "error"}, "Couldn't apply the rule \"applyAttributes\". No values specified.");  
				}
				var attributes = rule.values;
				for (attribute in attributes) {
					var value = attributes[attribute];
					var key = button.waweConfig.rules[Utilities.buttonFieldDefault].attributePrefix+attribute;
					markedNode.setAttribute(key, value);
				}
			},
			// Add mod element
			addWrapperElement : function(rule, markedNode) {
				var config = Interpreters.getButtonConfig(rule.type),
					extWrapper = new Ext.Element(markedNode);
				if(rule.type && rule.type=='mod'){
						var modElement = extWrapper.parent(".mod"),
						idPrefix = config.rules[Utilities.buttonFieldDefault].attributePrefix || '',
						contentElement =  extWrapper.parent(".content");
					if(!modElement && contentElement){
						var parsedHtml = Interpreters.parseElement(config.pattern.wrapperElement, {
							content : ''
						});
						var newElement = Ext.DomHelper.insertHtml('beforeBegin',contentElement.dom,parsedHtml),
						extNewElement = new Ext.Element(newElement);
						while(contentElement.dom.firstChild){
							var removed  = contentElement.dom.removeChild(contentElement.dom.firstChild);
							newElement.appendChild(removed);
						}
						newElement.setAttribute('class', config.pattern.wrapperClass);
						//TODO: add the right id
						newElement.setAttribute(idPrefix + DomUtils.langElementIdAttribute, 'mod1');
						contentElement.appendChild(newElement);
					}
				}else if(rule.type && rule.type=='content'){
					var contentElement = extWrapper.child('.content'),
						hcontainerChild = extWrapper.child('.hcontainer');
					//Add the content element only if is needed
					if(!contentElement && !hcontainerChild){
						var parsedHtml = Interpreters.parseElement(config.pattern.wrapperElement, {
							content : ''
						}),
							tmpElement = Ext.DomHelper.createDom({
								tag : 'div',
								html : parsedHtml
							});
						if(tmpElement.firstChild){
						    me.contentCounter = (me.contentCounter) ? me.contentCounter+1 : 1;
							tmpElement.firstChild.setAttribute('class', config.pattern.wrapperClass);
							// This is commented because every language need to set the id in the translating process
							//tmpElement.firstChild.setAttribute(prefix+DomUtils.langElementIdAttribute, "cnt"+me.contentCounter);
							while(markedNode.hasChildNodes()){
								tmpElement.firstChild.appendChild(markedNode.firstChild);				
							}
							markedNode.appendChild(tmpElement.firstChild);	
						}
					}
				}
			}
		};
		// Apply the rules
		for (rule in rules) {
			var ruleReference = rulesReference[rule];
			if (ruleReference)
				ruleReference(rules[rule], markedNode, button.waweConfig);
		}
	},
	/**
	 * Return the custom configuration of a button taken from the
	 * language plugin currently in use.
	 * @param {String} name The name of the button
	 * @returns {Object} The configuration of the button
	 */
	getButtonConfig : function(name) {
		//Get plugin configuration from store
		var pluginData = Ext.getStore('LanguagesPlugin').getDataObjects(),
		//  If the button doesn't exist there must be some error in the configuration
		button = pluginData.markupMenu[name],
		// Get global patterns from store
		patterns = pluginData.patterns, rules = pluginData.markupMenuRules,
		// Get the element's rule
		rule = rules.elements[name] || {},
		// Dinamically add the translated text
		label = (button.label) ? button.label : name, widget = null, pattern = null, config = null;

		// If specific configuration is not defined, get the default one
		if (!rule[Utilities.buttonFieldDefault]) {
			rule[Utilities.buttonFieldDefault] = rules.defaults;
		}
		//  Get the element's widget
		widget = (rule) ? Interpreters.parseWidget(rule) : null;
		
		if(widget) {
            DocProperties.setElementWidget(name, widget);
        }
		
		
		pattern = Interpreters.parsePattern(name, patterns[button.pattern], button);
		//Create the configuration object
		config = {
			markupConfig : button,
			pattern : pattern,
			rules : rule,
			name : name,
			label : label
		};
		return config;
	},

	/**
	 * This function merges buttonConfig with patternConfig with buttonConfig priority
	 * @param {Object} patternConfig
	 * @param {Object} buttonConfig
	 * @returns {Object} The merged pattern
	 */
	mergePattern : function(patternConfig, buttonConfig) {
		/*Make styles objects that are merges of specific button style and pattern style transformed in json objects*/
		var buttonStyleObj = Utilities.mergeJson(Utilities.cssToJson(patternConfig.buttonStyle), Utilities.cssToJson(buttonConfig.buttonStyle));
		/*Transform merged style objects back to css string*/
		buttonConfig.buttonStyle = Utilities.jsonToCss(buttonStyleObj);
		if (!Ext.isObject(patternConfig.wrapperStyle)) {
			patternConfig.wrapperStyle = {
				"this" : patternConfig.wrapperStyle
			};
		}
		if (!Ext.isObject(buttonConfig.wrapperStyle)) {
			buttonConfig.wrapperStyle = {
				"this" : buttonConfig.wrapperStyle
			};
		}
		var wrapperStyleObj = {};
		var wrapperStyleCss = {};
		for (var i in buttonConfig.wrapperStyle) {
			var tmpStyle = buttonConfig.wrapperStyle[i];
			if (!Ext.isObject(tmpStyle)) {
				wrapperStyleObj[i] = Utilities.mergeJson(Utilities.cssToJson(patternConfig.wrapperStyle[i]), Utilities.cssToJson(tmpStyle));
				wrapperStyleCss[i] = Utilities.jsonToCss(wrapperStyleObj[i]);
			} else {
				wrapperStyleObj[i] = {};
				wrapperStyleCss[i] = {};
				for (var j in tmpStyle) {
					wrapperStyleObj[i][j] = {};
					wrapperStyleCss[i][j] = {};
					if (patternConfig.wrapperStyle[i] && patternConfig.wrapperStyle[i][j]) {
						wrapperStyleObj[i][j] = Utilities.mergeJson(Utilities.cssToJson(patternConfig.wrapperStyle[i][j]), Utilities.cssToJson(tmpStyle[j]));
					} else {
						wrapperStyleObj[i][j] = Utilities.cssToJson(tmpStyle[j]);
					}

					wrapperStyleCss[i][j] = Utilities.jsonToCss(wrapperStyleObj[i][j]);

				}
			}
		}

		buttonConfig.wrapperStyle = wrapperStyleCss;
		/*Save the style object*/
		patternConfig.styleObj = buttonStyleObj;
		patternConfig.wrapperStyleObj = wrapperStyleObj;
		/*Return a merged pattern*/
		return Utilities.mergeJson(patternConfig, buttonConfig);
	},

	/**
	 * This function returns a parsed element replacing the flags with
	 * the properties given. 
	 * @param {Object} patternConfig
	 * @param {Object} properties
	 * @returns {String}
	 */
	parseElement : function(patternConfig, properties) {
		var wrapperElement = patternConfig.wrapperElement;
		var finalHtml = patternConfig.replace(this.flags.content, properties.content);
		return finalHtml;
	},

	/**
	 * This function parse a class string like the following example:
	 * 
	 * 	"patternName elementName"
	 * 
	 * in a class string like this:
	 * 
	 * 	"container preface"
	 * 
	 * @param {String} cls Class to parse
	 * @param {String} elName Name of the element 
	 * @param {String} patternName Pattern name of the element
	 * @returns {String} the parsed class string
	 */
	parseClass : function(cls, elName, patternName) {
		var wrapperClass = cls;
		/*subdivide cls in words and for each of these*/
		Ext.each(cls.split(" "), function(patternClass) {
			var wrapperPatternFunction = Utilities.wrapperClassPatterns[patternClass];
			/*if is defined a function for this pattern class*/
			if (wrapperPatternFunction) {
				/*call this function*/
				var tmpWrapperClass = wrapperPatternFunction({
					patternName : patternName,
					elName : elName
				});
				/*replace new class with old*/
				wrapperClass = wrapperClass.replace(patternClass, tmpWrapperClass);
			}
		});
		return wrapperClass;
	},

	/**
	 * This function returns an widget configuration from an object called rule
	 * @param {Object} rule 
	 * @returns {Object} widget configuration
	 */
	parseWidget : function(rule) {
		var widgetsObject = rule.askFor,
		      globalAttributes = rule.attributes || {};
		
		if (!widgetsObject)
			return null;
		var widgetConfig = {
			list : []
		};
		var namePrefix = rule[Utilities.buttonFieldDefault].attributePrefix || "";
		var title = "";
		var how = Ext.Object.getSize(widgetsObject);
		for (var i in widgetsObject) {
			var widget = widgetsObject[i];
			/* Don't create many panels containing the fields but concatenate them in a unique panel */
			var tempWidget = {};
			tempWidget.xtype = (Statics.widgetTypePatterns[widget.type]) ? Statics.widgetTypePatterns[widget.type] : 'textfield';
			if(widget.type == "list") {
			    var store = Ext.create('Ext.data.Store', {
                    fields: ["type"],
                    data : widget.values.map(function(el) {return {"type": el};})
                });
                tempWidget.store = store;
                tempWidget.queryMode = 'local';
                tempWidget.displayField = 'type';
                tempWidget.valueField = 'type';
			}
			if (how > 1) {
				tempWidget.emptyText = widget.label;
				if (title != "")
					title += ", ";
				title += widget.label;
			} else {
				title = widget.label;
			}
			if (widget.insert && widget.insert.attribute) {
				tempWidget.name = namePrefix + widget.insert.attribute.name;
				tempWidget.origName = widget.insert.attribute.name;
				globalAttributes[tempWidget.origName] = {
				    tpl: "{"+tempWidget.origName+"}"
				};
			} else {
			    tempWidget.origName = i;
			    tempWidget.name = i;
			}
			//if (widget.insert.element){} /* Another possible case */
			widgetConfig.list.push(tempWidget);
		}
		for (i in globalAttributes) {
		    globalAttributes[i].name = namePrefix + i;
		}
		widgetConfig.title = title;
		widgetConfig.attributes = globalAttributes;
		return widgetConfig;
	}
});
