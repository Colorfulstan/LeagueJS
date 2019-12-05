describe('LeagueEndpoint Testsuite', function () {
	'use strict';

	const LeagueEndpoint = require('../../lib/endpoints/LeagueEndpoint');

	const chai = require('chai');
	const chaiAsPromised = require('chai-as-promised');
	// const should = chai.should;

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

	describe('gettingPositionsForSummonerId', function () {
		it('can request positions for a specific summoner', function () {
			return endpoint.gettingPositionsForSummonerId(mock_summoner.summonerIdV4, mock_summoner.platformId)
				.should.eventually.be.an('Array');
		});
	});

	describe('gettingEntriesForSummonerId', function () {
		it('can request entries for a specific summoner', function () {
			return endpoint.gettingEntriesForSummonerId(mock_summoner.summonerIdV4, mock_summoner.platformId)
				.should.eventually.be.an('Array');
		});
	});

	describe('gettingEntries', function () {
		it('can request entries with defaults', function () {
			return endpoint.gettingEntries({platformIdOrRegion: mock_summoner.platformId})
				.should.eventually.be.an('Array').and.not.have.length(0);
		});
		it('can request entries for another page', function () {
			return endpoint.gettingEntries({platformIdOrRegion: mock_summoner.platformId}, {page: 900})
				.should.eventually.be.an('Array').and.have.length(0);
		});
		it('can request entries for TT flex', function () {
			return endpoint.gettingEntries({queueName: 'RANKED_FLEX_TT', platformIdOrRegion: mock_summoner.platformId})
				.should.eventually.be.an('Array').and.not.have.length(0);
		});
		it('can request entries for SR flex', function () {
			return endpoint.gettingEntries({queueName: 'RANKED_FLEX_SR', platformIdOrRegion: mock_summoner.platformId})
				.should.eventually.be.an('Array').and.not.have.length(0);
		});
		it('can request entries for different queues', function () {
			return Promise.all([
				endpoint.gettingEntries({queueName: 'RANKED_SOLO_5x5', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({queueName: 'RANKED_FLEX_TT', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({queueName: 'RANKED_FLEX_SR', platformIdOrRegion: mock_summoner.platformId})
			]);
		});
		it('can request entries for different tier', function () {
			return Promise.all([
				endpoint.gettingEntries({tierName: 'IRON', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({tierName: 'BRONZE', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({tierName: 'SILVER', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({tierName: 'GOLD', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({tierName: 'PLATINUM', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({tierName: 'DIAMOND', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
			]);
		});
		it('can request entries for different division', function () {
			return Promise.all([
				endpoint.gettingEntries({divisionName: 'I', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({divisionName: 'II', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({divisionName: 'III', platformIdOrRegion: mock_summoner.platformId})
					.should.eventually.be.an('Array').and.not.have.length(0),
				endpoint.gettingEntries({divisionName: 'IV', platformIdOrRegion: mock_summoner.platformId})
			]);
		});
	});
});