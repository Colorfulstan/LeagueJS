/*global describe*/
/*global require*/
/*global beforeEach*/
/*global it*/
/*global xit*/

describe('League of Legends api wrapper test suite', function () {
    'use strict';


    var sinon = require('sinon'),
        should = require('should'),
        leagueApi = require('../lib/lolapi'),
        mockChampionArray = ['Teemo', 'Ahri', 'Vladimir'],
        mockPlatformsArray = ['na1', 'na1', 'euw1'], // platforms of the summoner/account mocks
        mockAccountsArray = [43553864, 31894009, 32136501],
        mockSummonersArray = [29228901, 19199530, 22177292],
        mockMatchArray = [1622420185, 1622447158, 3041322071 /** euw1 */],
        mockTeam = 'TEAM-e5d4b050-4699-11e5-8042-c81f66dd32cd'
        ;


    beforeEach(function () {
        leagueApi.init(process.env.API_TOKEN, process.env.API_REGION);
    });

    it('should be able to retrieve all champions', function (done) {

        leagueApi.getChampions(false, undefined, function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.length.should.be.greaterThan(0);
            done();
        });
    });

    it('should be able to get the masteries of someone', function (done) {

        leagueApi.Summoner.getMasteries(19321078, undefined, function(err, masteries) {
            should.not.exist(err);
            should.exist(masteries);
            done();
        });
    });

    it('should be able to get the runes of someone', function (done) {

        leagueApi.Summoner.getRunes(19321078, undefined, function(err, masteries) {
            should.not.exist(err);
            should.exist(masteries);
            done();
        });
    });

    it('should be able to retrieve all of the free champions', function (done) {
        leagueApi.getChampions(true, undefined, function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.length.should.be.equal(10);
            done();
        });
    });

    it('should throw an error if given the wrong type ', function (done) {
        done();
    });

    xit('should be able to get summoners data from a list of ids', function (done) {
        leagueApi.Summoner.listSummonerDataByIDs(mockSummonersArray, undefined, function (err, res) {
            should.not.exist(err);
            should.exist(res);
            mockSummonersArray.forEach(function (id) {
                should.exist(res[id]);
            });
            done();
        });
    });

    it('should be able to get champion static data', function(done) {
        var options = {champData: 'allytips,blurb', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getChampionList(options, 'na1', function(err, champs) {
            should.not.exist(err);
            should.exist(champs);
            done();
        });
    });

    it('should be able to get a list of versions', function(done) {
        leagueApi.Static.getVersions('na1', function(err, vers) {
            should.not.exist(err);
            should.exist(vers);
            done();
        });
    });

    it('should be able to get static data of a champion by id', function(done) {
        var options = {champData: 'allytips,blurb', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getChampionById(1, options, 'na1', function(err, champ) {
            should.not.exist(err);
            should.exist(champ);
            done();
        });
    });

    it('should be able to get a list of items', function(done) {
        var options = {champData: 'allytips,blurb', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getItemList(options, 'na1', function(err, items) {
            should.not.exist(err);
            should.exist(items);
            done();
        });
    });

    it('should be able to get static data of an item by id', function(done) {
        var options = {champData: 'allytips,blurb', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getItemById(2009, options, 'na1', function(err, item) {
            should.not.exist(err);
            should.exist(item);
            done();
        });
    });

    it('should be able to get static data of masteries', function(done) {
        var options = {masteryListData: 'prereq', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getMasteryList(options, 'na1', function (err, masteries) {
            should.not.exist(err);
            should.exist(masteries);
            done();
        });
    });

    it('should be able to get static data of a mastery by id', function(done) {
        var options = {masteryData: 'prereq', version: '5.24.2', locale: 'en_US'};
        leagueApi.Static.getMasteryById(6223, options, 'na1', function (err, mastery) {
            should.not.exist(err);
            should.exist(mastery);
            done();
        });
    });

    xit('should be able to get static data of a realm', function(done) {
        leagueApi.Static.getRealm('na', function (err, realm) {
            should.not.exist(err);
            should.exist(realm);
            done();
        });
    });

    it('should be able to get match', function(done) {
        leagueApi.getMatch(mockMatchArray[0], 'na1', function(err, match) {
            should.not.exist(err);
            should.exist(match);
            done();
        });
    });

    it('should be able to get timeline for a match', function(done) {
        this.timeout(2500);
        leagueApi.getMatchTimeLine(mockMatchArray[2], 'euw1', function(err, timeline) {
            should.not.exist(err);
            should.exist(timeline);
            done();
        });
    });

    it('should be able to get League Data', function(done) {
        leagueApi.Summoner.getLeagues(mockSummonersArray[2], mockPlatformsArray[2], function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });

    it('should be able to get League Positions', function(done) {
        leagueApi.Summoner.getLeaguePositions(mockSummonersArray[2], mockPlatformsArray[2], function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });

    it('should be able to get match history', function(done) {
        leagueApi.getMatchHistory(mockAccountsArray[0], {}, mockPlatformsArray[0], function(err, match) {
            should.not.exist(err);
            should.exist(match);
            done();
        });
    });

    it('should be able to get match history with options', function(done) {
        var options = {
            championIds : [77],
            queue : [4 /* 'RANKED_SOLO_5x5' */]
        };
        leagueApi.getMatchHistory(mockAccountsArray[0], options, mockPlatformsArray[0], function(err, matchHistory) {
            should.not.exist(err);
            should.exist(matchHistory);
            done();
        });
    });

    it('should not be able to get current game', function(done) {
        leagueApi.getCurrentGame(mockSummonersArray[0], mockPlatformsArray[0], function(err, game) {
            should.exist(err);
            should.not.exist(game);
            done();
        });
    });

    xit('should not be able to get featured games', function(done) {
        leagueApi.getFeaturedGames('na', function(err, games) {
            should.exist(games);
            should.not.exist(err);
            done();
        });
    });

    it('should be able to get a new endpoint', function(done) {

        var currentEndpoint = leagueApi.getEndpoint(),
            newEndpointUrl  = 'https://eu.api.pvp.net/api/lol',
            newEndpoint;
        should(currentEndpoint).equal('api.pvp.net/api/lol');

        leagueApi.setEndpoint(newEndpointUrl);
        newEndpoint = leagueApi.getEndpoint();
        should(newEndpoint).equal(newEndpointUrl);

        done();

    });

    xit('should be able to get shards', function(done) {
        leagueApi.getShards(function(err, shards) {
            should.not.exist(err);
            should.exist(shards);
            done();
        });
    });

    xit('should be able to get shards by region', function(done) {
        leagueApi.getShardByRegion('na', function(err, shards) {
            should.not.exist(err);
            should.exist(shards);
            done();
        });
    });
    
    it('should not be able to get infos from not existing regions', function(done) {
       leagueApi.Summoner.getByName('', 'eu-na', function(err, sum) {
           should.exist(err);
           should.not.exist(sum);
           done();
       });
    });

    it('should be able to get champion mastery champions', function(done) {
        leagueApi.ChampionMastery.getChampions(36879107, 'euw1', function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });

    it('should be able to get champion mastery champion', function(done) {
        leagueApi.ChampionMastery.getChampion(36879107, 25, 'euw1', function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });

    it('should be able to get champion mastery champions', function(done) {
        leagueApi.ChampionMastery.getScore(36879107, 'euw1', function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });

    xit('should be able to get champion mastery champions', function(done) {
        leagueApi.ChampionMastery.getTopChampions(36879107, 3, 'euw1', function(err, data) {
            should.not.exist(err);
            should.exist(data);
            done();
        });
    });
});
