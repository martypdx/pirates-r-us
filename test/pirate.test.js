const Pirate = require('../lib/models/pirate');
const assert = require('chai').assert;

describe('Pirate model', () => {

	it('validates with name and rank', done => {
		const pirate = new Pirate({
			name: 'name',
			rank: 'rank'
		})

		pirate.validate(err => {
			if (!err) done();
			else done(err);
		});
	});

	it('name is required', done => {
		const pirate = new Pirate()
		pirate.rank = 'crew';

		pirate.validate(err => {
			assert.isOk(err, 'name should have been required');
			done();
		});
	});

	it('rank defaults to "crew"', done => {
		const pirate = new Pirate({
			name: 'Lackey'
		})

		pirate.validate(err => {
			assert.isNotOk(err);
			assert.equal(pirate.rank, 'crew');
			done();
		});
	});



});