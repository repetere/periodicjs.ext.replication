'use strict';

var Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	Extensions = require('periodicjs.core.extensions'),
	Connection = require('ssh2'),
	CronJob = require('cron').CronJob,
	fs = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	cronparser = require('cron-parser'),
	moment = require('moment'),
	croninterval,
	CoreUtilities,
	CoreController,
	CoreExtension,
	appSettings,
	mongoose,
	logger,
	restoreController,
	replicationconffilepath,
	replicationSettings,
	nextReplicationCron,
	repFromEnvironment,
	defaultbackupdir = path.resolve(process.cwd(), 'content/files/backups'),
	remotefiletodownload,
	localfiletosave = path.resolve(process.cwd(), 'content/files/backups/replicationsnapshot.zip');

/**
 * restore the downloaded zip file and remove it when done
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var restoreFromReplicationBackup = function (asyncCallBack) {
	logger.silly('now restore back up from replication');
	restoreController.restoreBackup({
		file: localfiletosave,
		removebackup: true
	}, asyncCallBack);
};

/**
 * connect via SSH using get the replication settings, then generate a backup file saved in content/files/backsups/replicationsnapshot.zip
 * @param  {object} replicationSettings replication settings from json config file
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var getReplicationData = function (replicationSettings, asyncCallBack) {
	try {
		var conn = new Connection(),
			downloadProgressStatus = function (downloaded, chunk, total) {
				console.log('downloaded', Math.floor((downloaded / total) * 100), '%', 'total', total, 'bytes');
				if (downloaded === total) {
					logger.info('Replication downloaded: ' + total + 'bytes');
				}
			},
			downloadReplicationBackup = function () {
				conn.sftp(function (err, sftp) {
					if (err) {
						asyncCallBack(err);
					}
					else {
						fs.ensureDirSync(defaultbackupdir);
						remotefiletodownload = path.join(replicationSettings.webAppPath, 'content/files/backups/replicationsnapshot.zip');
						sftp.fastGet(remotefiletodownload, localfiletosave, {
								step: downloadProgressStatus
							},
							function (err) {
								if (err) {
									asyncCallBack(err);
								}
								else {
									console.log('stfp :: exit ::');
									logger.info('downloaded replication data');
									logger.info('Replication download complete: ' + new Date().toString());
									asyncCallBack(null);
									conn.end();
								}
							});
					}
				});
			},
			onShell1 = function () {
				conn.exec('cd ' + replicationSettings.webAppPath + ' && ls && NODE_ENV='+repFromEnvironment+' node index.js --cli --extension backup --task backup --filename replicationsnapshot', function (err, stream) {
					if (err) {
						asyncCallBack(err);
					}
					else {
						stream.on('exit', function (code, signal) {
							console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
							downloadReplicationBackup();
							// asyncCallBack(null, 'Stream :: exit :: code: ' + code + ', signal: ' + signal);
						});
						stream.on('close', function () {
							console.log('Stream :: close');
						});
						stream.on('data', function (data) {
							console.log('STDOUT: ' + data);
						});
						stream.stderr.on('data', function (data) {
							console.log('STDERR: ' + data);
						});
						stream.on('end', function () {
							console.log('Stream :: end');
						});
						stream.on('error', function (err) {
							asyncCallBack(err);
						});
					}
				});
			};
		conn.connect(replicationSettings);
		conn.on('ready', function () {
			console.log('Connection :: readys');
			conn.shell(onShell1);
		});
		conn.on('error', function (err) {
			asyncCallBack(err);
		});
		conn.on('end', function () {
			asyncCallBack(null, 'got replication');
		});
	}
	catch (e) {
		asyncCallBack(e);
	}
};

/**
 * get the replication settings from the replicateFromEnvironment look up settings in config file
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,replicationSettings);
 */
var getReplicationConfig = function (replicateFromEnvironment, asyncCallBack) {
	fs.readJson(replicationconffilepath, function (err, confJson) {
		if (err) {
			asyncCallBack(err, null);
		}
		else {
			try {
				replicationSettings = confJson.environment[replicateFromEnvironment];
				if (replicationSettings.privateKey) {
					replicationSettings.privateKey = fs.readFileSync(path.resolve(replicationSettings.privateKey));
				}
				asyncCallBack(null, replicationSettings);
			}
			catch (e) {
				asyncCallBack(e, null);
			}
		}
	});
};

/**
 * replicate periodic
 * @param  {object} options environment - which environment to replicate from
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var replicate_periodic = function (options, asyncCallBack) {
	var environment = options.environment;
	repFromEnvironment = options.environment;

	async.waterfall([
		function (cb) {
			cb(null, environment);
		},
		getReplicationConfig,
		getReplicationData,
		restoreFromReplicationBackup
	], function (err, results) {
		logger.info('Replication completed successfully');
		asyncCallBack(err, results);
	});
};

/**
 * upload custom seed controller for seeds posted via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with dbseed page
 */
var run_replication = function (req, res) {
	var replicationOptions = CoreUtilities.removeEmptyObjectValues(req.body);

	console.time('Replication Status Data');
	replicate_periodic({
			environment: replicationOptions.replicationenvironmentlist
		},
		function (err, result) {
			console.timeEnd('Replication Status Data');
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					res: res,
					req: req,
					renderView: 'home/index',
					responseData: {
						pagedata: {
							title: 'Replication Status',
						},
						data: result,
						user: req.user
					}
				});
			}
		});
};


/**
 * uploads replications via admin interface
 * @param  {object} req
 * @param  {object} res
 * @return {object} responds with replication page
 */
var index = function (req, res) {
	var appenvironment = appSettings.application.environment;
	async.waterfall([
		function (cb) {
			fs.readJson(replicationconffilepath, cb);
		},
		function (replicationSettingsJson, cb) {
			CoreController.getPluginViewDefaultTemplate({
					viewname: 'p-admin/replication/index',
					themefileext: appSettings.templatefileextension,
					extname: 'periodicjs.ext.replication'
				},
				function (err, templatepath) {
					cb(err, {
						templatepath: templatepath,
						replicationsettingsjson: replicationSettingsJson
					});
				});
		}
	], function (err, result) {
		CoreController.handleDocumentQueryRender({
			res: res,
			req: req,
			err: err,
			renderView: result.templatepath,
			responseData: {
				pagedata: {
					title: 'Application Replication',
					headerjs: ['/extensions/periodicjs.ext.replication/js/replication.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				periodic: {
					version: appSettings.version
				},
				replicationsettingsjson: result.replicationsettingsjson,
				nextreplication: nextReplicationCron,
				nextreplicationformatted: moment(nextReplicationCron).format('MMMM Do YYYY, h:mm:ss a'),
				nextreplicationfromnow: moment(nextReplicationCron).fromNow(),
				currentenv: appenvironment,
				user: req.user
			}
		});
	});
};

/**
 * runs cron to replication
 * @todo use: https://github.com/thomseddon/cronstring/ at some point
 */
var run_replication_cron = function () {
	var replicationCronSettings,
		appenvironment = appSettings.application.environment;

	try {
		fs.readJson(replicationconffilepath, function (err, replicationsettingsJSON) {
			if (err) {
				logger.error('REPLICATION CRON INVALID CONFIGURATION ERROR');
				logger.error(err);
				console.error(err);
			}
			else if (replicationsettingsJSON.cron && replicationsettingsJSON.cron[appenvironment]) {
				replicationCronSettings = replicationsettingsJSON.cron[appenvironment];
				croninterval = cronparser.parseExpression(replicationCronSettings.replicationcron);
				nextReplicationCron = croninterval.next();
				logger.info('Replication Cron Job Settings', replicationCronSettings.replicationcron);
				logger.info('Next Replication Cron :', nextReplicationCron.toString());
				var job = new CronJob({
					cronTime: replicationCronSettings.replicationcron,
					onTick: function () {
						console.time('replication task');
						replicate_periodic({
								environment: replicationCronSettings.replicationfrom
							},
							function (err, result) {
								console.timeEnd('replication task');
								if (err) {
									logger.error(err.stack.toString());
									logger.error(err.toString());
								}
								else {
									logger.info('replication result', result);
									nextReplicationCron = croninterval.next();
									logger.info('Next Replication Cron :', nextReplicationCron.toString());
								}
							});

					},
					onComplete: function () {
							logger.silly('replication cron ran');
						} //,
						// start: true
						// timeZone: "America/Los_Angeles"
				});
				// logger.silly(job);
				job.start();
			}
			else {
				logger.info('No Replication Cron Settings for: ' + appenvironment);
			}
		});
	}
	catch (e) {
		logger.error('REPLICATION SETTING CRON ERROR');
		logger.error(e);
		console.error(e);
	}
};

/**
 * replication controller
 * @module replicationController
 * @{@link https://github.com/typesettin/periodicjs.ext.replication}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           replication
 */
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	CoreExtension = new Extensions(appSettings);
	replicationconffilepath = path.join(CoreExtension.getconfigdir({
		extname: 'periodicjs.ext.replication'
	}), 'settings.json');
	restoreController = require('../../periodicjs.ext.backup/controller/restorebackup')(resources);

	run_replication_cron();
	return {
		index: index,
		replicate_periodic: replicate_periodic,
		run_replication: run_replication,
	};
};

module.exports = controller;
