# periodicjs.ext.replication

replication your current instance of periodic to a zip archieve containing your configurations, content, themes, and database via ssh.

 [API Documentation](https://github.com/typesettin/periodicjs.ext.replication/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.ext.replication
```

## Usage

### replicate another periodic application via sssh

```
$ node index.js --cli --extension replication --task replicate --repenv production
```

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