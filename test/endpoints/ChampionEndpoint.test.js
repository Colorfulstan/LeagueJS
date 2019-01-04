describe('ChampionEndpoint Testsuite', function () {
	'use strict';

	const ChampionEndpoint = require('../../lib/endpoints/ChampionEndpoint');

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
		endpoint = new ChampionEndpoint(mergedConfig, TestUtil.createRateLimiter(per10, per600, allowBursts));
	});

	it('has its name added to default retryEndpoints', function () {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});

	describe('gettingRotations', function () {
		it('can request the champion rotations', function () {
			const promise = endpoint.gettingRotations(mock_summoner.platformId)

			return Promise.all([
				promise.should.eventually.have.property('freeChampionIdsForNewPlayers').an('Array'),
				promise.should.eventually.have.property('freeChampionIds').an('Array'),
				promise.should.eventually.have.property('maxNewPlayerLevel').a('number')
			]);
		});
	});
});