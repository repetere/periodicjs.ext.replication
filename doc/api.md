#Index

**Modules**

* [periodicjs.ext.replication](#periodicjs.ext.module_replication)
* [replicationController](#module_replicationController)

**Functions**

* [restoreFromReplicationBackup(asyncCallBack)](#restoreFromReplicationBackup)
* [getReplicationData(asyncCallBack)](#getReplicationData)
* [getReplicationConfig(asyncCallBack)](#getReplicationConfig)
* [replicate_periodic(asyncCallBack)](#replicate_periodic)
* [index(req, res)](#index)
 
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
#getReplicationData(asyncCallBack)
get the replication backup file zip file

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getReplicationConfig"></a>
#getReplicationConfig(asyncCallBack)
get the replication settings

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="replicate_periodic"></a>
#replicate_periodic(asyncCallBack)
replicate periodic

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="index"></a>
#index(req, res)
uploads replications via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with replication page  
