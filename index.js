'use strict';
var path = require('path');
/**
 * An extension to import json replications into periodic mongodb.
 * @{@link https://github.com/typesettin/periodicjs.ext.replication}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.replication
 * @param  {object} periodic variable injection of resources from current periodic instance
 */
module.exports = function (periodic) {
	// express,app,logger,config,db,mongoose
	var replicationRouter = periodic.express.Router(),
		replicationController = require('./controller/replication')(periodic);

	for (var x in periodic.settings.extconf.extensions) {
		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.admin') {
			replicationRouter.post('/restorereplication', replicationController.restore_replication);
			replicationRouter.post('/downloadreplication', replicationController.download_replication);
			replicationRouter.get('/', replicationController.index);
		}
	}

	periodic.app.use('/p-admin/replication', replicationRouter);
};
