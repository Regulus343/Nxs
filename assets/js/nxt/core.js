var user                           = Math.random();
var numberOfPendingRequests        = 0;
var account                        = false;
var balance                        = 0;

var widgetIds                      = ["transactions", "peers", "blocks", "accounts"];
var widgetToggleClassNames         = ["Transactions", "Peers", "Blocks", "Accounts"];

var advancedWidgetIds              = ["library", "shops", "assetExchange", "reputation"];
var advancedWidgetToggleClassNames = ["Library", "Shops", "AssetExchange", "Reputation"];

var selectedAssetId;

function initialize() {
	//load language data
	Language.load();

	//load Foundation
	$(document).foundation();

	//prevent hyperlinks without a hyper reference from refreshing browser
	$('a').each(function(){
		if ($(this).attr('href') == "") {
			$(this).click(function(e){
				e.preventDefault();
			});
		}
	});

	//request initial data
	setTimeout(function(){
		sendRequest("getInitialData");
		log('Getting initial data...');
	}, 1000);

	//automatically unlock account if secret phrase config variable is set
	if (config.secretPhrase !== false) {
		setTimeout(function(){
			sendRequest("unlockAccount&secretPhrase=" + config.secretPhrase);
		}, 1000);
	} else {
		$('#modal-unlock-account').foundation('reveal', 'open');
		setTimeout(function(){
			focusSecretPhrase();
		}, 250);
	}

	//set secret phrase hint if secret phrase config variable is set
	if (config.secretPhraseHint !== false && config.secretPhraseHint.length > 0) {
		$('.secret-phrase-hint span.hint').html(config.secretPhraseHint);
		$('.secret-phrase-hint').removeClass('hidden');
	}

	//hide double-click message on "Send" dialog if config variable is not set
	if (! config.sendRequireDoubleClick)
		$('#send-double-click').addClass('hidden');

	//initialize navigation bar
	initializeNavBar();

	//initialize toggles
	initializeToggles();

	//initialize collapsible sections
	initializeCollapsibleSections();

	//initialize tab sections
	initializeTabSections();

	//initialize lock/unlock account functions
	initializeLockUnlockAccount();

	//initialize secret phrase field functions
	initializeSecretPhraseFields();

	//initialize modal actions
	initializeModalActions();

	//set up number fields
	$('input[type="number"]').each(function(){
		if ($(this).val() == "")
			$(this).val('0');
	}).focus(function(){
		if ($(this).val() == "0")
			$(this).val('');
	}).blur(function(){
		if ($(this).val() == "")
			$(this).val('0');
	}).keyup(function(){
		if ($(this).attr('data-positive-number') && parseFloat($(this).val()) < 0)
			$(this).val('0');
	});

	$('#send').click(function(){
		setTimeout(function(){
			$('#send-recipient').focus();
		}, 250);
	});

	$('input.amount').each(function(){
		var amount = parseFloat($(this).val());

		$(this).val(amount.toFixed(8));
	}).change(function(){
		var amount = parseFloat($(this).val());
		if (amount > balance)
			amount = balance;

		$(this).val(amount.toFixed(8));
	}).keyup(function(){
		var amount = parseFloat($(this).val());
		if (amount > balance) {
			amount = balance;
			$(this).val(amount.toFixed(8));
		}
	});

	$('input.fee').val(config.defaultFee.toFixed(8));

	$('input.deadline').each(function(){
		$(this).val(1);
	}).change(function(){
		var deadline = parseInt($(this).val());
		if (deadline > 24)
			deadline = 24;

		if (deadline < 1)
			deadline = 1;

		$(this).val(deadline);
	}).keyup(function(){
		var deadline = parseInt($(this).val());
		if (deadline > 24)
			deadline = 24;

		if (deadline < 1)
			deadline = 1;

		$(this).val(deadline);
	});

	adjustDeadlineTime();

	//set up account QR code action
	$('#account').click(function(){
		if (account !== false) {
			$('#modal-qr-code').foundation('reveal', 'open');
			$('#qr-code').html('').qrcode('nxtacct:' + account);
			$('#modal-qr-code h3.account-number').text(account);
		}
	});

	//initialize peers
	initializePeers();

	//initialize blocks
	initializeBlocks();

	//adjust widgets
	adjustWidgets();

	$('.scrollable').scroller();
	setTimeout(function(){
		$('#peers .scrollable').scroller('reset');
	}, 1250);

	$(window).resize(function(){
		adjustWidgetTabContent();
	});

	setInterval(function(){
		$('.loading span.dots').each(function(){
			if ($(this).text() == "") {
				$(this).text('.');
			} else if ($(this).text() == ".") {
				$(this).text('..');
			} else if ($(this).text() == "..") {
				$(this).text('...');
			} else {
				$(this).text('');
			}
		});
	}, 750);

	//initialize key commands
	initializeKeyCommands();

	//refresh readable timestamps every minute
	var refreshReadableTimestamps = setInterval("refreshReadableTimestamps();", 60000);
}

function initializeNavBar() {
	$('.top-bar-section ul.left li.hidden').each(function(){
		$(this).next('li.divider').addClass('hidden');
	});

	$('.top-bar-section').hide().removeClass('hidden').fadeIn();
}

function initializeLockUnlockAccount() {
	$('#unlock').click(function(){
		setTimeout(function(){
			focusSecretPhrase();
		}, 250);
	});

	$('#lock').click(function(e){
		e.preventDefault();

		sendRequest("lockAccount");
	});
}

function initializeSecretPhraseFields() {
	$('.show-secret-phrase').click(function(){
		if (! $(this).prop('checked')) {
			var secretPhrase = $(this).parents('div.reveal-modal').find('input.secret-phrase-visible').val();
			$(this).parents('div.reveal-modal').find('input.secret-phrase').val(secretPhrase);

			$('.secret-phrase-visible').addClass('hidden');
			$('.secret-phrase').removeClass('hidden').focus();
		} else {
			var secretPhrase = $(this).parents('div.reveal-modal').find('input.secret-phrase').val();
			$(this).parents('div.reveal-modal').find('input.secret-phrase-visible').val(secretPhrase);

			$('.secret-phrase').addClass('hidden');
			$('.secret-phrase-visible').removeClass('hidden').focus();
		}
	});

	if (config.secretPhraseFieldDefaultVisible) {
		$('.show-secret-phrase').prop('checked', true);

		$('.show-secret-phrase').each(function(){
			var secretPhrase = $(this).parents('div.reveal-modal').find('input.secret-phrase').val();
			$(this).parents('div.reveal-modal').find('input.secret-phrase-visible').val(secretPhrase);
		});

		$('.secret-phrase').addClass('hidden');
		$('.secret-phrase-visible').removeClass('hidden').focus();
	}

	$('.secret-phrase, .secret-phrase-visible').change(function(){
		$(this).parents('.row').find('.secret-phrase-char-counter').text($(this).val().length);
	}).keyup(function(){
		$(this).parents('.row').find('.secret-phrase-char-counter').text($(this).val().length);
	});
}

function focusSecretPhrase() {
	if ($('#unlock-show-secret-phrase').prop('checked'))
		$('#unlock-secret-phrase-visible').focus();
	else
		$('#unlock-secret-phrase').focus();
}

function clearSecretPhrase() {
	$('.secret-phrase').val('');
	$('.secret-phrase-visible').val('');
}

function initializeModalActions() {
	initializeCipherMenus();

	initializeModalUnlockAccount();

	initializeModalAuthorizeAccount();

	initializeModalSend();
}

function initializeModalUnlockAccount() {
	$('#modal-unlock-account').keypress(function(e){
		var code = e.keyCode || e.which;
		if(code == 13)
			unlockAccount();
	});

	$('#unlock-account').click(function(){
		unlockAccount();
	});

	$('#generate-secret-phrase').click(function(){
		var secretPhrase = generateSecretPhrase();

		$(this).parents('.row').find('.secret-phrase').val(secretPhrase);
		$(this).parents('.row').find('.secret-phrase-visible').val(secretPhrase);

		$(this).parents('.row').find('.secret-phrase-char-counter').text(secretPhrase.length);
	});
}

function initializeModalAuthorizeAccount() {
	$('#authorize').click(function(){
		setTimeout(function(){
			$('#website').focus().val($('#website').val());
		}, 250);
	});

	$('#modal-authorize-account').keypress(function(e){
		var code = e.keyCode || e.which;
		if(code == 13)
			generateAuthorizationToken();
	});

	$('#authorize-account').click(function(){
		generateAuthorizationToken();
	});

	$('#modal-account-authorized .ok').click(function(){
		$('#modal-account-authorized').foundation('reveal', 'close');
	});
}

function initializeModalSend() {
	adjustDeadlineTime();

	$('#send-deadline').keyup(function(){
		adjustDeadlineTime();
	}).change(function(){
		adjustDeadlineTime();
	});

	$('#send-deadline-time').click(function(){
		$('#send-deadline').focus();
	});

	$('#modal-send').keypress(function(e){
		var code = e.keyCode || e.which;
		if(code == 13)
			sendMoney();
	});

	var eventType = config.sendRequireDoubleClick ? "dblclick" : "click";
	$('#send-confirm').on(eventType, function(){
		sendMoney();
	});
}

function initializeCipherMenus() {
	var listItems = "";
	for (k in Cipher.keys) {
		listItems += '<li>' + k + '</li>';
	}

	$('.select-cipher-menu').html(listItems);

	$('.select-cipher-menu li').off('click').on('click', function(){
		var key = $(this).text();

		if ($(this).parents('.form').find('.show-secret-phrase').prop('checked'))
			var secretPhrase = $(this).parents('.row').find('.secret-phrase-visible').val();
		else
			var secretPhrase = $(this).parents('.row').find('.secret-phrase').val();

		var translated = Cipher.translate(secretPhrase, key);

		$(this).parents('.row').find('.secret-phrase').val(translated);
		$(this).parents('.row').find('.secret-phrase-visible').val(translated);

		$(this).parents('.select-cipher-menu').fadeOut();
	});

	$('.select-cipher').off('click').on('click', function(){
		var menu = $(this).parents('.row').find('.select-cipher-menu');
		if (menu.css('display') == "none")
			menu.fadeIn('fast');
		else
			menu.fadeOut();
	});
}

function initializeToggles() {
	$('.toggle').click(function(e){
		var toggleId = $(this).attr('data-toggle-id');

		if ($('#' + toggleId).hasClass('hidden')) {
			$('#' + toggleId).removeClass('hidden');

			$('li[data-toggle-nav="'+toggleId+'"]').addClass('active');
		} else {
			$('#' + toggleId).addClass('hidden');

			$('li[data-toggle-nav="'+toggleId+'"]').removeClass('active');
		}

		if ($(this).hasClass('toggle-widget'))
			adjustWidgets();
	});
}

function initializeCollapsibleSections() {
	$('.collapsible-section-trigger').click(function(){
		var sectionId = $(this).attr('data-section-id');

		if ($('#'+sectionId).hasClass('expanded')) {
			$(this).removeClass('expanded');
			$('#'+sectionId).animate({'height': '0'}).removeClass('expanded');
		} else {
			$(this).addClass('expanded');
			$('#'+sectionId).animate({'height': $('#'+sectionId)[0].scrollHeight}).addClass('expanded');
		}
	});
}

function initializeTabSections() {
	$('.tab-section-trigger').click(function(){
		var type      = $(this).parents('.tabs').attr('data-type');
		var sectionId = $(this).attr('data-section-id');

		if (! $('#'+sectionId).hasClass('active')) {
			$(this).parents('.tabs').find('.tab-section-trigger').removeClass('active');
			$(this).addClass('active');

			$(this).parents('.tabs').find('.tab-content').find('.tab-section')
				.removeClass('active')
				.addClass('hidden');

			$('#'+sectionId)
				.removeClass('hidden')
				.addClass('active');

			checkNoItemsForSectionFilter(type, sectionId);

			$(this).parents('.tabs').find('.tab-content.scrollable').scroller('reset');
		}
	});

	$('.tab-section-trigger ul.filters li').click(function(){
		var type      = $(this).parents('.tabs').attr('data-type');
		var sectionId = $(this).parents('.tab-section-trigger').attr('data-section-id');
		var element   = type == "peers" ? "tr" : "li";

		$(this).parents('ul.filters').children('li').removeClass('active');
		$(this).addClass('active');

		var filter = $(this).attr('data-filter')

		log('Filter Selected: ' + filter);
		filter = filter.toLowerCase();

		$('#' + sectionId + ' .items ' + element).each(function(){
			var filters = $(this).attr('data-filters').split(' ');
			if ($.inArray(filter, filters) >= 0)
				$(this).removeClass('hidden');
			else
				$(this).addClass('hidden');
		});

		checkNoItemsForSectionFilter(type, sectionId);

		$(this).parents('.tabs').find('.tab-content.scrollable').scroller('reset');

		var callbackFunction = $(this).parents('ul.filters').attr('data-filter-callback');
		if (callbackFunction)
			eval(callbackFunction);
	});
}

function checkNoItemsForSectionFilter(type, sectionId) {
	var element = type == "peers" ? "tr" : "li";

	if ($('#' + sectionId + ' .items ' + element).not('.hidden').length)
		$('#' + sectionId).find('.no-items').hide().addClass('hidden');
	else
		$('#' + sectionId).find('.no-items').removeClass('hidden').fadeIn();
}

function initializeKeyCommands() {
	$(document).keyup(function(e){
		var tag = e.target.tagName.toLowerCase();
		var key = String.fromCharCode(e.which);
		if (tag != "input" && tag != "textarea") {
			switch (key) {
				case "U": //unlock account; lock if already unlocked
					if (account !== false)
						sendRequest("lockAccount");

					if ($('#modal-unlock-account').hasClass('open')) {
						$('#modal-unlock-account').foundation('reveal', 'close');
					} else {
						$('#modal-unlock-account').foundation('reveal', 'open');
						setTimeout(function(){
							focusSecretPhrase();
						}, 250);
					}

					break;
				case "L": //lock account
					if (account !== false)
						sendRequest("lockAccount");

					break;
				case "S": //send
					if (account !== false && balance) {
						if ($('#modal-send').hasClass('open')) {
							$('#modal-send').foundation('reveal', 'close');
						} else {
							$('#modal-send').foundation('reveal', 'open');
							setTimeout(function(){
								$('#send-recipient').focus();
							}, 250);
						}
					}
					break;
				case "Q": //QR code
					if (account !== false) {
						if ($('#modal-qr-code').hasClass('open')) {
							$('#modal-qr-code').foundation('reveal', 'close');
						} else {
							$('#modal-qr-code').foundation('reveal', 'open');

							$('#qr-code').html('').qrcode('nxtacct:' + account);
							$('#modal-qr-code h3.account-number').text(account);
						}
					}
					break;
			}
		}
	});
}

function adjustWidgets() {
	var widgets = 4 - $('#widgets .widget.hidden').length;

	if (widgets == 0) {
		$('#widgets')
			.addClass('widgets-0')
			.removeClass('widgets-1')
			.removeClass('widgets-2')
			.removeClass('widgets-3')
			.removeClass('widgets-4');

		$('#widgets #logo-splash').fadeIn('slow');
	} else {
		if (widgets == 1) {
			$('#widgets')
				.addClass('widgets-1')
				.removeClass('widgets-0')
				.removeClass('widgets-2')
				.removeClass('widgets-3')
				.removeClass('widgets-4');
		} else if (widgets == 2) {
			$('#widgets')
				.addClass('widgets-2')
				.removeClass('widgets-0')
				.removeClass('widgets-1')
				.removeClass('widgets-3')
				.removeClass('widgets-4');
		} else if (widgets == 3) {
			$('#widgets')
				.addClass('widgets-3')
				.removeClass('widgets-0')
				.removeClass('widgets-1')
				.removeClass('widgets-2')
				.removeClass('widgets-4');
		} else if (widgets == 4) {
			$('#widgets')
				.addClass('widgets-4')
				.removeClass('widgets-0')
				.removeClass('widgets-1')
				.removeClass('widgets-2')
				.removeClass('widgets-3');
		}

		$('#widgets #logo-splash').hide();
	}

	$('.scrollable').scroller('reset');

	adjustWidgetTabContent();
}

function adjustWidgetTabContent() {
	var widgetHeight = $('.widget').height();
	$('.widget').each(function(){
		var navHeight = $(this).find('.tab-nav').actual('height');
		if (navHeight) {
			var subtractHeight = $(this).attr('id') == "blocks" ? 95 : 50;
			var contentHeight = widgetHeight - navHeight - subtractHeight;

			$(this).find('.tab-content').height(contentHeight);
		}
	});

	$('.scrollable').scroller('reset');
}

function loadViews() {
	var loadAgain = false;

	$('*[data-load-view]').each(function(){
		if (! $(this).hasClass('view-loaded')) {
			$(this).load('views/' + $(this).attr('data-load-view') + '.html').addClass('view-loaded');

			loadAgain = true;
		}
	});

	//if views were loaded, attempt to load empty views again in case there were more views to be loaded in newly loaded views
	if (loadAgain)
		setTimeout("loadViews();", 250);
}

function refreshReadableTimestamps() {
	$('.readable-timestamp').each(function(){
		var timestamp = moment($(this).attr('data-timestamp')).fromNow();
		$(this).text(timestamp);
	});
}

function adjustAmount() {
	var quantity = parseInt(document.getElementById("input").value), price = parseFloat(document.getElementById("price").value);
	document.getElementById("amount").value = isNaN(quantity) || isNaN(price) ? "" : quantity * price;
}

function adjustDeadlineTime() {
	var deadline = document.getElementById("send-deadline").value;
	var deadline = $('#send-deadline').val();

	isNaN(deadline) ? "" : ("~ " + (new Date((new Date()).getTime() + deadline * 3600000)).toLocaleString());

	var deadline = document.getElementById("send-deadline").value;
	var deadline = $('#send-deadline').val();

	if (! parseInt(deadline))
		deadline = "";
	else
		deadline = "~ " + moment((new Date()).getTime() + Math.floor(deadline * 3600000)).format(config.dateTimeFormat);

	$('#send-deadline-time').val(deadline);
}

function adjustFee() {
	var amount = parseInt(document.getElementById("amount").value);
	document.getElementById("fee").value = isNaN(amount) ? "" : (amount < 500 ? 1 : Math.round(amount / 1000));
}

function closeDialog() {
	document.getElementById("interfaceDisabler").style.display = "none";
}

function formatAmount(amount) {
	var digits           = [];
	var preDecimalAmount = "";
	var decimal          = (amount * 100) % 100;
	var i;

	do {
		digits[digits.length] = amount % 10;
		amount = Math.floor(amount / 10);
	} while (amount > 0);

	for (i = 0; i < digits.length; i++) {
		if (i > 0 && i % 3 == 0) {
			preDecimalAmount = config.thousandsSeparator + preDecimalAmount;
		}
		preDecimalAmount = digits[i] + preDecimalAmount;
	}

	var postDecimalAmount = '<span class="decimal">' + config.decimal + Math.floor(decimal / 10) + '' + decimal % 10 + '</span>';

	return preDecimalAmount + postDecimalAmount;
}

function issueAsset() {
	var element, name, description, quantity, fee;
	element = document.getElementById("input");
	name = element.value;
	element.readOnly = true;
	element = document.getElementById("description");
	description = element.value;
	element.readOnly = true;
	element = document.getElementById("quantity");
	quantity = element.value;
	element.readOnly = true;
	element = document.getElementById("fee");
	fee = element.value;
	element.readOnly = true;
	document.getElementById("issueAsset").disabled = true;
	sendRequest("issueAsset&name=" + encodeURIComponent(name) + "&description=" + encodeURIComponent(description) + "&quantity=" + quantity + "&fee=" + fee);
}

function placeAskOrder() {
	var element, quantity, price, fee;
	element = document.getElementById("input");
	quantity = element.value;
	element.readOnly = true;
	element = document.getElementById("price");
	price = element.value;
	element.readOnly = true;
	element = document.getElementById("fee");
	fee = element.value;
	element.readOnly = true;
	document.getElementById("placeAskOrder").disabled = true;
	sendRequest("placeAskOrder&asset=" + selectedAssetId + "&quantity=" + quantity + "&price=" + price + "&fee=" + fee);
}

function placeBidOrder() {
	var element, quantity, price, fee;
	element = document.getElementById("input");
	quantity = element.value;
	element.readOnly = true;
	element = document.getElementById("price");
	price = element.value;
	element.readOnly = true;
	element = document.getElementById("fee");
	fee = element.value;
	element.readOnly = true;
	document.getElementById("placeBidOrder").disabled = true;
	sendRequest("placeBidOrder&asset=" + selectedAssetId + "&quantity=" + quantity + "&price=" + price + "&fee=" + fee);
}

function requestAccountLocking() {
	sendRequest("lockAccount");
}

function requestAssets() {
	sendRequest("getAssets&showIssuedAssets=" + (document.getElementById("issuedAssets").className == "enabledIssuedAssets") + "&showOwnedAssets=" + (document.getElementById("ownedAssets").className == "enabledOwnedAssets") + "&showOtherAssets=" + (document.getElementById("otherAssets").className == "enabledOtherAssets"));
}

function getSecretPhrase(form) {
	if ($('#' + form + '-show-secret-phrase').prop('checked'))
		var secretPhrase = $('#' + form + '-secret-phrase-visible').val();
	else
		var secretPhrase = $('#' + form + '-secret-phrase').val();

	if (config.secretPhraseAutoCipher !== false)
		secretPhrase = Cipher.translate(secretPhrase, config.secretPhraseAutoCipher);

	return secretPhrase;
}

function unlockAccount() {
	$('#modal-unlock-account .form').addClass('invisible');
	$('#modal-unlock-account .loading').fadeIn('fast');

	var secretPhrase = getSecretPhrase('unlock');

	setTimeout(function(){
		sendRequest('unlockAccount', {secretPhrase: encodeURIComponent(secretPhrase)});
	}, 350);
}

function generateSecretPhrase() {
	var secretPhrase = "";
	var chars        = Cipher.characters;
	var randomChar;

	for (c = 0; c < config.secretPhraseGeneratedLength; c++) {
		randomChar = Math.floor(Math.random() * chars.length);
		secretPhrase += chars[randomChar];
	}

	return secretPhrase;
}

function generateAuthorizationToken() {
	$('#modal-authorize-account').foundation('reveal', 'close');

	var secretPhrase = getSecretPhrase('authorize');
	var website      = $('#website').val();

	if (website.substr(0, 4) != "http")
		website = "https://" + website;

	setTimeout(function(){
		sendRequest('generateAuthorizationToken', {
			secretPhrase: encodeURIComponent(secretPhrase),
			website:      website,
		});
	}, 250);
}

function sendMoney() {
	var secretPhrase;

	$('#modal-send .form').addClass('invisible');
	$('#modal-send .loading').fadeIn();

	if ($('#send-show-secret-phrase').prop('checked'))
		secretPhrase = $('#send-secret-phrase-visible').val();
	else
		secretPhrase = $('#send-secret-phrase').val();

	var data = {
		recipient:    $('#send-recipient').val(),
		amount:       parseFloat($('#send-amount').val()),
		fee:          parseFloat($('#send-fee').val()),
		deadline:     parseInt($('#send-deadline').val()),
		secretPhrase: encodeURIComponent(secretPhrase),
	};

	sendRequest('sendMoney', data);
}

function sendRequest(requestParameters, data) {
	if (data !== undefined)
		requestParameters += "&" + serialize(data);

	var request = new XMLHttpRequest();
	request.open("GET", "nxt?user=" + user + "&requestType=" + requestParameters + "&" + Math.random());
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if (--numberOfPendingRequests < 1)
				sendRequest("getNewData");

			var responses = JSON.parse(this.responseText).responses, i, j, response, element, object, object2;
			if (responses !== undefined && responses.length !== undefined) {
				for (i = 0; i < responses.length; i++) {
					response = responses[i];
					switch (response.response) {
						case "denyAccess":
							numberOfPendingRequests++;

							document.title = "Access denied";
							document.body.style.backgroundColor = "#000";
							document.body.innerHTML = "<div style='background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAYCAMAAABHsyFpAAAC9FBMVEUBAAABCgIFJxYBEgQBEwoCGwsDGBMDJAsCCwoGNBkJOCYWVziH57aH9bqH6MaI98eW98iX+Nel+dglZ0kod1hHaFNHlXdJp3dmyaZo1aV22ad317Z66bYFLCEVOCYJRCgVSDYDBAmo6cil98obZka29tdXqIeX6cgJAQIqh1g3iVY3h2dGhlhIm2cJCwtWh2YZZTtXp3dIp4RKtYo4Z0dWuIpYt5Zot4dmupp1uZZayJdoyJlm1Jl5yZt11pokRywnSTUmVTcXWkVp5qh35akFDBF89Lp79sSFyamI1aiJ17iE5qgmV0g3WkWW6LmW9rwSJxaJ7NMpaFWJ+NRHdFgmdkkMSDRVe2MzaFdDZUsCGgSl++G5/OOZ2LUIQxsSSiwTQys0VztUd1xIeWUVNxsTQyQYdEhs1bR2yaea++Ft5rhovaQ7l3dpxIt56cVHjGWFxJhKinQcTC4JCgUWUypYi3ZVmHkJEwxKtHsKGw2F2sSW3sljh25lmXdjqXlGm4JYmYWX6dI4eEo0eltXqZOo7NQqd2Eze2S56tk2lmdcyaeKu6pni3UkZT1ymII4jHJmqZUlXVEhNyZ5qpdZ05kac1QNVThIpGk6e2U7fW9+3MM3lFlRk2gFMg6E154zfWvB+eQKUioMOzEYOjQ0XVEqhE5Rg12n6Lw3gk0bKyJnlYY6fFJ7zbNDWUsURRw0c2IdZ1N1tI2l1cVNyZQZQiRpp4ix6M0JBAuy880zSzkthmfB9txXwItTpWo3Yj51xYklcT8nOjQtlmo3o22Tx6aDyLdDe0orjHA9pnMdTCQxdVwjS0RasX1au6CT7KsaTEE5fl0SBA02elMdQSsQGBRBk1xr5ZsQBhBy4p+l37dKvJCi8L9M0I9u9bWV3tNTbGAulHBIX1IahWBc1KE0d2mAs5FynX9s0Iukz8M/dliy3M4+oV4wS0Zww381n4RlsXZwoX0KGAZ4roGYxraS3qsYcz6l7uBUbVuo/fE1dFQ+dVRwvKxgOGy0AAAMs0lEQVR4Xu1YU5wky7OezLLRtse2bdta27btPbZtG3/bNq5tv9yonp052z2zvzNzz30830NXRmVG4quIqK86AYAIMgoCriw19c0zD9XihEUBkRRFokC0ycIMKCEZmsnJN40gUCAA9sLAP7RZeXLOBMcFQdVk5OY+hGGdz4zkBdrQWDpILJjN76Z97Wvnvrjx9+/eIXzdrfStr2UX40r5v2+13s2zgQQWC2m7rac9KHaPycg7YMK3nAttr1CPtZOfskqAxYdVTdv/WODWZCyRus8OhIWC9U1NSt8MevLyFFVRXmbnT58cHwwI7xYV7ZgVBwKU77UmTesZZuM89vU7nQKNoLXw2lnNF74Q+NRjUPkVXWrrY5kxEZJ8U2DDZfGYdfxM2IGzy5sUzYA+NqZpR+5M2dTmrG1gUSxFCzKeKkqK5hpsyGRW18EcrX87c39uV2j0OVE0kYa9YISgfd3dbFziLATixaKutTyKX99Y6P8YYYHPmuxYeF+qTywRFaUsca2iPIQnn650mh8dHOQxeWN3FPYLfkzOo47gPmhT+7Q/pcnJr7vVpKRhGqjkBVPv92ZcETP5Jbd85E6e56OZSmGOxwSB/d/y0kAQojiOi/YAEHRiCubEvIdGcXQgJkMqv9Pn90/jGarA1Qd78rA3jk9QvN/vxTTNzqecwtGtI7hSKFpuGX7a7yGMHEAUE71JzHQuAVjYK9m46Yz6coH7oVM8w3H3lTc6zq9ZY8+tpZFR+/zmRJfbVXiajycOjR5v61K0/3kUC+WSqiX5aVo4Z3dv7tt88mWDDWzaWwfZv8ZuP//3gzSJB3JL7Xl33JHrkl1XMCKn0wrKyop7o7wh37mC0sIzHG/OK7Uf8cafAGirK3XJsivXTwJthNdc6Nosy1fbadY4PCNYHZtl14aT9/BsvKfJVpBo5ojRVWl5v7S1UwhhweZsvddu5imW5VPy8qweEmefyyu+G7OLj94AfmSvlMHx99WX+rj8ynoz5s7VKUqfBnC9RLMkDhe6FcNS7JBucUGQ2iaJyrFe3zm3omqygGvKJBUc143JZprd4y2S4LaBdeuO8nh7hQIkrt/cB5P3nMFclqhAd26Utn1bJFhTDpvrjaW3YRSzxwBzl9Gt67q2FphC3ldEMMbG9AP3GCMpU5kENQbWOXY6Lt5+XONUoP6+hH2HjRm+8hjFWZ2qDlDWmDG/G27KfjzcImlja42wWCwCtC/Vec6gzTHICTnOMNAGCacHO1Vt3fOP0lgoaOrrk1tFMDfwbBxtT9S31cvrvvPH2yW3rO334+2bukItJSWtId3O0yz+74qukA4IBpuv0UR3eouqAoW6lqRHtmGq+pW2rpB2EmdGNUZFCIqjIADvYwceR8mxtOG/keCsrc1Bfeykh0QrS0Khia0lLSH9eR+F0KoiRe1s3toZ0iMr4mjLXFkUUrUDj9M4HbrHL3i4DFEbOzUxERkfc4XxX8FOT/kp7xud+lgrVI7Fg8Xe9mmGv6+u3EdjvwnTXGq9qpb0d2RVqEm1HiOQNueGhUtWpyKfiRMTzECdWO5SZYeiOJxqq5+mVuXn75z0DVQk7fdDpDJVOW1i8d3DHR1ekkXon6qK4PSn3hhut1i8BCLw9tQ29ehMkhLVhztDnYlHXJre/DgZnyzMfZLauuIxb/+/6ht4OnNH1ciHXswJRbBDmmWFeqncxOHqQ8E38+PlDKra2iWl0Q2IK1JDt1XT2W1a0rMd3uqhCV1PxDi/OQS1hcUftoSaeXpJEoREiOSfqHP4SJYgWJIbKJdyOIJ4IL1NqvUImyTFdbpWEFbb1iv2uHCjPv6pZLOJKuSBrVRxAW3MIym2wtLX1is97XQDS4xeqmwzRWMfGRh9ul5NGrqxO5QcQCv/Tt09+05gvvpgSIVMvOqdnyvMT9rEXjqAmH9Qiz00kMytPpd7MtehqL2wzPbKLmei9cTU5H/1zz858dXvqmm4Aa0qU1u8CGdI2jaYABHLDKIonNHVyQOp1OGuCqBtiSD5VKCNZhFioXLf7ggTLPVAar07zP9bpaTK97rca9xuWUn6XkM8bU0p2Q+CCtlv+rbiHMR8SmmTZkDVehtAxDADleIwze4wWGMh+p5uU60YgTwG26jlL36kJs5F8OhxJxTRq/wC6oFJF8t4+i3E5KglngbEhAvcGpQ2SPlemiaZrKciEV115W2sXUA7r9waavGTOFWCJ0R6N6lreRq2goisUKcf47sk8VG6YQ/QBveXqoThleIwqhFKZvd0D9xeFyYzIerq3GEu2ykpURp0KMKn2unY2vbxz5tSJu8XFf0oZ2t0DvJpIN/0YFKSCrTRBm2Xyt29MK0BtsGgTYQnAkCscZN48S+UnFnaEANhriYlekk0n7ZUyck3/GwHkyMBfVTY0bdu7FQwCIVpGDggurMuTAThHaF/5VvzI2b0yU4It2yHAkWEqGpREz1Q/9gdxPHOpFrM2SQRnsce6tvqWg+9VBFM8gMO+yDsAGjD4V/XhekGoA2iDe+slBS5tbWlFdCSyKNY2rIrFTPzjaLO5nYuw+240+RoVJt3ddSkV3TKRpJmUtnl4gxtBHrrBz+gnmsTTRTLBgIJgejNVZsU26w85FKcqhrS9WKBitdtUdp89FuZM7RNFyha69GOZektIYi2TIR3TuLXj//jVihX1vmfcuj1ilBZtk1Rj9I0ev1BFcKDzAwgKJeiwBjR5jOqcI5iXzJtCPtS/sRRi2nSEJKrX6u7g26guCecohn7ctyNeQK3EnPc1BRHxLpBfMgbOWYq389wtnrn6jR3Y9kqapQRCkS519CelFAupmES1GjYhBGJU+rEMxiWYRHQRlCMUKYk+sAGBqdy1/eJu7c4Vc3+Mo3iaUtxO+Gpogdsit2HTaLimIY04+5yK4bQSa8vGCQIgqlZq53nyXm0UVu6JIdbg2CD9P6gS93GkyyLs0tVeAkwGUAbSdJTBcqsAEFErLInccypSeZGL8LTA18sXb+58KFajqS57L117sJaDx/e61Y3vMybKyUx8Zsmk/ldW6E1VoFQO231ssvajilmZ0qZKOcVipLjXXPaxvONirZh2AMn8m+SnFdOp12x9/SYHxn40u1Nij33yMbTPEVSvoG0jXluRS4+efQlHnQOaLpCjkkF4ea6Jy5m6Et7G2XrIOZMpQp8dYRbVHtYqDXngcD8zjUPzpGU4l7BL5xo1Z73LlTdPgJRPvYGBd8UaGdLSC0xCbWn7aoO4Ueld6lWf+0VO8jOMzwx87dM0TbPJzUcnyg4cdN28PcTT1BRY5/3/vrfNII667k3DcP+G0GErgmvLpegqsnXfD9p61KhD77z18ntDTHSZYsIcnHd/nZcswn0rtong7qLAhStfgyyk8XwdKN69z//fYtNAuUZNbSjmMZbQBne0MKaVSgAnawfCAsVcB07di2mRLGPtxi6+aTfKkqaPlacXdSlKnIPbAms3w7zRaqq9/T0yGDuolG8MH0rYTT9u6Ddaggj9Zn0Tl1PkuUeXW/2sjRhgl3IslG8tWPbMBBLDbgV+Eyc/WglnoMn2z5nsitERZwiDWOP935RDUV16S6M/W90QhOEZ3GScfVjrr8ZOg0c2IVjUzu/5VdQlS94ae+hzlAkEtyd/2fBCCBk/LzaDrOT3/jnpwzj1L9YuP6J0NuRKM5mQbRZJoIz1ngk2M8ffurt986+Wu2FawSuZMxC73wZPB++jV8x8XbkvcizuPqVYGR8fBx833v47DDO+gXMOw44+yxeQNAnGC9s/SreEzWZ/i8baz589rZqo1LgQzemejgyvotiYcf9wVDEMhdexJNwmPa57WReDOlvVlNRg1qZf/8hwK5+EKGUdyQ9q7+GGv1R/oqh/h8hRFBVliezsrKGLNVxX7toX1V+vqXjGRiDq/MtI+/sI7qX9cPAjvwRy0hVdC3UvWxk+ZBlGQyiqjpGLFG8sw9BkFfDsOiNF6r3oO6a/JEXvgDhWTNieeF6XF0nri8Dr2cQXT1iWf6HboS8I1mHDg1ZLMuHftdBo+7qkeVgXxx6YWHlhR4oUlvnjo6u9x/888uXLT8GGWTsz3Lx8uWL/2E5eBAWMM7X3X9wqPsT35XLD1pumvY6mHOlD8gBoKiJDCTMtua6jXYMazEjoAXGnA8YNw1GCzQBn/gaRvyA+IVifeAaN5VhLww0Ci/8RBrFjL7ZImJd4yZCt+hdUOQtRsIkzw5N/hSnQGC+7xIXA9y0SnK86y2PgggGT9okt4lE8Q639vsczHFr7vsgPRON/5gWic85RDWi8Y0T0sdvw+SivT7HypJXg8Hgm3/9lyvYJXh9DvqZKLrZzP/H3Ptfnz6ceiiCCGEAAAAASUVORK5CYII=); height:24px; left:50%; margin: -12px -155px; top:50%; width: 310px;'></div>";
							break;

						case "lockAccount":
							account = false;
							removeAllTransactions('my');

							$('#lock').addClass('hidden');
							$('#unlock').removeClass('hidden');
							$('.account-unlocked').addClass('hidden');
							$('.account-unlocked').next('li.divider').addClass('hidden');

							log('Account locked');

							break;

						case "notifyOfAcceptedAskOrder":
							showSuccessMessage('orderPlaced');
							break;

						case "notifyOfAcceptedAssetIssuence":
							showSuccessMessage('assetIssued');
							break;

						case "notifyOfAcceptedBidOrder":
							showSuccessMessage('orderPlaced');
							break;

						case "notifyOfAcceptedTransaction":
							showSuccessMessage('amountSent', {
								replacementVars: {
									amount:    '<strong>' + $('#send-amount').val() + '</strong>',
									recipient: '<strong>' + $('#send-recipient').val() + '</strong>',
								}
							});

							clearSecretPhrase();

							log('Transaction accepted');

							break;

						case "notifyOfIncorrectAskOrder":
							showMessage(response.message, {
								onCloseFunction: function() {
									showAskOrderDialog(response.quantity, response.price, response.fee);
								}
							});
							break;

						case "notifyOfIncorrectAssetIssuence":
							showMessage(response.message, {
								onCloseFunction: function() {
									showAssetDialog(response.name, response.description, response.quantity, response.fee);
								}
							});
							break;

						case "notifyOfIncorrectBidOrder":
							showMessage(response.message, {
								onCloseFunction: function() {
									showBidOrderDialog(response.quantity, response.price, response.fee);
								}
							});
							break;

						case "notifyOfIncorrectTransaction":
							var message    = response.message;
							var messageRaw = true;

							//secret phrase errors
							if (message == "Wrong secret phrase!") {
								message    = "secretPhraseIncorrect";
								messageRaw = false;
							}

							var secretPhrase = getSecretPhrase('send');

							if (secretPhrase == "") {
								message    = "secretPhraseRequired";
								messageRaw = false;
							}

							//recipient error
							if ($('#send-recipient').val() == "") {
								message    = "recipientRequired";
								messageRaw = false;
							}

							//amount error
							if (message == "\"Amount\" must be greater than 0!") {
								message    = "amountGreaterThanZero";
								messageRaw = false;
							}

							//deadline error
							if (message == "\"Deadline\" must be greater or equal to 1 minute and less than 24 hours!") {
								message    = "deadlineWithinLimits";
								messageRaw = false;
							}

							//show message
							showError(message, {
								messageRaw:      messageRaw,
								onCloseFunction: function() {
									showTransactionDialog();
								}
							});

							break;

						case "processInitialData":
							document.title = document.title + " :: " + response.version;

							$('.nxt-version').text(response.version);
							$('.nxs-version').text(config.version);
							$('#footer .versions').fadeIn('slow');

							if (response.unconfirmedTransactions)
								addTransactions(response.unconfirmedTransactions, 'all');

							if (response.activePeers)
								addPeers(response.activePeers, 'active');

							if (response.knownPeers)
								addPeers(response.knownPeers, 'known');

							if (response.blacklistedPeers)
								addPeers(response.blacklistedPeers, 'blacklisted');

							if (response.recentBlocks)
								addBlocks(response.recentBlocks, 'recent');

							break;

						case "processNewData":
							if (response.addedMyTransactions)
								addTransactions(response.addedMyTransactions, 'my');

							if (response.addedConfirmedTransactions) {
								incrementNumberOfConfirmations('all');
								addTransactions(response.addedConfirmedTransactions, 'all');
							}

							if (response.addedUnconfirmedTransactions)
								addTransactions(response.addedUnconfirmedTransactions, 'all');

							if (response.removedUnconfirmedTransactions) {
								removeTransactions(response.removedUnconfirmedTransactions, 'my');
								removeTransactions(response.removedUnconfirmedTransactions, 'all');
							}

							if (response.addedActivePeers)
								addPeers(response.addedActivePeers, 'active');

							if (response.addedKnownPeers)
								addPeers(response.addedKnownPeers, 'known');

							if (response.addedBlacklistedPeers)
								addPeers(response.addedBlacklistedPeers, 'blacklisted');

							if (response.changedActivePeers)
								changePeers(response.changedActivePeers, 'active');

							if (response.removedActivePeers)
								removePeers(response.removedActivePeers, 'active');

							if (response.removedKnownPeers)
								removePeers(response.removedKnownPeers, 'known');

							if (response.removedBlacklistedPeers)
								removePeers(response.removedBlacklistedPeers, 'blacklisted');

							if (response.addedRecentBlocks) {
								for (j = 0; j < response.addedRecentBlocks.length; j++) {
									object = response.addedRecentBlocks[j];

									if (object.generator == account && object.totalFee > 0) {
										addTransaction({
											"index":                 object.block,
											"blockTimestamp":        object.timestamp,
											"block":                 object.block,
											"earnedAmount":          object.totalFee,
											"numberOfConfirmations": 1,
											"id":                    "-"
										}, 'my');
									}
								}
								addBlocks(response.addedRecentBlocks, true, 'recent');
							}

							if (response.addedOrphanedBlocks) {
								removeBlocks(response.addedOrphanedBlocks, 'recent');
								addBlocks(response.addedOrphanedBlocks, 'orphaned');
							}

							break;

						case "requestAssets":
							requestAssets();
							break;

						case "setBalance":
							balance = Math.floor(response.balance / 100);

							$('#balance').html(formatAmount(balance));
							$('#balance').attr('data-balance', balance);

							if (!balance)
								$('.top-bar-section .send').addClass('hidden');

							log('Balance updated');

							break;

						case "setBlockGenerationDeadline":
							setDeadline(response.deadline);
							break;

						case "showAuthorizationToken":
							var message = Language.get('messages.accountAuthorized', {
								replacementVars: {
									website: $('#website').val()
								}
							});
							$('#modal-account-authorized .account-authorized-message').text(message);

							$('#auth-token').val(response.token);

							$('#modal-account-authorized').foundation('reveal', 'open');
							setTimeout(function(){
								$('#auth-token').select();
							}, 250);

							clearSecretPhrase();

							log('Authorization token generated');

							break;

						case "showMessage":
							var message     = response.message;
							var messageType = "General";
							var messageRaw  = true;

							if (message == "Invalid secret phrase!") {
								message     = "secretPhraseIncorrect";
								messageType = "Error";
								messageRaw  = false;
							}

							//show message
							switch (messageType) {
								case "General":
									showMessage(message, {
										messageRaw: messageRaw,
									});
									break;
								case "Success":
									showSuccessMessage(message, {
										messageRaw: messageRaw,
									});
									break;
								case "Error":
									showError(message, {
										messageRaw: messageRaw,
									});
									break;
								case "Warning":
									showWarning(message, {
										messageRaw: messageRaw,
									});
									break;
							}

							break;

						case "unlockAccount":
							account = response.account;
							balance = Math.floor(response.balance / 100);

							$('#account .account-number').text(account);
							$('#balance').html(formatAmount(balance));
							$('#balance').attr('data-balance', balance);

							$('#modal-unlock-account').foundation('reveal', 'close');

							$('#unlock').addClass('hidden');
							$('#lock').removeClass('hidden');
							$('.account-unlocked').removeClass('hidden');
							$('.account-unlocked').next('li.divider').removeClass('hidden');

							if (!balance)
								$('.top-bar-section .send').addClass('hidden');

							clearSecretPhrase();

							$('.transaction-info a.me').attr('href', config.accountUrl.replace('[accountId]', account));
							$('.transaction-info a.me .account-number').text(account);

							if (response.secretPhraseStrength < 4) {
								if (config.secretPhraseRequireStrong) {

									showError('secretPhraseLength', {
										onCloseFunction: function(){
											sendRequest('lockAccount');

											//focus secret phrase field and ensure transparent background fades in
											setTimeout(function(){
												$('#modal-unlock-account .loading').hide();
												$('#modal-unlock-account .form').removeClass('invisible');

												$('#modal-unlock-account').foundation('reveal', 'open');

												focusSecretPhrase();
												$('.reveal-modal-bg').fadeIn();
											}, 250);
										}
									});

								} else {
									showWarning('secretPhraseLength');
								}
							}

							$('#modal-unlock-account .loading').hide();
							$('#modal-unlock-account .form').removeClass('invisible');

							if (response.secretPhraseStrength >= 4 || ! config.secretPhraseRequireStrong)
								log('Account unlocked');

							break;

						case "updateAssets":
							document.getElementById("assetsFrame").contentWindow.updateAssets(response.assets);
							break;
					}
				}
			}
		}
	};
	numberOfPendingRequests++;
	request.send();
}

function setSelectedAsset(assetId) {
	selectedAssetId = assetId;
}

function showDialog(title, content, onCloseFunction) {
	$('#modal-general h2').html(title);
	$('#modal-general .row .columns .modal-content').html(content);
	$('#modal-general').foundation('reveal', 'open');

	//focus OK button and ensure transparent background fades in
	setTimeout(function(){
		$('#modal-general .ok').focus();
		$('.reveal-modal-bg').fadeIn();
	}, 250);

	$(document).off('close', '[data-reveal-general]');

	if (onCloseFunction)
		$(document).on('close', '[data-reveal-general]', onCloseFunction);

	$('#modal-general .ok').off('click').on('click', function(){
		$('#modal-general').foundation('reveal', 'close');
	});
}

function showDialogDelay(title, content, onCloseFunction) {
	setTimeout(function(){
		showDialog(title, content, onCloseFunction);
	}, 250);
}

function showMessage(message, options) {
	if (options === undefined)
		options = {};

	if (options.icon === undefined)
		options.icon = "icon-bubble2";

	if (options.modalLabel === undefined)
		options.modalLabel = Language.get('labels.message');

	if (options.rawMessage !== true) {
		if (options.replacementVars === undefined)
			options.replacementVars = {};

		if (options.messagePath !== undefined)
			var messagePath = 'messages.' + options.messagePath + '.' + message;
		else
			var messagePath = 'messages.' + message;

		message = Language.get(messagePath, options.replacementVars);
	}

	if (options.onCloseFunction === undefined)
		options.onCloseFunction = false;

	var title   = '<span class="icon ' + options.icon + '"></span> ' + options.modalLabel;
	var classes = 'icon ' + options.icon + ' icon-modal';

	if (options.iconClass !== undefined)
		classes += ' ' + options.iconClass;

	$('#modal-general .icon-modal').attr('class', classes);

	showDialog(title, message, options.onCloseFunction);
}

function showSuccessMessage(message, options) {
	if (options === undefined)
		options = {};

	options.messagePath = "success";
	options.modalLabel  = Language.get('labels.success');
	options.icon        = "icon-checkmark-circle";
	options.iconClass   = "success";

	showMessage(message, options);
}

function showWarning(message, options) {
	if (options === undefined)
		options = {};

	options.messagePath = "warnings";
	options.modalLabel  = Language.get('labels.warning');
	options.icon        = "icon-warning";
	options.iconClass   = "warning";

	showMessage(message, options);
}

function showError(message, options) {
	if (options === undefined)
		options = {};

	options.messagePath = "errors";
	options.modalLabel  = Language.get('labels.error');
	options.icon        = "icon-spam";
	options.iconClass   = "error";

	showMessage(message, options);
}

function showAccountDialog() {
	$('#modal-unlock-account .loading').hide();
	$('#modal-unlock-account .form').removeClass('invisible');

	$('#modal-unlock-account').foundation('reveal', 'open');
}

function showAuthorizationDialog() {
	$('#modal-authorize-account .loading').hide();
	$('#modal-authorize-account .form').removeClass('invisible');

	$('#modal-authorize-account').foundation('reveal', 'open');
}

function showTransactionDialog() {
	$('#modal-send .loading').hide();
	$('#modal-send .form').removeClass('invisible');

	$('#modal-send').foundation('reveal', 'open');

	//ensure transparent background fades in and focus recipient field
	setTimeout(function(){
		$('#send-recipient').focus();
		$('.reveal-modal-bg').fadeIn();
	}, 250);

	adjustDeadlineTime();
}

function showAssetDialog(name, description, quantity, fee) {
	$('#asset-name').val(name);
	$('#asset-description').val(description);
	$('#asset-quantity').val(quantity);
	$('#asset-fee').val(fee);

	$('#modal-asset').foundation('reveal', 'open');

	showDialog("Asset", "<table><tr><td class='label' colspan='2'>Name</td></tr><tr><td class='input' colspan='2'><input id='input' maxlength='20'></td></tr><tr><td class='label' colspan='2'>Description</td></tr><tr><td class='input' colspan='2'><input id='description' maxlength='1000'></td></tr><tr><td class='label' style='padding-top: 0;'>Quantity</td><td class='label' style='padding-top: 0;'>Fee</td></tr><tr><td class='input'><input type='number' id='quantity'></td><td class='input'><input type='number' id='fee'></td></tr><tr><td colspan='2'><button id='issueAsset' onclick='issueAsset();'>Issue asset</button></td></tr></table>");
}

function showAskOrderDialog(quantity, price, fee) {
	$('#order-ask-quantity').val(quantity);
	$('#order-ask-price').val(price);
	$('#order-ask-fee').val(fee);

	$('#modal-order-ask').foundation('reveal', 'open');
}

function showBidOrderDialog(quantity, price, fee) {
	$('#order-bid-quantity').val(quantity);
	$('#order-bid-price').val(price);
	$('#order-bid-fee').val(fee);

	$('#modal-order-bid').foundation('reveal', 'open');
}

function toggleAdvancedWidget(advancedWidgetIndex) {
	var advancedWidgetToggle = document.getElementById(advancedWidgetIds[advancedWidgetIndex] + "Toggle"), i, element;
	if (advancedWidgetToggle.className == "enabled" + advancedWidgetToggleClassNames[advancedWidgetIndex]) {
		advancedWidgetToggle.className = "disabled" + advancedWidgetToggleClassNames[advancedWidgetIndex];
	} else {
		for (i = 0; i < 4; i++) {
			element = document.getElementById(advancedWidgetIds[i] + "Toggle");
			if (element.className == "enabled" + advancedWidgetToggleClassNames[i]) {
				element.className = "disabled" + advancedWidgetToggleClassNames[i];
			}
		}
		advancedWidgetToggle.className = "enabled" + advancedWidgetToggleClassNames[advancedWidgetIndex];
		switch (advancedWidgetIndex) {
		case 2:
			requestAssets();
			break;
		}
	}
	adjustWidgets();
}

function toggleAssetFilter(filterIndex) {
	var filterIds = ["issued", "owned", "other"], filterClassNames = ["Issued", "Owned", "Other"], element = document.getElementById(filterIds[filterIndex] + "Assets");
	element.className = element.className == "enabled" + filterClassNames[filterIndex] + "Assets" ? ("disabled" + filterClassNames[filterIndex] + "Assets") : ("enabled" + filterClassNames[filterIndex] + "Assets");
	requestAssets();
}

function toggleWidget(widgetIndex) {
	var widgetToggle = document.getElementById(widgetIds[widgetIndex] + "Toggle");
	if (widgetToggle.className == "enabled" + widgetToggleClassNames[widgetIndex]) {
		widgetToggle.className = "disabled" + widgetToggleClassNames[widgetIndex];
	} else {
		widgetToggle.className = "enabled" + widgetToggleClassNames[widgetIndex];
	}
	adjustWidgets();
}

function updateCounter(type, subType) {
	var element = type == "peers" ? "tr" : "li";
	var current = $('#' + subType + '-' + type + ' ' + element).not('.hidden').length;
	var total   = $('#' + subType + '-' + type + ' ' + element).length;

	var counterSelector = '.tab-section-trigger[data-section-id="' + subType + '-' + type + '-section"] .counter';
	$(counterSelector + ' .current').text(current);
	$(counterSelector + ' .total').text(total);

	if (total && current != total) {
		$(counterSelector + ' .divider').removeClass('hidden');
		$(counterSelector + ' .total').removeClass('hidden');
	} else {
		$(counterSelector + ' .divider').addClass('hidden');
		$(counterSelector + ' .total').addClass('hidden');
	}
}

function updateCounters(type) {
	$('.tab-section-trigger').each(function(){
		var subType = $(this).attr('data-section-id').replace('-' + type + '-section', '');
		updateCounter(type, subType);
	});
}

function bytesToSize(bytes) {
	bytes = isNaN(bytes) ? 0 : bytes;

	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

	if (bytes == 0)
		return '0';

	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function serialize(obj) {
	var str = [];
	for (var p in obj) {
		if (obj.hasOwnProperty(p))
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	}

	return str.join("&");
}

function log(item) {
	if (config.consoleLogging)
		console.log(item);
}