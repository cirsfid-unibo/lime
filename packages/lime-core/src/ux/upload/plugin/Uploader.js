/**
 * @class Ext.ux.upload.plugin.Window
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.upload.plugin.Uploader', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.ux.upload.uploader',
            
    constructor: function(config)
    {
        var me = this;
        Ext.apply(me, config);
        me.callParent(arguments);
    },
    
    init: function(cmp)
    {
        var me = this,
            uploader = cmp.uploader;
        
        cmp.on({
            filesadded: {
                fn: function(uploader, files)
                {
                    uploader.start();
                    
                },
                scope: me
            },
            updateprogress: {
                fn: function(uploader, total, percent, sent, success, failed, queued, speed)
                {
                    var t = Ext.String.format('Upload {0}% ({1} von {2})', percent, sent, total);
                },
                scope: me
            },
            uploadcomplete: {
                fn: function(uploader, success, failed)
                {
                    var response;
                    if(success.length != 0) {
                        response = success[0];
                        if (cmp.mainUploader && cmp.finishEvent) {
                            cmp.mainUploader.fireEvent(cmp.finishEvent, response.content, response);
                        }
                    }
                },
                scope: me
            }
        });
        
    }
});
