describe('SummonerEndpoint Testsuite', function () {
	'use strict';

	const ThirdPartyCodeEndpoint = require('../../lib/endpoints/ThirdPartyCodeEndpoint');

	const TestUtil = require('../TestUtil');
	let mergedConfig = TestUtil.getTestConfig();

	const chai = require("chai");
	const chaiAsPromised = require("chai-as-promised");
	const should = chai.should;
	const expect = chai.expect;
	chai.use(chaiAsPromised);
	chai.should();

	const mock_summoner = TestUtil.mocks.summoners.Colorfulstan;
	const mock_invalidName = TestUtil.mocks.invalidData.summonerName;

	let endpoint;
	beforeEach(function () {
		let {per10, per600, allowBursts} = mergedConfig.limits;
		endpoint = new ThirdPartyCodeEndpoint(mergedConfig, TestUtil.createRateLimiter(per10, per600, allowBursts));
	});

	it('has its name added to default retryEndpoints', function () {
		endpoint.config.limits.retryEndpoints.should.include(endpoint.name);
	});
	describe('gettingBySummoner', function () {
		// NOTE: add your own summoner here and add the verification code for testing in the client under
		// Settings -> about -> verification
		it('requests the verification string', function () {
			return endpoint.gettingBySummoner(mock_summoner.summonerId, mock_summoner.platformId)
				.should.eventually.equal('helloworld');
		});
	});
    describe('verifying', function () {
        it('verifies the verification Code', function () {
            return endpoint.verifying("helloworld", mock_summoner.summonerId, mock_summoner.platformId)
                .should.eventually.be.true;
        });
    });

});