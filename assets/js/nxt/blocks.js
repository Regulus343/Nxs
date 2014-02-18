var deadline = 0;

function addBlock(block, type) {
	var source = $('#block-template').html();
	if (source !== undefined) {
		var template = Handlebars.compile(source);

		//abbreviate block variable
		var b = block;

		//set default block values
		b.filters = "all";

		//set forger, amount, and fee
		b.forger      = b.generator;
		b.forgerClass = b.forger == account ? "me" : "standard";

		b.totalAmount = b.totalAmount !== undefined ? b.totalAmount : 0;
		b.totalFee    = b.totalFee    !== undefined ? b.totalFee    : 0;

		//set sender and recipient URLs
		b.forgerUrl = config.accountUrl.replace('[accountId]', b.forger);

		//set transaction URL
		b.id = b.block;
		b.blockUrl = config.blockUrl.replace('[blockId]', b.id);

		//set timestamps
		b.timestamp          = new Date(Date.UTC(2013, 10, 24, 12, 0, 0, 0) + b.timestamp * 1000);
		b.formattedTimestamp = moment(b.timestamp).format('MMMM Do YYYY, h:mm:ss a');
		b.readableTimestamp  = moment(b.timestamp).fromNow();

		//set number of transactions
		b.numberOfTransactions = b.numberOfTransactions ? b.numberOfTransactions : 0;

		//set confirmed/unconfirmed filters
		if (b.numberOfTransactions)
			b.filters += " with-transactions";
		else
			b.filters += " without-transactions";

		//format bytes for payload length
		b.payloadLengthFormatted = bytesToSize(b.payloadLength);

		//get HTML markup for template and append it
		var html = template(b);

		$('#' + type + '-blocks').append(html);

		//update blocks counter
		updateCounter('blocks', type);

		//reset scrollable area
		$('#blocks .scrollable').scroller('reset');

		return true;
	}

	log('Failed to load block template');

	return false;
}

function addBlocks(blocks, type) {
	var b;
	for (b = 0; b < blocks.length; b++) {
		addBlock(blocks[b], type);
	}

	log('Adding blocks: ' + blocks.length);

	checkNoItemsForSectionFilter('blocks', type + '-blocks-section');

	adjustWidgetTabContent();
}

function formatDeadline(deadline) {
	if (deadline <= 3) {
		return "a few seconds";
	}
	var d, h, m, s;
	s = deadline % 60;
	m = ((deadline - s) / 60) % 60;
	h = ((deadline - s - m * 60) / 3600) % 24;
	d = (deadline - s - m * 60 - h * 3600) / 86400;
	s = s > 0 ? (s + " second" + (s > 1 ? "s" : "")) : "";
	m = m > 0 ? (m + " minute" + (m > 1 ? "s" : "")) : "";
	h = h > 0 ? (h + " hour" + (h > 1 ? "s" : "")) : "";
	d = d > 0 ? (d + " day" + (d > 1 ? "s" : "")) : "";
	deadline = d + " " + h + " " + m + " " + s;
	while (deadline.indexOf("  ") >= 0) {
		deadline = deadline.replace("  ", " ");
	}
	while (deadline.charAt(0) == " ") {
		deadline = deadline.substr(1);
	}
	while (deadline.charAt(deadline.length - 1) == " ") {
		deadline = deadline.substr(0, deadline.length - 1);
	}
	return deadline;
}

function formatTimestamp(timestamp) {
	return (new Date(Date.UTC(2013, 10, 24, 12, 0, 0, 0) + timestamp * 1000)).toLocaleString();
}

function formatVolume(volume) {
	var digits=[], formattedVolume = "", i;
	do {
		digits[digits.length] = volume % 10;
		volume = Math.floor(volume / 10);
	} while (volume > 0);
	for (i = 0; i < digits.length; i++) {
		if (i > 0 && i % 3 == 0) {
			formattedVolume = "'" + formattedVolume;
		}
		formattedVolume = digits[i] + formattedVolume;
	}
	return formattedVolume + " B";
}

function initializeBlocks() {
	setInterval(function() {
		var i = deadline - (new Date()).getTime();

		$('#generation-time strong').html(formatDeadline(Math.round(i / 1000)));
		$('#generation-time').removeClass('hidden');
	}, 1000);
}

function removeBlock(block, type) {
	var i, element;
	for (i = 0; i < 8; i++) {
		element = document.getElementById("block" + block.index + "_" + i);
		if (element != null) {
			document.getElementById(type + "blocks").deleteRow(element.rowIndex);
		}
	}

	updateCounter('blocks', type);
}

function removeBlocks(blocks, type) {
	var i;
	for (i = 0; i < blocks.length; i++) {
		removeBlock(blocks[i], type);
	}
}

function setDeadline(deadline) {
	this.deadline = (new Date()).getTime() + deadline * 1000;
}