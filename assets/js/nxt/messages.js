var messages = new Array();
var d        = new Date("November 24, 2013 12:00:00 UTC");
var ms       = d.getTime();

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function showMessages(message) {
	messages.push(message);
	messages.sort(sortMessages);

	var html = '';

	for (var i=0; i<messages.length; i++) {
		var message = messages[i];

		if (message.sender == document.getElementById('account').value) {
			html+= '<b>To: ' + message.recipient + '</b><br />';
		} else {
			html += '<b>From: ' + message.sender + '</b><br />';
		}

		html += '<i>Time: ' + new Date(ms + message.time*1000) + '</i><br />';
		html += '<p>' + escapeHtml(convertFromHex(message.message)) + '</p>';

		html += '<hr />';
	}

	document.getElementById('messages').innerHTML = html;
}

function sortMessages(a, b) {
	return b.time - a.time;
}
function receiveMessages(form) {
	messages = new Array();

	document.getElementById('load').disabled = true;
	document.getElementById('load').value = 'Loading... Please wait.';

	var url = '/nxt?requestType=getAccountTransactionIds&account=' + document.getElementById('account').value + '&timestamp=0';

	url += '&r=' + Math.random();

	var request = new XMLHttpRequest();
	request.open("GET", url, false);
	request.send();

	var result = JSON.parse(request.responseText);

	document.getElementById('messages').innerHTML = '';

	if (result.transactionIds && result.transactionIds.length > 0) {
		for (var i=result.transactionIds.length-1; i>=0; i--) {
			sendRequest('getTransaction&transaction=' + result.transactionIds[i], function(response) {
				if (response.type == 1 && response.subtype == 0 && response.attachment && response.attachment.message) {
					showMessages({sender: response.sender, recipient: response.recipient, time: response.timestamp, message: response.attachment.message});
				}
			});
		}
	}

	document.getElementById('load').disabled = false;
	document.getElementById('load').value = 'Load';
	return false;
}

function sendMessage(form) {
	document.getElementById('submit').disabled = true;
	document.getElementById('submit').value = 'Submitting... Please wait.';

	var url = '/nxt?';
	for (i = 0; i < form.elements.length; i++) {
		if (!form.elements[i].name) {
			continue;
		}
		if (!url.endsWith('?')) {
			url += '&';
		}
		url += encodeURIComponent(form.elements[i].name);
		url += '=';
		if (form.elements[i].name == 'message') {
			url += encodeURIComponent(convertToHex(form.elements[i].value));
		} else {
			url += encodeURIComponent(form.elements[i].value);
		}
	}
	url += '&r=' + Math.random();    
	var request = new XMLHttpRequest();
	request.open("GET", url, false);
	request.send();
	var result = JSON.stringify(JSON.parse(request.responseText), null, 4);
	document.getElementById('result').innerHTML = result;
	document.getElementById('submit').disabled = false;
	document.getElementById('submit').value = 'Submit';
	return false;
}

/*function sendRequest(requestParameters, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", "nxt?requestType=" + requestParameters + "&" + Math.random());
	
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			callback(response);
		}
	};
	request.send();
}*/

function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function convertFromHex(hex) {
	var hex = hex.toString();//force conversion
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

function convertToHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}
	return hex;
}