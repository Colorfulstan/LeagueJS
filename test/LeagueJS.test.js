describe('League of Legends api wrapper test suite', function () {
	'use strict';

	const fs = require('fs');
	const path = require('path');

	const LeagueJs = require('../lib/LeagueJS');
	const EndpointUtil = require('../lib/util/EndpointUtil');

	const chai = require('chai');
	const should = chai.should;
	const expect = chai.expect;
	chai.should();

	it('should apply the config to the Class', function () {
		let api = new LeagueJs('test', {useV4: true, apiVersionOverrides: {}});

		api.config.apiVersionOverrides.should.deep.equal({});
		api.config.should.have.property('API_KEY');
		api.config.API_KEY.should.be.equal('test');
	});

	it('should not run without api key', function () {
		expect(() => {
			new LeagueJs();
		}, 'Did not throw error with empty API_KEY.').to.throw('apiKey');
	});
	it('provides all Utility classes', function () {
		// TODO: add Test if all Util classes were added!?
		LeagueJs.util.should.have.property('EndpointUtil');
	});

	it('provides GameConstants object', function () {
		LeagueJs.GAME_CONSTANTS.should.have.property('seasons');
	});

	describe('Endpoints', function () {
		it('are set as properties', function () {
			let api = new LeagueJs('test');
			EndpointUtil.getEndpointNames().forEach(endpointName => {
				api.should.have.property(endpointName);
			});
		});

		it('are stored within internal array', function () {
			let api = new LeagueJs('test');
			const endpointNames = EndpointUtil.getEndpointNames();
			api._endpoints.forEach(endpoint => {
				endpointNames.should.include(endpoint.name);
			});
		});
	});
	describe('Static Data is handled through DataDragonHelper', function () {
		let api;
		beforeEach(function () {
			api = new LeagueJs('test');
		});
		describe('setupDataDragonHelper', function () {
			it('throws if no path is provided', function () {
				expect(() => {
					api.StaticData.setup();
				}).to.throw('No Download Path');
				expect(() => {
					api.StaticData.setup(true);
				}).to.throw('No Download Path');
			});
			it('creates the directory path given, if it does not exist', function () {
				const pathSegments = [__dirname, 'ddhelper', 'test'];
				api.StaticData.setup(pathSegments, true);
				const exists = fs.existsSync(path.resolve(...pathSegments));
				expect(exists).true;
				fs.rmdirSync(path.resolve(...pathSegments));
				fs.rmdirSync(path.resolve(...pathSegments.slice(0, pathSegments.length - 1)));
			});
		});
	});
	describe.skip('setRateLimit', function () { // deprecated
		let api;
		beforeEach(function () {
			api = new LeagueJs('test', {
				PLATFORM_ID: 'na1'
			});
			api.rateLimiter.per10.na1.should.have.property('_intervalMS').equal(10 * 1000);
			api.rateLimiter.per10.na1.should.have.property('_allowBursts').equal(true);
			api.getRateLimits().should.have.property('allowBursts').equal(true);
		});
		it('changes the rate-limits for leagueJS.rateLimiter', function () {
			api.setRateLimit(100, 1000, false);
			api.getRateLimits().should.have.property('allowBursts').equal(false);
		});
		it('the changes propagate through all endpoints', function () {
			api.Summoner.rateLimiter.per10.na1.should.have.property('_intervalMS').equal(10 * 1000);
			api.Summoner.rateLimiter.per10.na1.should.have.property('_allowBursts').equal(true);
			api.setRateLimit(100, 1000, false);
			api.Summoner.rateLimiter.per10.na1.should.have.property('_allowBursts').equal(false);
		});
	});
});