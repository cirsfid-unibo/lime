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
 * This view implements a path viewer of the document.
 */
Ext.define('LIME.view.main.editor.Path', {
	extend: 'Ext.Panel',
	// set the alias
	alias : 'widget.mainEditorPath',
	id : "path",   
   	// set the layout type
    layout:'fit',
    
    width: '100%',
    frame: true,
    style:{borderRadius:"0px",margin:"0px", border:'0px'},
    separator:'<span style="padding:0 2 0 2"> > </span>',
    selectorsInitId: 'pathSelector_',
    elementLinkTemplate : '<a id="%id" class="pathSelectors" style="color:black;text;text-decoration:none;" href="javascript:;">%el</a>',
    elementTemplate : '<span>%el</span>',
    /**
     * This function builds a path from elements and set it to the view.
     * @param {Object[]} elements
     */
	setPath:function(elements){
		var new_html = "";
		var counter=0;
		for(var i = (elements.length-1);i>=0;i--){
			var elementName = elements[i].name;
			var elementId = this.selectorsInitId+counter;
			var info = DomUtils.getNodeExtraInfo(elements[i].node,"hcontainer");
			if(info)
				elementName+=" ("+info+")";
			if(elements[i].node){	
				new_html += this.elementLinkTemplate.replace("%el",elementName).replace("%id",elementId);
			}else{
				new_html += this.elementTemplate.replace("%el",elementName);
			}
			
			if(i!=0){
				new_html+= this.separator;
			}
			if(!this.elements) this.elements = {};
			this.elements[elementId] =  elements[i].node;
			counter++;
		}
		var pathView = this;
		this.update(this.initialPath+new_html,false,function(){pathView.fireEvent("update");});
	},
	initComponent: function(){
        this.initialPath = Locale.strings.mainEditorPath +': ';
        this.html = Locale.strings.mainEditorPath +': ';
        this.callParent(arguments);
    }
}); 
