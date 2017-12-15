describe('Users', function() {

    it('User shouldn’t be null', function() {
        expect(User).not.toBeNull();
    });

    it('Server shouldn’t be null', function() {
        expect(Server).not.toBeNull();
    });

    describe('register', function() {
        it('should be a function', function() {
            expect(typeof Server.register).toEqual('function');
        });

        // TODO: remove users after registration
        // it('should register the "testunitN" user', function(done) {
        //     var user = "testunit" + Ext.Number.randomInt(1, 9999);
        //     controller.register(user + "@lime.com", "test", "Test Unit", function(data) {
        //         console.log(data);
        //         expect(data.success).toEqual("true");
        //         done();
        //     }, function(msg) {
        //         console.log(msg);
        //         // There was an error so fail the test
        //         expect(true).toBe(false);
        //         done();
        //     });
        // });

        it('shouldn’t register the existent user "demo"', function(done) {
            var data = {
                username: 'demo@lime.com',
                password: 'demo',
                preferences: {}
            }
            Server.register(data, function() {
                done.fail('Shouldn’t register existent user');
            }, function(error) {
                // 400 is the error code in case the user is already registered
                expect(error.status).toEqual(400);
                done();
            });
        });
    });

    describe('login', function() {
        it('should be a function', function() {
            expect(typeof Server.login).toEqual('function');
        });

        it('should login with success with "demo" user', function(done) {
            Server.login('demo@lime.com', 'demo', function(response) {
                var data = JSON.parse(response.responseText);
                expect(data.username).toEqual('demo@lime.com');
                done();
            }, function() {
                done.fail('Should login with demo user');
            });
        });

        it('shouldn’t login the inexistent user "notlimeuser"', function(done) {
            Server.login('notlimeuser@lime.com', 'demo', function() {
                done.fail('shouldn’t login with inexistent user');
            }, function(error) {
                expect(error.status).toEqual(401);
                done();
            });
        });
    });

});
