'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const chai = require('chai')
	, expect = chai.expect
	, sinon = require('sinon')
	, sinonChai = require('sinon-chai')
	, chaiAsPromised = require('chai-as-promised')
	, Bluebird = require('bluebird');


chai.use(chaiAsPromised);
chai.use(sinonChai);

chai.should();

const DataDragonHelperDirRelative = '../../lib/DataDragon/';
const DataDragonHelper = require(DataDragonHelperDirRelative + 'DataDragonHelper.js');

const testDownloadPath = path.resolve(__dirname, 'testDownload');

const summonerIdEuw = 19115840;
const region = 'euw';
describe('DataDragonHelper TestSuite', function () {
	let errorSpy;

	before(function (done) {
		rimraf(testDownloadPath, done);
	});
	beforeEach(function () {
		errorSpy = sinon.spy();
		DataDragonHelper.events.on(DataDragonHelper.eventIds.ERROR, errorSpy);
	});
	afterEach(function (done) {
		DataDragonHelper.events.removeAllListeners(DataDragonHelper.eventIds.ERROR);

		rimraf(testDownloadPath, done);
	});

	describe('DataDragonHelper setup and download behaviour', function () {
		describe('storagePath', function () {
			describe('setter / getter', function () {
				it('getter defaults to the directory of the script', function () {
					const actual = DataDragonHelper.storageRoot;
					expect(actual).to.equal(path.resolve(__dirname, DataDragonHelperDirRelative));
				});
				it('setter can be used with relative path (relative to working directory!)', function () {
					DataDragonHelper.storageRoot = '../assets';
					const actual = DataDragonHelper.storageRoot;
					expect(actual).to.equal(path.resolve(process.cwd(), '../assets'));
					fs.rmdirSync(path.resolve(process.cwd(), '../assets'));
				});
				it('setter can be used with absolute path', function () {
					DataDragonHelper.storageRoot = path.resolve(__dirname, '../assets');
					const actual = DataDragonHelper.storageRoot;
					expect(actual).to.equal(path.resolve(__dirname, '../assets'));
				});

				it('setter can be used with path segments', function () {
					DataDragonHelper.storageRoot = [__dirname, '../assets'];
					const actual = DataDragonHelper.storageRoot;
					expect(actual).to.equal(path.resolve(__dirname, '../assets'));
				});
			});
			describe('buildStoragePath', function () {
				it('should throw helpful error for missing arguments', function () {
					expect(() => {
						DataDragonHelper.buildStoragePath();
					}).to.throw();
				});
				it('should emit helpful error for missing arguments', function () {
					let expectedErr = sinon.match.instanceOf(Error).and(sinon.match.has('message', 'buildStoragePath: no version provided'));

					DataDragonHelper.buildStoragePath({});
					errorSpy.should.have.been.calledWith(expectedErr);
					errorSpy.resetHistory();

					DataDragonHelper.buildStoragePath({locale: 'en_US'});
					errorSpy.should.have.been.calledWith(expectedErr);
					errorSpy.resetHistory();

					expectedErr = sinon.match.instanceOf(Error).and(sinon.match.has('message', 'buildStoragePath: no locale provided'));
					DataDragonHelper.buildStoragePath({version: '8.14'});
					errorSpy.should.have.been.calledWith(expectedErr);
					errorSpy.resetHistory();

				});
				it('should return the path for storage', function () {
					const actual = DataDragonHelper.buildStoragePath({version: '8.14', locale: 'en_US'});
					expect(actual).a('string');
					expect(actual).to.include('8.14');
					expect(actual).to.include('en_US');
				});
			});
		});
		describe('download methods', function () {
			before(function () {
				DataDragonHelper.storageRoot = testDownloadPath;
			});
			after(function (done) {
				rimraf(testDownloadPath, () => {
					DataDragonHelper.reset();
					done();
				});

			});
			describe('downloadingStaticDataByLocale', function () {
				it('Can Download files', function () {
					this.timeout(0);
					return DataDragonHelper.downloadingStaticDataByLocale('en_US', ['8.11.1', '7.15.1'], 7).then(() => {
						return Bluebird.all([
							expect(fs.existsSync(path.join(DataDragonHelper.buildStoragePath({
								version: '8.11.1',
								locale: 'en_US'
							}) + '/champion.json'))).true,
							expect(fs.existsSync(path.join(DataDragonHelper.buildStoragePath({
								version: '7.15.1',
								locale: 'en_US'
							}) + '/champion.json'))).true
						]);
					});
				});
			});
			// should not be used until optimized. StaticData fileSystem cache should rather be build over time
			describe('downloadingStaticData', function () {
				it.skip('Downloads files for all versions of the given locale', function () {
					this.timeout(0);
					return DataDragonHelper.downloadingStaticData('en_US').then(() => {
						return Bluebird.all([
							expect(fs.existsSync(path.join(DataDragonHelper.buildStoragePath({
								version: '8.14.1',
								locale: 'en_US'
							}) + '/champion.json'))).true,
							expect(fs.existsSync(path.join(DataDragonHelper.buildStoragePath({
								version: '7.15.1',
								locale: 'en_US'
							}) + '/champion.json'))).true
						]);
					});
				});
			});
			describe('downloadingStaticDataByVersion', function () {
				const locales = ['en_US', 'de_DE'];
				const version = '8.11.1';
				let dirs;

				beforeEach(function () {
					dirs = [
						DataDragonHelper.buildStoragePath({version: version, locale: locales[0]}),
						DataDragonHelper.buildStoragePath({version: version, locale: locales[1]})
					];
					return Bluebird.all(dirs.map((dir) => {
						console.log(dir);
						return new Bluebird((resolve) => rimraf(dir, resolve));
					}));
				});

				it('downloads all given locales for the given version', function () {
					this.timeout(0);
					return DataDragonHelper.downloadingStaticDataByVersion({version, locales}).then(() => {
						return Bluebird.map(dirs, (dir) => {
							return expect(fs.existsSync(path.join(dir, '/champion.json'))).true;
						});
					});
				});
				it('defaults to en_US if no locales are provided', function () {
					this.timeout(0);
					const dir_En_US = dirs[0];
					return DataDragonHelper.downloadingStaticDataByVersion({version}).then(() => {
						return expect(fs.existsSync(path.join(dir_En_US, '/champion.json'))).true;
					});
				});
				it('throws if no version is provided', function () {
					let expectedErr = sinon.match.instanceOf(Error).and(sinon.match.has('message', 'downloadingStaticDataByVersion: version is invalid, received: undefined'));
					DataDragonHelper.downloadingStaticDataByVersion();
					errorSpy.should.have.been.calledWith(expectedErr);
				});
			});
		});
		describe('getting versions from downloads', function () {
			const localeUsed = 'de_DE';
			const localeNotUsed = 'en_US';
			before(function (done) {
				this.timeout(0);
				rimraf(testDownloadPath, () => {
					DataDragonHelper.storageRoot = testDownloadPath;
					done();
				});
			});
			after(function (done) {
				this.timeout(0);
				rimraf(testDownloadPath, () => {
					DataDragonHelper.reset();
					done();
				});
			});
			describe('gettingLatestVersionFromDownloads', function () {
				it('should throw when no files are downloaded', function () {
					return Bluebird.all([
						DataDragonHelper.gettingLatestVersionFromDownloads().should.eventually.rejectedWith('no downloaded versions available'),
						DataDragonHelper.gettingLatestVersionFromDownloads(localeUsed).should.eventually.rejectedWith('no downloaded versions available')
					]);
				});
				it('should be able to get the latest version from many', function () {
					this.timeout(0);
					return DataDragonHelper.downloadingStaticDataByLocale(localeUsed, ['8.1.1', '8.10.1', '8.14.1', '6.13.1']).then(() => {
						return Bluebird.all([
							DataDragonHelper.gettingLatestVersionFromDownloads(localeUsed).should.eventually.be.a('string').equal('8.14.1'),
							DataDragonHelper.gettingLatestVersionFromDownloads().should.eventually.be.a('string').equal('8.14.1'),
							DataDragonHelper.gettingLatestVersionFromDownloads(localeNotUsed).should.eventually.be.rejectedWith('No downloaded version available for given locale:')
						]);
					});
				});
			});
		});
	});
	describe('DataDragonHelper Data methods', function () {
		this.timeout(5000);

		before(function (done) {
			rimraf(testDownloadPath, done);
		});
		beforeEach(function () {
			DataDragonHelper.storageRoot = testDownloadPath;
		});
		afterEach(function () {
			DataDragonHelper.reset();
		});
		describe('gettingItemList()', function () {
			it('should receive all items by id', function () {
				return DataDragonHelper.gettingItemList().then(function (listDTO) {
					expect(listDTO).to.have.property('data').and.that.to.have.property(1001);
				});
			});
			it('should return data for the latest available version if none given (see log for confirmation)', function () {
				return DataDragonHelper.gettingItemList().then(listDTO => {
					expect(listDTO).to.have.property('data').and.that.to.have.property(1001);
				});
			});
			it('should return data for the given version', function () {
				return DataDragonHelper.gettingItemList('7.1.1').then(listDTO => {
					expect(listDTO).to.have.property('data').and.that.to.have.property(1001);
				});
			});
			it('should return data for the latest available version if none given (see log for confirmation)', function () {
				return DataDragonHelper.gettingItemList(null).then(listDTO => {
					expect(listDTO).to.have.property('data').and.that.to.have.property(1001);
				});
			});
		});
		describe('gettingChampionsList()', function () {
			it('returns all champions', function () {
				return DataDragonHelper.gettingChampionsList().then((listDTO) => {
					expect(listDTO).to.have.property('data').and.that.to.have.property('Akali');
				});
			});
			it('returns localized champions for jp region', function () {
				return DataDragonHelper.gettingChampionsList(null, 'ja_JP').then(function (listDTO) {
					expect(listDTO.data.Akali.name).to.equal('アカリ');
				});
			});
		});
		describe('gettingLocalList', function () {
			it('data methods use the latest version from DDragon if Version is not available', function () {
				return Promise.all([
					DataDragonHelper.gettingVersions(),
					DataDragonHelper.gettingSummonerSpellsList('7.10.10')
				]).then(([versions, spells]) => {
					const fallbackVersion = versions[0];
					return expect(fs.existsSync(path.join(testDownloadPath, fallbackVersion, 'en_US', 'champion.json'))).true;
				});
			});
			it('data methods use the given version if it\'s in the versions array', function () {
				const initialVersion = '7.1.1';

				return Promise.all([
					DataDragonHelper.gettingVersions(),
					DataDragonHelper.gettingSummonerSpellsList(initialVersion)
				]).then(([versions, spells]) => {
					const fallbackVersion = versions[0];
					return Promise.all([
						expect(fs.existsSync(path.join(testDownloadPath, fallbackVersion, 'en_US', 'champion.json'))).false,
						expect(fs.existsSync(path.join(testDownloadPath, initialVersion, 'en_US', 'champion.json'))).true
					]);
				});
			});
		});
	});
});
