## Usage
```
const DataDragonHelper = require('leaguejs/lib/DataDragonHelper/DataDragonHelper')
DataDragonHelper.storageRoot = [__dirname, '../', '/whatever/path]

DataDragonHelper.gettingItemList()
```

## setup
This module can be used right out of the box.

However, files that are downloaded, will be stored in the package's directory,
unless you set the path acchordingly:

```
// setting the download path
DataDragonHelper.storageRoot = path.resolve(__dirname, '../path/to/files')
```

Files will be stored within
```
// example: [...]/en_US/8.14.1
/path/to/files/<locale>/<version>
```

Best way to familiarise yourself with the behaviour is to go through
the unit-tests related to file download and storagePath.

## Events
Events are emited through `DataDragonHelper.events` for being able to react to newly downloaded files
(e.g. to get notification emails when a new version was downloaded) or errors.
Direct logging is omitted unless it's crucial. If you want to get logs from this module,
listen to the respective logging events.
See DataDragonHelper.eventIds for available events.

## Relation to LeagueJS

You don't need to use LeagueJS if you don't need it, you can simply require
this module on it's own.

It currently is not released as standalone package, because it relies on some utility
methods within LeagueJS, and depending on the whole LeagueJS library just for that would be
a bit overkill.

If you think externalising the Utility classes of LeagueJS would be a good idea,
please open an issue for that.

## Things to note
* Old downloads are currently not cleaned up.
* Downloads are all or nothing, meaning when a locale-version pair is downloaded,
all relevant json files will be downloaded. If a folder for the respective version already exists,
the version is skipped.
* This module evolved from internal usage that was adapted to be suitable for publication
while not breaking internal code. If you have notes on needed improvements
in terms of clarity / redundancies, please open an issue.