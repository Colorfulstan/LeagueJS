describe('SummonerUtil test suite', function () {
	'use strict';

	const SummonerUtil = require('../../lib/util/SummonerUtil');

	const chai = require("chai");
	const should = chai.should;
	const expect = chai.expect;
	chai.should();

	describe('validateSummonerNameInputCharacters', function () {
		const VALID_CHARS_NA_OCE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const VALID_CHARS_EUW = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ';
		const VALID_CHARS_EUNE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĂăĄąĆćĘęıŁłŃńŐőŒœŚśŞşŠšŢţŰűŸŹźŻżŽžƒȘșȚțˆˇˉΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩάέήίαβγδεζηθικλμνξοπρςστυφχψωόύώﬁﬂ';
		const VALID_CHARS_BR = '0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÇÉÊÍÓÔÕÚàáâãçéêíóôõú';
		const VALID_CHARS_RU = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
		const VALID_CHARS_TR = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïð 0123456789ABCDEFGĞHIİJKLMNOPQRSŞTUVWXYZabcçdefgğhıijklmnoöpqrsştuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿıŁłŒœŠšŸŽžƒˆˇˉμﬁﬂĄąĘęÓóĆćŁłŃńŚśŹźŻż';
		const VALID_CHARS_LAN_LAS = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ abcdefghijklmnñopqrstuvwxyzáéíóúü';

		it('should return null for valid characters in NA/OCE', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters('ˆJannaˆ')).to.be.null;
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_NA_OCE)).to.be.null;
		});
		it('should return null for valid characters in EUW', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_EUW)).to.be.null
		});
		it('should return null for valid characters in EUNE', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_EUNE)).to.be.null
		});
		it('should return null for valid characters in Brazil', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_BR)).to.be.null
		});
		it('should return null for valid characters in Russia', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_RU)).to.be.null
		});
		it('should return null for valid characters in Turkey', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_TR)).to.be.null
		});
		it('should return null for valid characters in LATAM', function () {
			expect(SummonerUtil.validateSummonerNameInputCharacters(VALID_CHARS_LAN_LAS)).to.be.null
		});
		it('should return the invalid character if present', function () {
			const invalidCharacters = "|-!§$%&/\\()=?^°";
			const actual = SummonerUtil.validateSummonerNameInputCharacters(invalidCharacters)
			expect(actual).an('Array').length(invalidCharacters.length);
			actual.forEach((char,index) => {
				expect(char).equals(invalidCharacters[index]);
			})
		});
	});
});