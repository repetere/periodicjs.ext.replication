'use strict';
var async = require('async'),
	fs = require('fs-extra'),
	path = require('path'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	archiver = require('archiver'),
	seedController,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger;

var d = new Date(),
	defaultBackupZipFilename = 'periodicbackup' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime(),
	defaultOutputDirpath = path.resolve(process.cwd(), 'content/files/backups/'),
	defaultBackupDir = path.join(defaultOutputDirpath, '/.tempbackup'),
	defaultBackupZipFilepath,
	backupthemes = true,
	backupconfigcontent = true,
	backuppublicdir = true,
	backupdatabase = true,
	filterRegexFunction = function (file) {
		var returnValTest = file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/node_modules\/(?:(?!(?:\/|^)\.).)*?)$).*$/) && file.match(/^(?!^(?:(?:(?!(?:\/|^)\.).)*?\/content\/files\/backups\/(?:(?!(?:\/|^)\.).)*?)$).*$/);
		if (returnValTest) {
			return true;
		}
		else {
			return false;
		}
	};


/**
 * remove backup directory and leave zip
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var removebackupDirectory = function (asyncCallBack) {
	fs.remove(path.join(defaultBackupDir, defaultBackupZipFilename), asyncCallBack);
};

/**
 * outputs json file of backup options and status, and periodic version
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createBackupStatusfile = function (asyncCallBack) {
	var backupstatus = {},
		backupstatusfile = path.join(defaultBackupDir, defaultBackupZipFilename) + '/backup.json';
	fs.readJson(path.resolve(process.cwd(), 'package.json'), function (err, packageJSON) {
		if (err) {
			asyncCallBack(err);
		}
		else {
			backupstatus.backupinfo = {
				backupdatabase: backupdatabase,
				backupconfigcontent: backupconfigcontent,
				backupthemes: backupthemes,
				backuppublicdir: backuppublicdir,
			};
			backupstatus.packageJSON = packageJSON;
			fs.outputJson(backupstatusfile, backupstatus, function (err) {
				asyncCallBack(err);
			});
		}
	});
};

/**
 * outputs a db seed
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createDBSeed = function (asyncCallBack) {
	seedController.exportSeed({
		filepath: path.join(defaultBackupDir, defaultBackupZipFilename) + '/backupseed.json',
	}, asyncCallBack);
};

/**
 * creates zip archieve of backup directory
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createZipArchieveOfBackupDirectory = function (asyncCallBack) {
	//https://github.com/ctalkington/node-archiver/blob/master/examples/pack-zip.js
	fs.ensureDirSync(defaultOutputDirpath);
	var output = fs.createWriteStream(path.join(defaultOutputDirpath, defaultBackupZipFilename + '.zip'));
	var archive = archiver('zip');
	archive.pipe(output);
	archive.bulk([{
		expand: true,
		cwd: path.join(defaultBackupDir, defaultBackupZipFilename),
		src: ['**'],
		dest: defaultBackupZipFilename
	}]).finalize();

	output.on('close', function () {
		logger.silly('archiver has been finalized and the output file descriptor has closed.');
		asyncCallBack(null, archive.pointer() + ' total bytes')
	});

	archive.on('error', function (err) {
		asyncCallBack(err, null);
		// throw err;
	});
};

/**
 * create the back up directory, if there are assets, put the authors in the
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var createBackupDirectory = function (asyncCallBack) {
	var contentDir = path.resolve(process.cwd(), 'content/'),
		publicDir = path.resolve(process.cwd(), 'public/'),
		backupContentDir = path.resolve(defaultBackupDir, defaultBackupZipFilename, 'content'),
		backupPublicDir = path.resolve(defaultBackupDir, defaultBackupZipFilename, 'public');
	async.series({
		ensuredir: function (cb) {
			fs.ensureDir(defaultBackupDir, cb);
		},
		copycontent: function (cb) {
			fs.copy(contentDir, backupContentDir, filterRegexFunction, cb);
		},
		copypublicdir: function (cb) {
			fs.copy(publicDir, backupPublicDir, filterRegexFunction, cb);
		}
	}, asyncCallBack);
};

/**
 * exports a database backup to disk
 * @param  {object} options - filepath,limits-tags,collections,etc
 * @param  {object} exportBackupCallback
 * @return {Function} async callback exportBackupCallback(err,results);
 */
var exportBackup = function (options, exportBackupCallback) {
	try {
		defaultBackupZipFilename = (typeof options.filename === 'string') ? options.filename : defaultBackupZipFilename;
		defaultBackupZipFilepath = (typeof options.filepath === 'string') ? path.resolve(options.filepath) : path.join(defaultBackupDir, defaultBackupZipFilename);
		defaultOutputDirpath = (typeof options.outputpath === 'string') ? path.resolve(options.outputpath) : path.resolve(defaultOutputDirpath);
	}
	catch (e) {
		exportBackupCallback(e);
	}

	async.series([
			createBackupDirectory,
			createDBSeed,
			createBackupStatusfile,
			createZipArchieveOfBackupDirectory,
			removebackupDirectory
		],
		function (err, exportbackupresult) {
			exportBackupCallback(err, {
				createBackupDirectory: exportbackupresult.createBackupDirectory,
				createDBSeed: exportbackupresult.createDBSeed,
				createBackupStatusfile: exportbackupresult.createBackupStatusfile,
				createZipArchieveOfBackupDirectory: exportbackupresult.createZipArchieveOfBackupDirectory,
				removebackupDirectory: exportbackupresult.removebackupDirectory,
				defaultBackupZipFilepath: defaultBackupZipFilepath,
				defaultBackupZipFilename: defaultBackupZipFilename + '.zip'
			});
		});
};

/**
 * exportbackup module
 * @module exportbackup
 * @{@link https://github.com/typesettin/periodicjs.ext.backup}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           backup
 */
var exportBackupModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	seedController = require('../../periodicjs.ext.dbseed/controller/dbseed')(resources);
	return {
		exportBackup: exportBackup,
		// createBackups: createBackups,
		// writeBackupToDisk: writeBackupToDisk
	};
};

module.exports = exportBackupModule;
