describe('LeagueEndpoint Testsuite', function () {
	'use strict';

	const LeagueEndpoint = require('../../lib/endpoints/LeagueEndpoint');

	const chai = require('chai');
	const chaiAsPromised = require('chai-as-promised');
	const should = chai.should;

	chai.use(chaiAsPromised);
	chai.should();

	const TestUtil = require('../TestUtil');
	let mergedConfig = TestUtil.getTestConfig();

	const mock_summoner = TestUtil.mocks.summoners.Colorfulstan;
	const mock_rankedSoloQueueConfigId = 'RANKED_SOLO_5x5';
	const mock_leagueid = TestUtil.mocks.leagueId;

	let endpoint;
	beforeEach(function () {
		let {per10, per600, allowBursts} = mergedConfig.limits;
		mergedConfig.useV4 = true;
		endpoint = new LeagueEndpoint(mergedConfig, TestUtil.createRateLimiter(per10, per600, allowBursts));
	});

	it('has its name added to default retryEndpoints', function () {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});
	describe('gettingChallengerLeague', function () {
		it('can request the challenger league for a region/queue', function () {
			return endpoint.gettingChallengerLeague(mock_rankedSoloQueueConfigId, mock_summoner.platformId)
				.should.eventually.have.property('tier')
				.equal('CHALLENGER');
		});
	});
	describe('gettingMasterLeague', function () {
		it('can request the master league for a region/queue', function () {
			return endpoint.gettingMasterLeague(mock_rankedSoloQueueConfigId, mock_summoner.platformId)
				.should.eventually.have.property('tier')
				.equal('MASTER');
		});
	});
	describe('gettingGrandMasterLeague', function () {
		it('can request the master league for a region/queue', function () {
			return endpoint.gettingGrandMasterLeague(mock_rankedSoloQueueConfigId, mock_summoner.platformId)
				.should.eventually.have.property('tier')
				.equal('GRANDMASTER');
		});
	});

	describe('gettingLeagueById', function () {
		it('can request a league for a specific leagueId', function () {
			return endpoint.gettingLeagueById(mock_leagueid.id, mock_leagueid.platformId)
				.should.eventually.have.property('tier');
		});
	});
});