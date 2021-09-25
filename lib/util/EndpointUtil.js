const fs = require('fs');
const path = require('path');

class EndpointUtil {

	/** Returns names of all implemented Endpoints */
	static getEndpointNames() {
		let endpointPath = path.resolve(__dirname, '../endpoints');
		let filenames = fs.readdirSync(endpointPath);
		return filenames.map(filename => filename.replace('Endpoint.js', ''));
	}

	static buildQueryStringFromOptions(options) {
		let paramsArray = Object.keys(options).map(optionKey => {
			const option = options[optionKey];
			if(typeof option === 'undefined'){
				return '';
			}

			if (option === null || option === void 0) {return;}

			if (Array.isArray(option)) {
				return option.map(v => {
					return `${optionKey}=${v}`;
				}).join('&');
			} else {
				return `${optionKey}=${option}`;
			}
		}).filter(str => !!str);
		return paramsArray.join('&');
	}

}

module.exports = EndpointUtil;