describe('MatchEndpoint Testsuite', function () {
	'use strict';

	const MatchEndpoint = require('../../lib/endpoints/MatchEndpoint');

	const chai = require("chai");
	const chaiAsPromised = require("chai-as-promised");
	const should = chai.should;
	const expect = chai.expect;
	chai.use(chaiAsPromised);
	chai.should();

	const TestUtil = require('../TestUtil');
	let mergedConfig = TestUtil.getTestConfig();

	const mock_summoner = TestUtil.mocks.summoners.Colorfulstan;


	let endpoint;
	beforeEach(function () {
		let {per10, per600, allowBursts} = mergedConfig.limits;
		endpoint = new MatchEndpoint(mergedConfig, TestUtil.createRateLimiter(per10, per600, allowBursts));
	});

	it('has its name added to default retryEndpoints', function () {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});
	describe('gettingById', function () {
		it('Using "forAccountId" it contains the player information for the provided accountID (and ONLY that)', function () {
			return endpoint.gettingById(mock_summoner.gameId, mock_summoner.platformId, {forAccountId: mock_summoner.accountId})
				.then(matchDto => {
					let numParticipantIdentityPlayers = 0;
					let participantPlayer;
					matchDto.participantIdentities.forEach(identity => {
						if (identity.player) {
							numParticipantIdentityPlayers++;
							participantPlayer = identity.player;
						}
					});
					expect(numParticipantIdentityPlayers).to.equal(1);
					expect(participantPlayer.accountId).to.equal(mock_summoner.accountId);
				});
		});
		it('can request a specific match for an accountId', function () {
			return endpoint.gettingById(mock_summoner.gameId, mock_summoner.platformId)
				.should.eventually.have.property('gameId');
		});
	});
	describe('gettingListByAccount', function () {
		it('can request the matchlist for an account', function () {
			return endpoint.gettingListByAccount(mock_summoner.accountId, mock_summoner.platformId)
				.should.eventually.have.property('matches')
				.an('Array')
				.with.length.of.at.least(100);
		});
	});
	describe('gettingRecentListByAccount', function () {
		it('can request the most recent matches for an account', function () {
			return endpoint.gettingRecentListByAccount(mock_summoner.accountId, mock_summoner.platformId)
				.should.eventually.have.property('matches')
				.an('Array')
				.with.length.of.at.most(20);
		});
	});
	describe('gettingTimelineById', function () {
		it('can request the timeline for a given match', function () {
			return endpoint.gettingTimelineById(mock_summoner.gameId, mock_summoner.platformId)
				.should.eventually.have.property('frames');
		});
	});
	describe.skip('Tournament related', function () {
		describe('gettingIdsByTournament', function () { // TODO: get tournament api-key to test this
			it('can request the match ids for a tournament', function () {
				// return endpoint.gettingIdsByTournament(..., ...)
				// 	.should.eventually.be.an('Array');
			});
		});
		describe('gettingByIdForTournament', function () { // TODO: get tournament api-key to test this
			it('can request a match within a tournament', function () {
				// return endpoint.gettingIdsByTournament(..., ...)
				// 	.should.eventually.be.an('Array');
			});
		});
	});


});