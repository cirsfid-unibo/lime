describe('LIME.controller.LoginManager', function() {
    var controller;

    beforeEach(function() {
        controller = window.LIMETestApp.getController("LoginManager");
        return controller;
    });

    it('controller shouldn’t be nul', function() {
        expect(controller).not.toBeNull();
    });

    describe('register() method', function() {
        it('should be a function', function() {
            expect( typeof controller.register).toEqual('function');
        });

        it('should register the "testunitN" user', function(done) {
            var user = "testunit" + Ext.Number.randomInt(1, 9999);
            controller.register(user + "@lime.com", "test", "Test Unit", function(data) {
                console.log(data);
                expect(data.success).toEqual("true");
                done();
            }, function(msg) {
                console.log(msg);
                // There was an error so fail the test
                expect(true).toBe(false);
                done();
            });
        });

        it('shouldn’t register the existent user "demo"', function(done) {
            controller.register("demo@lime.com", "demo", "Demo User", function(data) {
                console.log(data);
                expect(true).toBe(false);
                done();
            }, function(msg) {
                console.log(msg);
                // If msg is a string there is an error so fail the test
                if (Ext.isString(msg)) {
                    expect(true).toBe(false);
                } else {
                    expect(msg.success).toEqual("false");
                }
                done();
            });
        });
    });

    describe('login() method', function() {
        it('should be a function', function() {
            expect( typeof controller.login).toEqual('function');
        });

        it('should login with success with "demo" user', function(done) {
            controller.login("demo@lime.com", "demo", function(data) {
                console.log(data);
                expect(data.success).toEqual("true");
                done();
            }, function(msg) {
                console.log(msg);
                // There was an error so fail the test
                expect(true).toBe(false);
                done();
            });
        });

        it('shouldn’t login the inexistent user "notlimeuser"', function(done) {
            controller.login("notlimeuser@lime.com", "demo", function(data) {
                console.log(data);
                expect(true).toBe(false);
                done();
            }, function(msg) {
                console.log(msg);
                // If msg is a string there is an error so fail the test
                if (Ext.isString(msg)) {
                    expect(true).toBe(false);
                } else {
                    expect(msg.success).toEqual("false");
                }
                done();
            });
        });
    });

    describe('logout() method', function() {

    });

});
