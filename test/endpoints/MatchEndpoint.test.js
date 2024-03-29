describe('MatchEndpoint Testsuite', function () {
	'use strict';

	const MatchEndpoint = require('../../lib/endpoints/MatchEndpoint');

	const chai = require('chai');
	const chaiAsPromised = require('chai-as-promised');
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

	describe('v5', function () {
		describe('gettingById', function () {
			it('Using "forPuuid" it contains the player information for the provided accountID (and ONLY that)', function () {
				return endpoint.gettingById(mock_summoner.gameId, mock_summoner.platformId, {
					forPuuid: mock_summoner.puuid,
					forPlatformId: mock_summoner.platformId
				})
					.then(matchDto => {
						let numParticipantIdentityPlayers = 0;
						let participantPlayer;
						console.log(matchDto);
						matchDto.info.participants.forEach(participant => {
							if (participant) {
								numParticipantIdentityPlayers++;
								participantPlayer = participant;
							}
						});
						expect(numParticipantIdentityPlayers).to.equal(1);
						expect(participantPlayer.puuid).to.equal(mock_summoner.puuid);
					});
			});
			it('can request a specific match for an accountId', function () {
				return endpoint.gettingById(mock_summoner.gameId, mock_summoner.platformId)
					.should.eventually.have.property('info');
			});
		});
		describe('gettingListByAccount', function () {
			it('can request the matchlist for an account', function () {
				this.timeout(100000);

				return endpoint.gettingListByAccount(mock_summoner.puuid, mock_summoner.platformId, {beginIndex:0, endIndex:9})
					.should.eventually.have.property('matches')
					.an('Array')
					.with.length(10);
			});
			xit('can request the matchlist for multiple summoners in parallel', function () {
				this.timeout(100000);

				// TODO: needs to be able to get the encrypted values for ids before (or enable requesting by name)
				const accountIds = [
					24885403,
					42347345,
					21977757,
					33121340,
					31385891,
					28631306,
					22242237
				];
				const platformId = 'euw1';

				function gettingFirstMatchFromMatchList(accountId, platformId) {
					// console.log(accountId, platformId);

					return endpoint.gettingListByAccount(accountId, platformId)
						.then(matchListDto => {
							// console.log(accountId, platformId);
							// console.log(matchListDto.matches[0]);
							return endpoint.gettingById(matchListDto.matches[0].gameId, matchListDto.matches[0].platformId);
						});
				}

				return Promise.all([
					gettingFirstMatchFromMatchList(accountIds[0], platformId),
					gettingFirstMatchFromMatchList(accountIds[1], platformId),
					gettingFirstMatchFromMatchList(accountIds[2], platformId),
					gettingFirstMatchFromMatchList(accountIds[3], platformId),
					gettingFirstMatchFromMatchList(accountIds[4], platformId),
					gettingFirstMatchFromMatchList(accountIds[5], platformId),
					gettingFirstMatchFromMatchList(accountIds[6], platformId)]).then(matchDtos => {
					matchDtos.forEach((matchDto, index) => {
						// console.log(accountIds[index], matchDto.participantIdentities.map(identity => identity.player));
						let playerFound = matchDto.participantIdentities.find(identity => (identity.player.currentAccountId === accountIds[index] || identity.player.accountId === accountIds[index]));
						expect(playerFound).to.exist;
					});
				});
			});
		});
		describe('gettingListByAccountWithoutPagination', function () {
			it.skip('can request the matchlist for an account', function () {
				return endpoint.gettingListByAccountWithoutPagination(mock_summoner.puuid, mock_summoner.platformId)
					.should.eventually.have.property('matches')
					.an('Array')
					.with.length(100);
			});
			it('can request less then 100 matches', function () {
				this.timeout(100000);

				return endpoint.gettingListByAccountWithoutPagination(mock_summoner.puuid, mock_summoner.platformId, {endIndex: 9})
					.should.eventually.have.property('matches')
					.an('Array')
					.with.length(10);
			});
			it('can request exactly 100 matches', function () {
				this.timeout(100000);

				return endpoint.gettingListByAccountWithoutPagination(mock_summoner.puuid, mock_summoner.platformId, {
					beginIndex: 53,
					endIndex: 152
				})
					.should.eventually.have.property('matches')
					.an('Array')
					.with.length(100);
			});
			it('can request more then 100 matches', function () {
				this.timeout(100000);
				return endpoint.gettingListByAccountWithoutPagination(mock_summoner.puuid, mock_summoner.platformId, {
					beginIndex: 132,
					endIndex: 453
				}).then(function () {
					console.log(arguments);
				});
				// .should.eventually.have.property('matches')
				// .an('Array')
				// .with.length(453 - 132);
			});
			xit('can request the matchlist for multiple summoners in parallel', function () {
				this.timeout(100000);


				const accountIds = [
					24885403,
					42347345,
					21977757,
					33121340,
					31385891,
					28631306,
					22242237
				];
				const platformId = 'euw1';

				function gettingFirstMatchFromMatchList(accountId, platformId) {
					// console.log(accountId, platformId);

					return endpoint.gettingListByAccountWithoutPagination(accountId, platformId, {endIndex: 1})
						.then(matchListDto => {
							// console.log(accountId, platformId);
							// console.log(matchListDto.matches[0]);
							return endpoint.gettingById(matchListDto.matches[0].gameId, matchListDto.matches[0].platformId);
						});
				}

				return Promise.all([
					gettingFirstMatchFromMatchList(accountIds[0], platformId),
					gettingFirstMatchFromMatchList(accountIds[1], platformId),
					gettingFirstMatchFromMatchList(accountIds[2], platformId),
					gettingFirstMatchFromMatchList(accountIds[3], platformId),
					gettingFirstMatchFromMatchList(accountIds[4], platformId),
					gettingFirstMatchFromMatchList(accountIds[5], platformId),
					gettingFirstMatchFromMatchList(accountIds[6], platformId)
				]).then(matchDtos => {
					matchDtos.forEach((matchDto, index) => {
						// console.log(accountIds[index], matchDto.participantIdentities.map(identity => identity.player));
						let playerFound = matchDto.participantIdentities.find(identity => (identity.player.currentAccountId === accountIds[index] || identity.player.accountId === accountIds[index]));
						expect(playerFound).to.exist;
					});
				});
			});
		});
		describe('gettingRecentListByAccount', function () {
			it('can request the most recent matches for an account', function () {
				this.timeout(100000);

				return endpoint.gettingRecentListByAccount(mock_summoner.puuid, mock_summoner.platformId)
					.should.eventually.have.property('matches')
					.an('Array')
					.with.length.of.at.most(20);
			});
		});
		describe('gettingTimelineById', function () {
			it('can request the timeline for a given match',async function () {
				return endpoint.gettingTimelineById(mock_summoner.gameId, mock_summoner.platformId)
					.should.eventually.have.property('info').to.have.property('frames');
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

});