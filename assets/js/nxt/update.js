var nxtVersion;
var nxtLatestVersion;
var nxtLatestHash;
var nxtLatestFileUrl;

var installedVersion;
var normalVersion = {};
var betaVersion = {};
var downloadedVersion = {};
var responses = 0;

function updateResponseCount() {
	responses++;
	if (responses == 3) {
		compareVersions();   
	}
}

function compareVersions() {
	var installVersusNormal, installVersusBeta;

	//TO TEST, SET THIS TO A FAKE VERSION TO TRIGGER UPDATE
	//installedVersion = '0.4.7';

	if (installedVersion) {
		if (normalVersion && normalVersion.versionNr) {
			installVersusNormal = versionCompare(installedVersion, normalVersion.versionNr);
		}
		if (betaVersion && betaVersion.versionNr) {
			installVersusBeta = versionCompare(installedVersion, betaVersion.versionNr);
		}
		
		if (installVersusNormal == -1 && installVersusBeta == -1) {
			document.getElementById('explanation_4').style.display = 'inline';
		} else if (installVersusBeta == -1) {
			document.getElementById('explanation_3').style.display = 'inline';
		} else if (installVersusNormal == -1) {
			document.getElementById('explanation_2').style.display = 'inline';
		} else {
			document.getElementById('explanation_1').style.display = 'inline';
		}
	} else {
		document.getElementById('explanation_5').style.display = 'inline';
	}

	document.getElementById('explanation').style.display = 'block';
}

function load() {
	if ((typeof File !== 'undefined') && !File.prototype.slice) {
		if (File.prototype.webkitSlice) {
			File.prototype.slice = File.prototype.webkitSlice;
		}

		if (File.prototype.mozSlice) {
			File.prototype.slice = File.prototype.mozSlice;
		}
	}

	// Check for the various File API support.
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob || !File.prototype.slice || !window.Worker) {
		alert('File APIs are not fully supported in this browser. Please use latest Mozilla Firefox or Google Chrome.');
	}

	//get Current version
	sendRequest('getState', function(response) {
		if (response.version) {
			installedVersion = response.version;
			document.getElementById('current_version').innerHTML = response.version;
		} else {
			document.getElementById('current_version').innerHTML = 'Could not detect current version, try again.';
		}

		updateResponseCount();
	});

	//Get latest version nr+hash of normal version
	sendRequest('getAliasURI&alias=nrsversion', function(response) {
		if (response.uri && (response = parseAlias(response.uri))) {
			normalVersion.versionNr = response[0];
			normalVersion.hash = response[1];

			document.getElementById('normal_version').innerHTML = normalVersion.versionNr;
		} else {
			document.getElementById('normal_version').innerHTML = 'Could not load, try again.';
		}

		updateResponseCount();
	});
	
	//Get latest version nr+hash of beta version
	sendRequest('getAliasURI&alias=nrsbetaversion', function(response) {
		if (response.uri && (response = parseAlias(response.uri))) {
			betaVersion.versionNr = response[0];
			betaVersion.hash = response[1];

			document.getElementById('beta_version').innerHTML = betaVersion.versionNr;
			document.getElementById('beta_version').style.display = 'block';
		}

		updateResponseCount();
	});

	//clicking on dropzone is the same as selecting a file from the file input..
	document.getElementById('drop_zone').onclick = function () {
		document.getElementById('files').click();
		return false;
	};
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

function handleFileSelect(evt) {    
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

	$('#nxt-hash-check-target .progress').css('width', '0%').removeClass('hidden');

	var worker = new Worker('assets/js/worker-sha256.js');

	log('Verifying SHA-256 hash for Nxt zip archive...');

	worker.onmessage = function(e) {
		if (e.data.progress) {
			$('#nxt-hash-check-target .progress').animate({width: e.data.progress + '%'}, 150);
		} else {
			$('#nxt-hash-check-target .progress').css('width', '0%').addClass('hidden');

			if (e.data.sha256 == nxtLatestHash) {
				$('#nxt-hash-check-target').removeClass('incorrect').addClass('verified');
				$('#nxt-hash-check-target .message').text(Language.get('messages.hashVerified'));
				$('#nxt-hash-check-target .icon')
					.removeClass('icon-question')
					.removeClass('icon-spam')
					.addClass('icon-checkmark-circle');

				log('SHA-256 hash verified: ' + e.data.sha256);
			} else {
				$('#nxt-hash-check-target').removeClass('verified').addClass('incorrect');
				$('#nxt-hash-check-target .message').text(Language.get('messages.hashIncorrect'));
				$('#nxt-hash-check-target .icon')
					.removeClass('icon-question')
					.removeClass('icon-checkmark-circle')
					.addClass('icon-spam');

				log('SHA-256 hash incorrect: ' + e.data.sha256 + ' / ' + nxtLatestHash);
			}
		}
	};

	worker.postMessage({file: files[0]});
}

function parseAlias(alias) {
	return alias.split(" ");
}

//https://gist.github.com/TheDistantSea/8021359 (based on)
function versionCompare(v1, v2) {
	var v1last = v1.slice(-1);
	var v2last = v2.slice(-1);

	if (v1last == 'e') {
		v1 = v1.substring(0, v1.length-1);
	} else {
		v1last = '';
	}

	if (v2last == 'e') {
		v2 = v2.substring(0, v2.length-1);
	} else {
		v2last = '';
	}

	var v1parts = v1.split('.');
	var v2parts = v2.split('.');

	function isValidPart(x) {
		return /^\d+$/.test(x);
	}

	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	v1parts = v1parts.map(Number);
	v2parts = v2parts.map(Number);

	for (var i = 0; i < v1parts.length; ++i) {
		if (v2parts.length == i) {
			return 1;
		}
		if (v1parts[i] == v2parts[i]) {
			continue;
		} else if (v1parts[i] > v2parts[i]) {
			return 1;
		} else {
			return -1;
		}
	}

	if (v1parts.length != v2parts.length) {
		return -1;
	}

	if (v1last && v2last) {
		return 0;
	} else if (v1last) {
		return 1;
	} else if (v2last) {
		return -1;
	} else {
		return 0;
	}
}

function sendRequest(requestParameters, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", "nxt?requestType=" + requestParameters + "&" + Math.random());
	
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			callback(response);
		}
	};
	request.send();
}

function downloadNxtClient(normal) {
	//download file to iframe
	$('#hash-frame').attr('src', nxtLatestFileUrl);

	//setup drag and drop listeners
	var dropZone = document.getElementsByTagName('html')[0];
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);

	document.getElementById('hash-files').addEventListener('change', handleFileSelect, false);

	return false;
}