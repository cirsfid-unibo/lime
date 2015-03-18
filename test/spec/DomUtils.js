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

});
