# periodicjs.ext.replication

replication your current instance of periodic to a zip archieve containing your configurations, content, themes, and database.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.replication/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.replication
```

## Usage

### import database (upsert/update) with custom file replication from cli

```
$ node index.js --cli --extension replication --task replication [--filename optionalreplicationzipname --outputpath optionaloutputdirectory]
```

### export database to replication file replication from cli

```
$ node index.js --cli --extension replication --task export --file /path/to/file.json
```

If no file path is specified, the default file path is `content/files/replications/replications/replication-[year]-[month]-[day]-[timestamp].json`

##Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt watch
```
$ grunt watch
```
For generating documentation
```
$ grunt doc
$ jsdoc2md controller/**/*.js index.js install.js uninstall.js > doc/api.md
```
##Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation
* example replication: clear && node index.js --cli --extension replication --task replication --filename myreplication --outputpath ~/Downloads/myperiodicreplication