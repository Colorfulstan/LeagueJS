LeagueJS
========

A Javascript Wrapper for the League of Legends API.
Originated from [ClaudioWilson/LeagueJS](https://github.com/claudiowilson/LeagueJS) but after a complete rework now published under leaguejs and using RIOT API V3

Note: Tournament API is not included at this time

## 2.0 breaking changes

* v4 endpoints now are mandatory
* removed deprecated methods

## Table of Content
- [Quickstart](#quickstart)
- [Library Structure](#library-structure)
	- [Naming conventions](#naming-conventions)
	- [Endpoints](#endpoints)
	- [Static Data](#static-data)
	- [Utility methods](#utility-methods)
- [Environment Variables](#environment-variables)
- [Rate Limiting](#rate-limiting)
- [Request retries](#request-retries)
- [Caching](#caching)
- [Developer](#developer)

### Quickstart
```
npm install leaguejs --save
```

```js
// setting default platformId to be used if you don't specify it on the endpoint method
process.env.LEAGUE_API_PLATFORM_ID = 'euw1'

const LeagueJS = require('../lib/LeagueJS.js');
const leagueJs = new LeagueJS(process.env.LEAGUE_API_KEY);

leagueJs.Summoner
	.gettingByName('EldoranDev')
	.then(data => {
		'use strict';
		console.log(data);
	})
	.catch(err => {
		'use strict';
		console.log(err);
	});

leagueJs.Summoner
	.gettingByAccount(22177292, 'euw')
	.then(data => {
		'use strict';
		console.log(data);
	})
	.catch(err => {
		'use strict';
		console.log(err);
	});
```

### Library Structure

#### Naming conventions
Endpoints and their methods are named in alignment to the [API documentation](https://developer.riotgames.com/api-methods/).

Methods returning a promise are named in present progressive (gettingXY) while synchronous methods are called in present tense (getXY)

#### Endpoints
Each Endpoint is located in it's own class, accessible by its name on the leagueJs object.
```js
leagueJs.Challenges
leagueJs.Champion
leagueJs.ChampionMastery
leagueJs.League
leagueJs.LolStatus
leagueJs.Masteries
leagueJs.Match
leagueJs.Runes
leagueJs.Spectator
leagueJs.StaticData
leagueJs.Summoner
```

#### Static Data
LeagueJS uses DataDragonHelper for StaticData handling.

NOTE: code using LeagueJS 1.9.x or earlier should check their usage of StaticData.gettingChampions, as the returned properties have changed.
All other StaticData methods can be used as dropin-replacement without any code changes.

LeagueJS provides the DataDragonHelper class to handle DataDragon files.
Please also refer to the [module readme](/lib/DataDragon/README.md) and the respective [unit-tests](/test/DataDragonHelper.test.js)
for additional usage info.

By default, DataDragonHelper will store DDragonFiles within it's own module-directory.
To prevent this you can either set the appropriate path during instantiation
```js
const leagueJs = LeagueJS(process.env.LEAGUE_API_KEY, {STATIC_DATA_ROOT: ...});
```

or use the setup method within StaticData

```js
// DataDragonHelper will use the provided path to store the downloaded files
// you have multiple possibilities to set the path

leagueJs.StaticData.setup('absolute/path/for/files')
leagueJs.StaticData.setup('./relative/path/for/files')
leagueJs.StaticData.setup([__dirname, '../', 'pathSegments', 'to/be/resolved'])

// to enable logging to the console, pass `true` as second parameter
// (otherwise you'll need to add listeners to respective leagueJs.DataDragonHelper.events)
leagueJs.StaticData.setup('absolute/path/for/files', true)
```

#### Utility methods
Utility methods are located within ```/lib/util``` separated into thematic groups. They can be accessed in 2 ways:
```js
const LeagueJSUtil = api.util
const Util = require('leaguejs/lib/util')
```

All Utility methods are implemented as static and pure functions

### Environment Variables

*LEAGUE_API_PLATFORM_ID* The value of this environmental variable will be used as default platformId. If not provided, 'na1' is used.

Alternatively they can be provided to the League constructor within the options parameter
```js
const leagueJs = new League(<Your Api key>, {PLATFORM_ID: <default api region>})
```

We recommend you read the API key from your environment variables too and pass that to the LeagueJS constructor

```
const leagueJs = new League(process.env.LEAGUE_API_KEY)
```

### Rate Limiting
Rate limiting will be handled for you by default using [RiotRateLimiter-node](https://github.com/Colorfulstan/RiotRateLimiter-node).
Code created with LeagueJS < 1.5.0 should not be affected other then that the default limiting strategy now is SPREAD
(see [RiotRateLimiter-node docs](https://github.com/Colorfulstan/RiotRateLimiter-node#choosing-the-right-strategy) for details.), which means your code might execute slower then before.

You can change the limiting strategy in two ways:
```js
const leagueJs = require('../lib/LeagueJS.js');

// passing in allowBursts: true on instantiation

const api = new LeagueJS(process.env.LEAGUE_API_KEY, {
	limits: {allowBurst: true}
});

// updating the limiter
api.updateRateLimiter({allowBursts: true})
```

### Request retries
By default, we will retry requests to the API that respond with 500, 503
and 429 that are not caused by the API-edge servers (so missing additional information about retry and limits).

Up to 3 retries will be done by default, starting at a timeout of 1000 MS.

First retry will be done with the timeout given in config.limits.intervalRetryMS.

All subsequent retries will be done with a timeout of 2* the previous one (so with initial intervalRetryMS of 1000 it
will be 1000, 2000, 4000 MS for the first 3 retries respectively.

You can configure this behaviour by passing the relevant options into the LeagueJS constructor on instantiation:
```js
const LeagueJS = require('../lib/LeagueJS.js');
const api = new LeagueJS(process.env.LEAGUE_API_KEY, {
	limits: {
		'allowBursts': false,

		// maximum amount of retries done when encountering 429 without retry-after header or 503 / 500
		'numMaxRetries': 3,

		// starting retry backoff time on RIOT service overload (not related to API key limits)
		// will be increased exponentially with every retry
		'intervalRetryMS': 1000,

		// per default, retry is enabled on all endpoints
		// pass in an Array with the Names of the Endpoints you want to ENABLE retries on
		// if you see the need.
		// See [Endpoints](#Endpoints) above
		'retryEndpoints': LeagueJS.util.EndpointUtil.getEndpointNames()
	}
});
```


### Caching

By default, caching is disabled.

If enabled, the default caching is using node-cache with the request-urls as caching-key
The easiest way to setup caching is to pass a minimum set of caching options to LeagueJS on instantiation

```js
const leagueJs = new LeagueJS({
	...
	caching: {
			isEnabled: true, // enable basic caching
			defaults: {stdTTL: 120} // add a TTL to all Endpoints you think is appropriate (you can tune it later per Endpoint)
		}
	...
})
```

You can setup caching globally or on an Endpoint basis
```js
// replacing Cache-options within Summoner endpoint (overwrites global options for that Endpoint)
leagueJs.Summoner.setCache({ stdTTL: 120})

leagueJs.Summoner.enableCaching();
leagueJs.Summoner.disableCaching();

// Set caching options for all endpoints (overwrites previously set options)
leagueJs.setCache({ stdTTL: 120}, MyCache)
leagueJs.setCache({ stdTTL: 120})
leagueJs.enableCaching();
leagueJs.disableCaching();
```

Options not explicitly set use following defaults (found in ```/lib/Config.js```)
```js
{
	/** the standard ttl as number in seconds for every generated cache element.
	 * (default: 0)
	 * */
	stdTTL: 0,

	/**
	 * The period in seconds, as a number, used for the automatic delete check interval.
	 * 0 = no periodic check.
	 * (default: 600)
	 */
	checkperiod: 600,

	/**
	 * en/disable throwing or passing an error to the callback if attempting to .get a missing or expired value.
	 * (default: false)
	 */
	errorOnMissing: false,

	/**
	 * en/disable cloning of variables. If true you'll get a copy of the cached variable.
	 * If false you'll save and get just the reference.
	 * Note: true is recommended, because it'll behave like a server-based caching.
	 * You should set false if you want to save mutable objects or other complex types
	 * with mutability involved and wanted.
	 */
	useClones: true
}

```

You can set your own Caching implementation if you like
**NOTE: make sure the public interface of your caching implementation is the same as node-cache uses to prevent incompatibilities.**

```js
const MyCache = require('myCache')

// replacing Cache during instantiation (for all endpoints)
const leagueJs = new LeagueJS({
	...
	caching: {
			isEnabled: true, // enable caching
			constructor: MyCache, // set a custom Caching implementation
		},
	...
	})


// replacing Cache globally (overwrites previously set options on endpoints)
leagueJs.setCache({ stdTTL: 120}, MyCache)

// replacing Cache within specific endpoint (overwrites global options for that Endpoint)
leagueJs.Summoner.setCache({ stdTTL: 120}, MyCache)
```

# Developer

## LeagueJS Gulp Commands
// TODO: propably rework this doc-part

Gulp.js is a streaming build system. Thanks to it's simplicity and code-over-configuration
we are able to create a simple, efficient and more intuitive build process.

### To get started you need to install Gulp.js globally:
- `npm install -g gulp`

#### Available gulp commands and their descriptions:

- [] TODO: check if all are working and update description if neccessary

Run JSLint on all js files:

- `gulp lint`

Run BDD tests:

- `gulp test`

Run istabul to generate a code coverage report:

- `gulp test-coverage`

Run plato to generate a code analysis report:

- `gulp code-report`

Runs both istanbul and plato in with one command:

- `gulp reports`

Removes both coverage and report directories created by istanbul and plato

- `gulp clean-reports`

Sets up a development environment that will watch for code changes then run JSLint and BDD tests upon saving:

- `gulp dev`
