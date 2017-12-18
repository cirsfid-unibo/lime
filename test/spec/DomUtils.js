describe('LIME.DomUtils', function() {

    describe('parseFromString() method', function() {
        it('should be a function', function() {
            expect( typeof LIME.DomUtils.parseFromString).toEqual('function');
        });

        it('should return a DOM', function() {
            var stringToParse = "<div>pippo</div>", dom = LIME.DomUtils.parseFromString(stringToParse);
            expect(dom).not.toBeNull();
        });

        it('should return null in case of error', function() {
            var stringToParse = "<div><div>", dom = LIME.DomUtils.parseFromString(stringToParse);
            expect(dom).toBeNull();
        });
    });

    describe('moveChildrenNodes() method', function() {
        it('should be a function', function() {
            expect( typeof LIME.DomUtils.moveChildrenNodes).toEqual('function');
        });
        var nodeSource, nodeDest;

        var createNodes = function() {
            nodeSource = Ext.DomHelper.createDom({
                tag : 'div',
                children: [
                    {tag: 'li', id: 'item0'},
                    {tag: 'li', id: 'item1'},
                    {tag: 'li', id: 'item2'}
                ]
            });
            nodeDest = Ext.DomHelper.createDom({
                tag : 'div',
                children: [
                    {tag: 'li', id: 'item3'},
                    {tag: 'li', id: 'item4'}
                ]
            });
        }

        it('should move children removing existing ones', function() {
            createNodes();
            LIME.DomUtils.moveChildrenNodes(nodeSource, nodeDest);
            expect(nodeSource.childNodes.length).toEqual(0);
            expect(nodeDest.childNodes.length).toEqual(3);
            expect(nodeDest.childNodes[0].id).toEqual('item0');
            expect(nodeDest.childNodes[2].id).toEqual('item2');
        });

        it('should move children maintaining existing ones', function() {
            createNodes();
            LIME.DomUtils.moveChildrenNodes(nodeSource, nodeDest, true);
            expect(nodeSource.childNodes.length).toEqual(0);
            expect(nodeDest.childNodes.length).toEqual(5);
            expect(nodeDest.childNodes[0].id).toEqual('item3');
            expect(nodeDest.childNodes[4].id).toEqual('item2');
        });
    });

});
