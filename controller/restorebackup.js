'use strict';

var async = require('async'),
	path = require('path'),
	fs = require('fs-extra'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	Decompress = require('decompress'),
	defaultRestoreDir = path.resolve(process.cwd(), 'content/files/backups/.restoretemp'),
	npmhelper = require(path.resolve(process.cwd(), 'scripts/npmhelper'))({}),
	backuparchievefile,
	backupfoldername,
	removeBackupArchieve = false,
	backupFileStatus = {},
	backupSeedFileJSON = {},
	seedController,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	d = new Date(),
	defaultExportFileName = 'dbemptybackup' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime() + '.json';

var retstartApplication = function (asyncCallBack) {
	CoreUtilities.run_cmd('pm2', ['restart', 'periodicjs'], function (text) {
		console.log(text);
		asyncCallBack(null, 'restarted app with pm2');
	});
};

/**
 * remove the restore folder
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var removeBackupdirectory = function (asyncCallBack) {
	fs.remove(path.resolve(defaultRestoreDir, backupfoldername), asyncCallBack);
};

/**
 * installing the missing extensions
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var installMissingNodeModules = function (asyncCallBack) {
	async.waterfall([
		npmhelper.getInstalledExtensions,
		npmhelper.getMissingExtensionsFromConfig,
		npmhelper.installMissingExtensions,
		npmhelper.installMissingNodeModules,
		npmhelper.getThemeName,
		npmhelper.installThemeModules
	], asyncCallBack);
};

/**
 * restore the db by wiping and then importing seed
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var restoreDBSeed = function (asyncCallBack) {
	async.series([
		function (exportdbcallback) {
			seedController.exportSeed({
				filepath: 'content/files/dbseeds/' + defaultExportFileName,
			}, exportdbcallback);
		},
		function (wipedbcallback) {
			seedController.emptyDB({}, wipedbcallback);
		},
		function (getseedfilecallback) {
			fs.readJson(path.resolve(defaultRestoreDir, backupfoldername, 'backupseed.json'),
				function (err, backupSeedFileStatusJSON) {
					if (err) {
						getseedfilecallback(err);
					}
					else {
						backupSeedFileJSON = backupSeedFileStatusJSON;
						getseedfilecallback(null, 'got backup json status');
					}
				});
		},
		function (importrestorecallback) {
			seedController.importSeed({
				jsondata: backupSeedFileJSON,
				encryptpassword: false,
				insertsetting: 'upsert'
			}, importrestorecallback);
		}
	], asyncCallBack);
};

/**
 * copy the backup files
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var copybackupFiles = function (asyncCallBack) {
	var contentDir = path.resolve(process.cwd(), 'content/'),
		publicDir = path.resolve(process.cwd(), 'public/'),
		backupContentDir = path.resolve(defaultRestoreDir, backupfoldername, 'content'),
		backupPublicDir = path.resolve(defaultRestoreDir, backupfoldername, 'public');
	async.parallel({
		copyconfigcontent: function (cb) {
			if (backupFileStatus.backupinfo && backupFileStatus.backupinfo.backupconfigcontent) {
				fs.copy(backupContentDir, contentDir, cb);
			}
			else {
				cb(null, 'do not copy content dir');
			}
		},
		copypublicfiles: function (cb) {
			if (backupFileStatus.backupinfo && backupFileStatus.backupinfo.backuppublicdir) {
				fs.copy(backupPublicDir, publicDir, cb);
			}
			else {
				cb(null, 'do not copy public dir');
			}
		}
	}, asyncCallBack);
};

/**
 * get back up status, to figure out what to restore
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var getBackupStatus = function (asyncCallBack) {
	backupfoldername = path.basename(backuparchievefile, '.zip');
	fs.readJson(path.resolve(defaultRestoreDir, backupfoldername, 'backup.json'),
		function (err, backupFileStatusJSON) {
			if (err) {
				asyncCallBack(err);
			}
			else {
				backupFileStatus = backupFileStatusJSON;
				// console.log(backupFileStatus);
				asyncCallBack(null, 'got backup json status');
			}
		});
};

/**
 * remove backup zip
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var removeBackupArchieveZip = function (asyncCallBack) {
	if ((removeBackupArchieve && typeof removeBackupArchieve === 'string' && removeBackupArchieve === 'true') || removeBackupArchieve === true) {
		fs.remove(backuparchievefile, asyncCallBack);
	}
	else {
		asyncCallBack(null, 'do not remove backup archieve');
	}
};

/**
 * unzips backup zip archieve
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var upzipArchieve = function (asyncCallBack) {
	fs.ensureDirSync(defaultRestoreDir);
	var decompress = new Decompress()
		.src(backuparchievefile)
		.dest(defaultRestoreDir)
		.use(Decompress.zip());

	decompress.run(function (err, files) {
		if (err) {
			asyncCallBack(err);
		}
		else {
			asyncCallBack(null, 'unzipped: ' + backuparchievefile);
		}
	});
	// backuparchievefile
};

/**
 * imports backup data into the database
 * @param  {object} options - upsert,jsondata
 * @param  {object} restoreBackupCallback
 * @return {Function} async callback restoreBackupCallback(err,results);
 */
var restoreBackup = function (options, restoreBackupCallback) {
	try {
		backuparchievefile = path.resolve(options.file);
		removeBackupArchieve = (typeof options.removebackup === 'string') ? options.removebackup : removeBackupArchieve;
		async.series({
			upzipArchieve: upzipArchieve,
			removeBackupArchieveZip: removeBackupArchieveZip,
			getBackupStatus: getBackupStatus,
			copybackupFiles: copybackupFiles,
			restoreDBSeed: restoreDBSeed,
			installMissingNodeModules: installMissingNodeModules,
			removeBackupdirectory: removeBackupdirectory,
			retstartApplication: retstartApplication
		}, function (err, restoringStatus) {
			restoreBackupCallback(
				err, {
					upzipArchieve: restoringStatus.upzipArchieve,
					removeBackupArchieveZip: restoringStatus.removeBackupArchieveZip,
					copybackupFiles: restoringStatus.copybackupFiles,
					restoreDBSeed: 'restored db',
					installMissingNodeModules: restoringStatus.installMissingNodeModules,
					removeBackupdirectory: restoringStatus.removeBackupdirectory,
					retstartApplication: restoringStatus.retstartApplication
				});
		});
	}
	catch (e) {
		restoreBackupCallback(e);
	}
};

/**
 * restorebackup module
 * @module restorebackup
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
var restoreBackupModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	seedController = require('../../periodicjs.ext.dbseed/controller/dbseed')(resources);

	return {
		restoreBackup: restoreBackup,
	};
};

module.exports = restoreBackupModule;
