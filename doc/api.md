#Index

**Modules**

* [periodicjs.ext.replication](#periodicjs.ext.module_replication)
* [replicationController](#module_replicationController)

**Functions**

* [restoreFromReplicationBackup(asyncCallBack)](#restoreFromReplicationBackup)
* [getReplicationData(replicationSettings, asyncCallBack)](#getReplicationData)
* [getReplicationConfig(asyncCallBack)](#getReplicationConfig)
* [replicate_periodic(options, asyncCallBack)](#replicate_periodic)
* [run_replication(req, res)](#run_replication)
* [index(req, res)](#index)
* [run_replication_cron()](#run_replication_cron)
 
<a name="periodicjs.ext.module_replication"></a>
#periodicjs.ext.replication
An extension to import json replications into periodic mongodb.

**Params**

- periodic `object` - variable injection of resources from current periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_replicationController"></a>
#replicationController
replication controller

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - replication  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="restoreFromReplicationBackup"></a>
#restoreFromReplicationBackup(asyncCallBack)
restore the downloaded zip file and remove it when done

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getReplicationData"></a>
#getReplicationData(replicationSettings, asyncCallBack)
connect via SSH using get the replication settings, then generate a backup file saved in content/files/backsups/replicationsnapshot.zip

**Params**

- replicationSettings `object` - replication settings from json config file  
- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getReplicationConfig"></a>
#getReplicationConfig(asyncCallBack)
get the replication settings from the replicateFromEnvironment look up settings in config file

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,replicationSettings);  
<a name="replicate_periodic"></a>
#replicate_periodic(options, asyncCallBack)
replicate periodic

**Params**

- options `object` - environment - which environment to replicate from  
- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="run_replication"></a>
#run_replication(req, res)
upload custom seed controller for seeds posted via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with dbseed page  
<a name="index"></a>
#index(req, res)
uploads replications via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with replication page  
<a name="run_replication_cron"></a>
#run_replication_cron()
runs cron to replication

