#Index

**Modules**

* [periodicjs.ext.backup](#periodicjs.ext.module_backup)
* [backupController](#module_backupController)
* [exportbackup](#module_exportbackup)
* [restorebackup](#module_restorebackup)

**Functions**

* [download_backup(req, res)](#download_backup)
* [import_upload(req, res)](#import_upload)
* [index(req, res)](#index)
* [removebackupDirectory(asyncCallBack)](#removebackupDirectory)
* [createBackupStatusfile(asyncCallBack)](#createBackupStatusfile)
* [createDBSeed(asyncCallBack)](#createDBSeed)
* [createZipArchieveOfBackupDirectory(asyncCallBack)](#createZipArchieveOfBackupDirectory)
* [createBackupDirectory(asyncCallBack)](#createBackupDirectory)
* [exportBackup(options, exportBackupCallback)](#exportBackup)
* [copybackupFiles(asyncCallBack)](#copybackupFiles)
* [getBackupStatus(asyncCallBack)](#getBackupStatus)
* [removeBackupArchieveZip(asyncCallBack)](#removeBackupArchieveZip)
* [upzipArchieve(asyncCallBack)](#upzipArchieve)
* [restoreBackup(options, restoreBackupCallback)](#restoreBackup)
 
<a name="periodicjs.ext.module_backup"></a>
#periodicjs.ext.backup
An extension to import json backups into periodic mongodb.

**Params**

- periodic `object` - variable injection of resources from current periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_backupController"></a>
#backupController
backup controller

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - backup  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_exportbackup"></a>
#exportbackup
exportbackup module

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - backup  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_restorebackup"></a>
#restorebackup
restorebackup module

**Params**

- resources `object` - variable injection from current periodic instance with references to the active logger and mongo session  

**Returns**: `object` - backup  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="download_backup"></a>
#download_backup(req, res)
exports backups via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with backup download  
<a name="import_upload"></a>
#import_upload(req, res)
upload post controller for backups uplaoded via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with backup page  
<a name="index"></a>
#index(req, res)
uploads backups via admin interface

**Params**

- req `object`  
- res `object`  

**Returns**: `object` - responds with backup page  
<a name="removebackupDirectory"></a>
#removebackupDirectory(asyncCallBack)
remove backup directory and leave zip

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="createBackupStatusfile"></a>
#createBackupStatusfile(asyncCallBack)
outputs json file of backup options and status, and periodic version

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="createDBSeed"></a>
#createDBSeed(asyncCallBack)
outputs a db seed

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="createZipArchieveOfBackupDirectory"></a>
#createZipArchieveOfBackupDirectory(asyncCallBack)
creates zip archieve of backup directory

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="createBackupDirectory"></a>
#createBackupDirectory(asyncCallBack)
create the back up directory, if there are assets, put the authors in the

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="exportBackup"></a>
#exportBackup(options, exportBackupCallback)
exports a database backup to disk

**Params**

- options `object` - filepath,limits-tags,collections,etc  
- exportBackupCallback `object`  

**Returns**: `function` - async callback exportBackupCallback(err,results);  
<a name="copybackupFiles"></a>
#copybackupFiles(asyncCallBack)
copy the backup files

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="getBackupStatus"></a>
#getBackupStatus(asyncCallBack)
get back up status, to figure out what to restore

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="removeBackupArchieveZip"></a>
#removeBackupArchieveZip(asyncCallBack)
remove backup zip

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="upzipArchieve"></a>
#upzipArchieve(asyncCallBack)
unzips backup zip archieve

**Params**

- asyncCallBack `function`  

**Returns**: `function` - async callback asyncCallBack(err,results);  
<a name="restoreBackup"></a>
#restoreBackup(options, restoreBackupCallback)
imports backup data into the database

**Params**

- options `object` - upsert,jsondata  
- restoreBackupCallback `object`  

**Returns**: `function` - async callback restoreBackupCallback(err,results);  
