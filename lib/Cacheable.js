const ParameterError = require('./errors/ParameterError');

/**
 * Riot API Endpoint
 */
class Cacheable {

	constructor(config) {
		if (!config){
			throw new ParameterError('Cacheable needs a config');
		}
		this.config = Object.assign({}, config);
		if (this.config.caching.isEnabled) {this.setCache(this.config.caching.defaults);}
	}

	enableCaching(options = this.config.caching.defaults, Constructor = this.config.caching.constructor) {
		this.config.caching.isEnabled = true;
		this.setCache(options, Constructor);
	}

	disableCaching() {
		this.config.caching.isEnabled = false;
		this.cache = null;
	}

	setCache(options, Constructor = this.config.caching.constructor) {
		if (!options) {
			throw new Error('options are required to set a new cache');
		}
		this.config.caching.constructor = Constructor;
		this.cache = new Constructor(options);
	}

	flushCache() {
		if(this.cache) {this.cache.flushAll();}
	}
}

module.exports = Cacheable;