const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const assert = chai.assert;
chai.use( chaiHttp );

// start the db...
const connection = require( '../lib/setup-mongoose' );

const app = require( '../lib/app' );

describe( 'auth', () => {

	// you can drop the whole database (instead of one collection):
	before( done => {
		const drop = () => connection.db.dropDatabase( done );
		if ( connection.readyState === 1 ) drop();
		else connection.on( 'open', drop );
	});

	// use this to drop one collection:
	// before( done => {
	// 	const CONNECTED = 1;
	// 	if (connection.readyState === CONNECTED) dropCollection();
	// 	else connection.on('open', dropCollection);

	// 	function dropCollection(){
	// 		const name = 'users';
	// 		connection.db
	// 			.listCollections({ name })
	// 			.next( (err, collinfo) => {
	// 				if (!collinfo) return done();
	// 				connection.db.dropCollection(name, done);
	// 			});
	// 	}
	// });

	const request = chai.request( app );

	describe( 'unauthorized', () => {

		it( '400 with no token', done => {
			request
				.get( '/api/pirates' )
				.then( res => done( 'status should not be 200' ) )
				.catch( res => {
					assert.equal( res.status, 400 );
					assert.equal( res.response.body.error, 'unauthorized, no token provided' );
					done();
				})
				.catch( done );
		});

		it( '403 with invalid token', done => {
			request
				.get( '/api/pirates' )
				.set( 'Authorization', 'Bearer badtoken' )
				.then( res => done( 'status should not be 200' ) )
				.catch( res => {
					assert.equal( res.status, 403 );
					assert.equal( res.response.body.error, 'unauthorized, invalid token' );
					done();
				})
				.catch( done );
		});

	});

	const user = {
		username: 'Monkey D Luffy',
		password: 'GumGum'
	};

	describe( 'user management', () => {

		function badRequest( url, send, error, done ) {
			request
				.post( url )
				.send( send )
				.then( res => done( 'status should not be 200' ) )
				.catch( res => {
					assert.equal( res.status, 400 );
					assert.equal( res.response.body.error, error );
					done();
				})
				.catch( done );
		}

		it( 'signup requires username', done => {
			badRequest( '/api/auth/signup', { password: 'abc' }, 'username and password must be supplied', done );
		})		
		
		it( 'signup requires password', done => {
			badRequest( '/api/auth/signup', { username: 'abc' }, 'username and password must be supplied', done );
		})

		let token = '';

		it( 'signup', done => {
			request
				.post( '/api/auth/signup' )
				.send( user )
				.then( res => assert.ok( token = res.body.token ) )
				.then( done, done );
		});

		it( 'can\'t use same username', done => {
			badRequest( '/api/auth/signup', user, 'username Monkey D Luffy already exists', done );
		});

		it( 'token is valid', done => {
			request
				.get( '/api/pirates' )
				.set('Authorization', `Bearer ${token}` )
				.then( res => assert.ok( res.body ) )
				.then( done, done );
		});

		it( 'signin', done => {
			request
				.post( '/api/auth/signin' )
				.send( user )
				.then( res => assert.equal( res.body.token, token ) )
				.then( done, done );
		});

	});

	
});