const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const assert = chai.assert;
chai.use( chaiHttp );

// start the db, and store connection, 
// so we can clear db
const connection = require( '../lib/setup-mongoose' );

const app = require( '../lib/app' );

describe( 'pirate', () => {

	before( done => {
		const drop = () => connection.db.dropDatabase( done );
		if ( connection.readyState === 1 ) drop();
		else connection.on( 'open', drop );
	});

	const request = chai.request( app );
	let token = '';

	before(done => {
		request
			.post('/api/auth/signup')
			.send({ username: 'testuser', password: 'abc' })
			.then(res => assert.ok(token = res.body.token))
			.then(done, done);
	})


	let luffy = {
		name: 'Monkey D Luffy',
		rank: 'captain'
	};

	it( '/GET all', done => {
		request
			.get( '/api/pirates' )
			.set('Authorization', `Bearer ${token}`)
			.then( res => {
				assert.deepEqual( res.body, [] );
				done();
			})
			.catch( done );
	});

	it( '/POST', done => {
		request
			.post( '/api/pirates' )
			.set('Authorization', `Bearer ${token}`)
			.send( luffy )
			.then( res => {
				const pirate = res.body;
				assert.ok( pirate._id );
				luffy = pirate;
				done();
			})
			.catch( done );

	});

	it( '/GET by id', done => {
		request
			.get( `/api/pirates/${luffy._id}` )
			.set('Authorization', `Bearer ${token}`)
			.then( res => {
				const pirate = res.body;
				assert.deepEqual( pirate, luffy );
				done()
			})
			.catch( done );
	});

	it( '/GET all after post', done => {
		request
			.get( '/api/pirates' )
			.set('Authorization', `Bearer ${token}`)
			.then( res => {
				assert.equal(res.body.length, 1);
				assert.equal(res.body[0]._id, luffy._id );
				done();
			})
			.catch( done );
	});

	it( 'add a non-captain pirate', done => {
		request
			.post( '/api/pirates' )
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'zoro', rank: 'swordsman' })
			.then( res => {
				assert.ok( res.body._id );
				done();
			})
			.catch( done );
	})

	it( '/GET where rank is captain', done => {
		request
			.get( '/api/pirates' )
			.set('Authorization', `Bearer ${token}`)
			.query({ rank: 'captain' })
			.then( res => {
				assert.equal(res.body.length, 1);
				assert.equal(res.body[0]._id, luffy._id );
				done();
			})
			.catch( done );
	});
});