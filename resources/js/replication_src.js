'use strict';

var componentTab1,
	contentEntryModule = require('./../../../periodicjs.ext.admin/resources/js/contententry'),
	contententry,
	tabelement,
	backuppathInput,
	backuppathDisplayInput,
	previousbackupInput,
	assetidInput,
	existingbackuplist,
	importstatusoutputel,
	backupcustomstatusoutputel,
	importBackupSelectionEl,
	importFormContainer,
	exampleBackupSelect,
	ComponentTabs = require('periodicjs.component.tabs');

var useExistingBackupListener = function (e) {
	backuppathInput.value = e.target.value;
	backuppathDisplayInput.value = e.target.value;
	previousbackupInput.value = 'usepreviousbackup';
	importBackupSelectionEl.style.display = 'none';
	importFormContainer.style.display = 'block';
};


var tabEvents = function () {
	componentTab1.on('tabsShowIndex', function ( /*index*/ ) {
		// codemirrortab(index);
	});
};


window.showImportStatusResult = function () {
	document.getElementById('importstatuscontainer').style.display = 'block';
	importstatusoutputel.innerHTML = 'Importing backup data';
};

window.displayImportBackupStatus = function (ajaxFormResponse) {
	// console.log(ajaxFormResponse);
	importstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
};


window.displayCustomBackupStatus = function (ajaxFormResponse) {
	// console.log(ajaxFormResponse);
	backupcustomstatusoutputel.innerHTML = JSON.stringify(ajaxFormResponse, null, 2);
};

window.handleAjaxError = function (errormessage) {
	if (errormessage === 'Origin is not allowed by Access-Control-Allow-Origin') {
		window.location.reload();
	}
};

window.addEventListener('load', function () {
	backuppathInput = document.getElementById('backuppath');
	previousbackupInput = document.getElementById('previousbackup');
	backuppathDisplayInput = document.getElementById('backuppathdisplay');
	assetidInput = document.getElementById('assetid');
	tabelement = document.getElementById('tabs');
	exampleBackupSelect = document.getElementById('example-backup-select');
	importFormContainer = document.getElementById('importFormContainer');
	existingbackuplist = document.getElementById('existingbackuplist');
	importstatusoutputel = document.getElementById('backupimportstatus');
	importBackupSelectionEl = document.getElementById('importBackupSelection');
	backupcustomstatusoutputel = document.getElementById('backupcustomstatus');
	window.ajaxFormEventListers('._pea-ajax-form');
	// exampleBackupSelect.addEventListener('change', exapmleBackupSelectEventHandler, false);
	if (tabelement) {
		componentTab1 = new ComponentTabs(tabelement);
	}
	contententry = new contentEntryModule({
		// ajaxFormToSubmit: document.getElementById('edit-collection-form'),
		mediafileinput: document.getElementById('upload-backup_button'),
		uploadmediaCallback: function (mediadoc) {
			backuppathInput.value = mediadoc.fileurl;
			backuppathDisplayInput.value = mediadoc.fileurl;
			assetidInput.value = mediadoc._id;
			importBackupSelectionEl.style.display = 'none';
			importFormContainer.style.display = 'block';
			// console.log('uploadmediaCallback mediadoc', mediadoc);
		}
	});
	if (existingbackuplist) {
		existingbackuplist.addEventListener('change', useExistingBackupListener, false);
	}
	tabEvents();
});
