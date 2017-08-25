describe('GameConstantsUtil Testsuite', function () {
	'use strict';

	const GameConstantsUtil = require('../../lib/util/GameConstantsUtil');
	const TestUtil = require('../TestUtil');

	const chai = require("chai");
	// const chaiAsPromised = require("chai-as-promised");
	// const should = chai.should;
	// const expect = chai.expect;
	// chai.use(chaiAsPromised);
	chai.should();


	describe('queueIds()', function () {
		it('gets all queue ids as numbers', function () {
			GameConstantsUtil.queueIds().forEach(id => {
				id.should.be.a('number');
			});
		});
	});
	describe('rankedQueueIds()', function () {
		it('gets ranked queue ids (including deprecated ones)', function () {
			GameConstantsUtil.rankedQueueIds().should.have.length(9);
		});
	});
	describe('mostRecentSeasonIds()', function () {
		it('returns all seasonIds if no number is given', function () {
			const expected = GameConstantsUtil.seasonIds().length;
			GameConstantsUtil.mostRecentSeasonIds().should.have.length(expected);
		});
		it('returns the right amount of seasonIds', function () {
			const expected = 2;
			GameConstantsUtil.mostRecentSeasonIds(expected).should.have.length(expected);
		});
		it('returns the most recent ids', function () {
			const expected = GameConstantsUtil.seasonIds()[GameConstantsUtil.seasonIds().length - 1];
			const actual = GameConstantsUtil.mostRecentSeasonIds(1)[0];
			actual.should.equal(expected);
		});
	});
});