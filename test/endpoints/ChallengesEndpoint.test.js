describe('ChallengesEndpoint Testsuite', function () {
	'use strict';

	const ChallengesEndpoint = require('../../lib/endpoints/ChallengesEndpoint');

	const chai = require('chai');
	const chaiAsPromised = require('chai-as-promised');
	// const expect = chai.expect;
	chai.use(chaiAsPromised);
	chai.should();

	const TestUtil = require('../TestUtil');
	let mergedConfig = TestUtil.getTestConfig();

	const mock_summoner = TestUtil.mocks.summoners.Colorfulstan;

	let endpoint;
	beforeEach(function () {
		let {per10, per600, allowBursts} = mergedConfig.limits;
		endpoint = new ChallengesEndpoint(mergedConfig, TestUtil.createRateLimiter(per10, per600, allowBursts));
	});

	it('has its name added to default retryEndpoints', () => {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});

	describe('gettingLeaderboardsByLevelForChallenge', () =>  {
		it('can request the leaderboards for a challenge with a valid level and challengeId', () => {
			const promise = endpoint.gettingLeaderboardsByLevelForChallenge("CHALLENGER", mock_summoner.challengeId);

			return Promise.all([
				promise.should.eventually.be.an('Array'),
				promise.should.eventually.have.lengthOf(200),
				promise.then((data) => {
					d = data[0];
					return Promise.all([
						d.should.have.property('position').a('number'),
						d.should.have.property('puuid').a('string'),
						d.should.have.property('value').a('number')
					]);
				})
			]);
		});

		it('can request the leaderboards with a specific limit', () => {
			return endpoint.gettingLeaderboardsByLevelForChallenge("CHALLENGER", mock_summoner.challengeId, { limit: 10 })
				.should.eventually.have.lengthOf(10);
		});

		it('can request the leaderboards with a max of 1000', () => {
			return endpoint.gettingLeaderboardsByLevelForChallenge("CHALLENGER", mock_summoner.challengeId, { limit: 2000 })
				.should.eventually.have.lengthOf(1000);
		});

		it('fails when providing a wrong level', () => {
			const validLevels = ["CHALLENGER", "MASTER", "GRANDMASTER"];
			const invalidLevel = "DIAMOND";
			return endpoint.gettingLeaderboardsByLevelForChallenge(invalidLevel, mock_summoner.challengeId)
				.should.eventually.be.rejectedWith(`level has to be one of ${validLevels}. Received: ${invalidLevel}`);
		});

		it('fails when challengeId is invalid', () => {
			const invalidChallengeId = "Invalid";
			return endpoint.gettingLeaderboardsByLevelForChallenge(invalidLevel, invalidChallengeId)
				.should.eventually.be.rejectedWith(`${challengeId} has to be a number or numerical string. Received: ${invalidChallengeId}`);
		});
	});

	describe('gettingChallengesConfig', () => {
		it('returns the config for all challenges', () => {
			const promise =  endpoint.gettingChallengesConfig();
			
			return Promise.all([
				promise.should.eventually.be.an('Array'),
				promise.should.eventually.not.be.empty()
			]);
		});
	});

	describe('gettingChallengeConfigById', () => {
		it('returns the config for the requested challenge', () => {
			const promise = endpoint.gettingChallengeConfigById(mock_summoner.challengeId);

			return Promise.all([
				promise.should.eventually.have.property('id').a('number'),
				promise.should.eventually.have.property('localizedNames').an('object'),
				promise.should.eventually.have.property('state').a('string'),
				promise.should.eventually.have.property('leaderboard').a('boolean'),
				promise.should.eventually.have.property('thresholds').an('object'),
			]);
		});
	});

	describe('gettingChallengePercentiles', () => {
		it('returns the percentiles per level for all challenges', () => {
			return endpoint.gettingChallengesPercentiles()
				.should.eventually.be.an('object');
		});
	});

	describe('gettingChallengePercentilesById', () => {
		it('returns the percentiles per level for a specific challenges', () => {
			const promise = endpoint.gettingChallengePercentilesById(mock_summoner.challengeId);

			return Promise.all([
				promise.should.eventually.have.property('NONE').a('number'),
				promise.should.eventually.have.property('IRON').a('number'),
				promise.should.eventually.have.property('BRONZE').a('number'),
				promise.should.eventually.have.property('SILVER').a('number'),
				promise.should.eventually.have.property('GOLD').a('number'),
				promise.should.eventually.have.property('PLATINUM').a('number'),
				promise.should.eventually.have.property('DIAMOND').a('number'),
				promise.should.eventually.have.property('MASTER').a('number'),
				promise.should.eventually.have.property('GRANDMASTER').a('number'),
				promise.should.eventually.have.property('CHALLENGER').a('number')
			]);
		});
	});

	describe('gettingChallengesPlayerData', () => {
		it('returns challenge statistics for a specific player', () => {
			const promise = endpoint.gettingChallengePercentilesById(mock_summoner.challengeId);

			return Promise.all([
				promise.should.eventually.have.property('totalPoints').an('object'),
				promise.should.eventually.have.property('categoryPoints').an('object'),
				promise.should.eventually.have.property('challenges').an('array'),
				promise.should.eventually.have.property('preferences').an('object')
			]);
		});
	});
});