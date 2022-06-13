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

	it('has its name added to default retryEndpoints', function () {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});

	// TODO
});