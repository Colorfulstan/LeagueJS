describe('MatchUtil Testsuite', function () {
	'use strict';

	const MatchUtil = require('../../lib/util/MatchUtil');
	const TestUtil = require('../TestUtil');

	const chai = require("chai");
	// const chaiAsPromised = require("chai-as-promised");
	// const should = chai.should;
	// const expect = chai.expect;
	// chai.use(chaiAsPromised);
	chai.should();


	describe('getVersionForGameVersion()', function () {
		it('gets the data dragon version based on the latest version with the same major.minor version', function () {
			const expected = ('5.1.3');
			MatchUtil.getVersionForGameVersion('5.1.8.123452', ['4.3.1', '5.1.3', '6.0.1'])
				.should.equal(expected);
		});
		describe('multiple same major.minor versions in versions array', function () {
			// NOTE: versions array from static-data only contains a single version per major.minor
			// and is sorted from latest to earliest, so these should not be an issue.
			// Tests are only provided to clarify possible shortcommings of this method.
			it('gets the latest version when versions array is sorted from latest to earliest', function () {
				const expected = ('5.1.5');
				MatchUtil.getVersionForGameVersion('5.1.8.123452', ['5.1.5', '5.1.3', '5.1.2'])
					.should.equal(expected);
			});
			it('does get the earliest version if versions array is sorted from earliest to latest', function () {
				const expected = ('5.1.2');
				MatchUtil.getVersionForGameVersion('5.1.8.123452', ['5.1.5', '5.1.3', '5.1.2'].reverse())
					.should.equal(expected);
			});
			it('does get the latest version if given gameVersion cant be matched', function () {
				const expected = ('5.1.5');
				MatchUtil.getVersionForGameVersion('5.3.8.123452', ['5.1.5', '5.1.3', '5.1.2'])
					.should.equal(expected);
			});
		});
	});
	describe('getPatchFromGameVersion()', function () {
		it('returns major.minor version for gameVersion values (major.minor.patch.build)', function () {
			const expected = ('5.1');
			MatchUtil.getPatchFromGameVersion('5.1.8.123452').should.equal(expected);
			MatchUtil.getPatchFromGameVersion('5.1.8').should.equal(expected);
			MatchUtil.getPatchFromGameVersion('5.1').should.equal(expected);
		});
	});
});