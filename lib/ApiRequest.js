const Bluebird = require('bluebird');

const ParameterError = require('./errors/ParameterError');

class ApiRequest {

	/***
	 * Executes the request to the url set at construction.
	 *
	 * Sets the new rate-limit header and returns the response as json or raw,
	 * depending on the response's content-type header
	 * @param {string} url for the request
	 * @param token RIOT Api key
	 * @param {boolean} resolveWithFullResponse if true, the given Promise will resolve into the full response
	 * @param {number} numRetriesLeft amount of retries left to do on error not caused by APP rate-limit
	 * @param {number} intervalRetryMS initial time to wait until the next retry on errors from RIOT's underlying
	 * systems. Will increase exponentially with each retry
	 * @param rateLimiter ratelimiter to be used to execute the request
	 */
	static executing(url, {token, rateLimiter, resolveWithFullResponse = false, numRetriesLeft = 3, intervalRetryMS = 1000} = {}) { // jshint ignore:line
		return Bluebird.resolve()
			.then(() => {
				if (!url) {
					throw new ParameterError('URL has to be provided for the ApiRequest');
				}
				if (!token) {
					throw new ParameterError('token has to be provided for the ApiRequest');
				}
				let requestPromise = rateLimiter.executing({url, token, resolveWithFullResponse: true})
					.then((response) => {
						if (response.headers && (response.headers['X-Riot-Deprecated'] || response.headers['x-riot-deprecated'])) {  // jshint ignore:line
							const removalTimestamp = response.headers['X-Riot-Deprecated'] || response.headers['x-riot-deprecated']; // jshint ignore:line
							const removalDate = new Date(parseInt(removalTimestamp));

							console.warn(url.replace(/\?.*/, '') + ' is deprecated and will be removed on ' + removalDate.toString()); // jshint ignore:line
						}
						return response;
					});
				if (!resolveWithFullResponse) {
					requestPromise = requestPromise.then(response => {
						try {
							return JSON.parse(response.body);
						} catch (e) {
							return response.body;
						}
					});
				}

				return requestPromise.catch(err => {
					// retry on 503 or 500
					if (numRetriesLeft > 0 && (err.statusCode === 503 || err.statusCode === 500)) {
						numRetriesLeft--;
						return Bluebird
							.delay(intervalRetryMS)
							.then(() => ApiRequest.executing(url, { // TODO: unit test
								token,
								rateLimiter,
								resolveWithFullResponse,
								numRetriesLeft,
								intervalRetryMS: intervalRetryMS * 2 // backing off exponentially
							}));
					}
					// console.log(JSON.stringify(err, null, 2));
					throw err;
				});
			});
	}
}

module.exports = ApiRequest;