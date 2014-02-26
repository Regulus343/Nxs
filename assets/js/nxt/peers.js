var downloadingDeadlines = [];
var uploadingDeadlines   = [];

function addPeer(peer, type) {
	var source = $('#peer-template').html();
	if (source !== undefined) {
		var template = Handlebars.compile(source);

		//abbreviate peer variable
		var p = peer;

		//set default peer values
		p.filters = "all";

		//set address type
		if (p.wellKnown) {
			p.addressTypeClass  = "well-known";
			p.addressType       = "Well-Known Address";
			p.filters          += " well-known";
		} else {
			if (p.announcedAddress.length)
				p.addressTypeClass = "enabled-announced-address";
			else
				p.addressTypeClass = "disabled-announced-address";

			p.addressType  = "Announced Address";
			p.filters     += " announced";
		}

		//set active status
		if (type == "active")
			p.active = true;
		else
			p.active = false;

		//set connected state
		if (peer.disconnected) {
			p.state      = Language.get('labels.disconnected');
			p.stateClass = "disconnected";
		} else {
			p.state      = Language.get('labels.connected');
			p.stateClass = "connected";
		}

		//set announced address
		if (p.announcedAddress.length > 20)
			p.announcedAddressFormatted = p.announcedAddress.substr(0, 20) + "...";
		else
			p.announcedAddressFormatted = p.announcedAddress;

		//set weight
		p.weightClass = p.weight ? "enabled-weight" : "disabled-weight";
		p.weight      = formatWeight(p.weight);

		//format bytes for downloaded and uploaded volumes
		p.downloadedFormatted = bytesToSize(p.downloaded);
		p.uploadedFormatted   = bytesToSize(p.uploaded);

		p.downloadedTitleText = Language.get('labels.downloaded') + ': ' + p.downloaded + ' B';
		p.uploadedTitleText   = Language.get('labels.uploaded')   + ': ' + p.uploaded   + ' B';

		//set remove action title text
		p.removeTitleText = p.disconnected ? Language.get('messages.removeFromList') : Language.get('messages.disconnectRemoveFromList');

		//get HTML markup for template and append it
		var html = template(p);

		$('#' + type + '-peers').append(html);

		$('#' + type + '-peers .peer-' + p.index + ' td.actions span.remove').click(function(){
			requestPeerRemoving($(this).parents('tr').attr('data-index'));
		});

		//update peers counter
		updateCounter('peers', type);

		//reset scrollable area
		$('#peers .scrollable').scroller('reset');

		return true;
	}

	log('Failed to load peer template');

	return false;
}

function addPeers(peers, type) {
	var p;
	for (p = 0; p < peers.length; p++) {
		addPeer(peers[p], type);
	}

	log('Adding peers: ' + peers.length);

	checkNoItemsForSectionFilter('peers', type + '-peers-section');

	adjustPageTabContent();
}

function changePeer(peer, type) {
	try {
		var row = $('tr.peer-' + peer.index);

		if (peer.connected) {
			row.find('td.connection-state-cell')
				.addClass('connected')
				.removeClass('disconnected')
				.attr('title', Language.get('labels.connected'));

			row.find('td.actions .remove').attr('title', Language.get('messages.disconnectRemoveFromList'));
		}

		if (peer.disconnected) {
			row.find('td.connection-state-cell')
				.addClass('disconnected')
				.removeClass('connected')
				.attr('title', Language.get('labels.disconnected'));

			row.find('td.actions .remove').attr('title', Language.get('messages.removeFromList'));
		}

		if (peer.weight) {
			if (peer.weight > 0)
				row.find('td.icon-weight').addClass('enabled-weight').removeClass('disabled-weight');
			else
				row.find('td.icon-weight').addClass('enabled-weight').removeClass('disabled-weight');

			row.find('td.weight').text(formatWeight(peer.weight));
		}

		if (peer.downloaded) {
			downloadingDeadlines[peer.index] = (new Date()).getTime() + 1000;

			row.find('td.icon-downloaded').addClass('enabled-downloading');
			row.find('td.downloaded')
				.text(bytesToSize(peer.downloaded))
				.attr('title', Language.get('labels.downloaded') + ': ' + p.downloaded + ' B');
		}

		if (peer.uploaded) {
			uploadingDeadlines[peer.index] = (new Date()).getTime() + 1000;

			row.find('td.icon-uploaded').addClass('enabled-uploading');
			row.find('td.uploaded')
				.text(bytesToSize(peer.uploaded))
				.attr('title', Language.get('labels.uploaded')   + ': ' + p.uploaded   + ' B');
		}
	} catch(e) {}
}

function changePeers(peers, type) {
	var i;
	for (i = 0; i < peers.length; i++) {
		changePeer(peers[i], type);
	}
}

function formatVolume(volume) {
	var digits=[], formattedVolume = "", i;

	do {
		digits[digits.length] = volume % 10;
		volume = Math.floor(volume / 10);
	} while (volume > 0);

	for (i = 0; i < digits.length; i++) {
		if (i > 0 && i % 3 == 0)
			formattedVolume = config.thousandsSeparator + formattedVolume;

		formattedVolume = digits[i] + formattedVolume;
	}

	return formattedVolume + " B";
}

function formatWeight(weight) {
	var digits=[], formattedWeight = "", i;

	weight = isNaN(weight) ? 0 : weight;

	do {
		digits[digits.length] = weight % 10;
		weight = Math.floor(weight / 10);
	} while (weight > 0);

	for (i = 0; i < digits.length; i++) {
		if (i > 0 && i % 3 == 0)
			formattedWeight = config.thousandsSeparator + formattedWeight;

		formattedWeight = digits[i] + formattedWeight;
	}

	return formattedWeight;
}

function initializePeers() {
	setInterval(function() {
		var i, time = (new Date()).getTime(), element;

		for (i = 0; i < downloadingDeadlines.length; i++) {
			if (downloadingDeadlines[i] > 0 && downloadingDeadlines[i] <= time) {
				$('#peers table.items tr.peer-' + i + ' td.downloading').addClass('disabled-downloading');

				downloadingDeadlines[i] = 0;
			}
		}

		for (i = 0; i < uploadingDeadlines.length; i++) {
			if (uploadingDeadlines[i] > 0 && uploadingDeadlines[i] <= time) {
				$('#peers table.items tr.peer-' + i + ' td.uploading').addClass('disabled-uploading');

				uploadingDeadlines[i] = 0;
			}
		}
	}, 100);
}

function removePeer(peer, type) {
	$('#' + type + '-peers tr.peer-' + peer.index).remove();

	updateCounter('peers', type);
}

function removePeers(peers, type) {
	var i;
	for (i = 0; i < peers.length; i++) {
		removePeer(peers[i], type);
	}
}

function requestPeerRemoving(index) {
	Api.sendUiRequest('removeActivePeer', {peer: index});
}