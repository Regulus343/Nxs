var user              = Math.random();
var account           = false;
var balance           = 0;
var currentPageId     = "transactions";

var genesisBlock      = "2680262203532249785";
var secondBlock       = "6556228577102711328";
var testNetChecked    = false;

var aliasFieldChanged = false;
var selectedAssetId;

if (config.testNet)
	config.apiServerPort = 6876;

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

		Api.sendUiRequest('getInitialData');
		log('Getting initial data...');

		//automatically unlock account if secret phrase config variable is set
		if (config.secretPhrase !== false)
			Api.sendUiRequest('unlockAccount', {secretPhrase: config.secretPhrase});
		else //otherwise, bring up account unlock dialog
			showAccountDialog();

	}, 1000);

	//set secret phrase hint if secret phrase config variable is set
	if (config.secretPhraseHint !== false && config.secretPhraseHint.length > 0) {
		$('.secret-phrase-hint span.hint').html(config.secretPhraseHint);
		$('.secret-phrase-hint').removeClass('hidden');
	}

	//hide double-click message on "Send" dialog if config variable is not set
	if (! config.sendRequireDoubleClick)
		$('.send-double-click').addClass('hidden');

	//initialize navigation bar
	initializeNavBar();

	//initialize page navigation
	initializePageNav();

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

	//set up send function
	$('#send').click(function(){
		$('#modal-send .loading').hide();
		$('#modal-send .form').removeClass('invisible');

		adjustDeadlineTime('send');

		setTimeout(function(){
			$('#send-recipient').focus();
		}, 250);
	});

	//set up amount fields
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

	//set default fee
	$('input.fee').val(config.defaultFee.toFixed(8));

	//check if NRS is using test net or live net
	checkTestNet();

	//set up deadline fields
	$('input.deadline').each(function(){
		if ($(this).attr('id') == "send-deadline")
			$(this).val(1);
		else
			$(this).val(60);
	}).change(function(){
		var deadline = parseInt($(this).val());
		var max      = $(this).attr('id').substr(0, 4) == "send" ? 24 : 3600;

		if (deadline > max)
			deadline = max;

		if (deadline < 1)
			deadline = 1;

		$(this).val(deadline);
	}).keyup(function(){
		var deadline = parseInt($(this).val());
		var max      = $(this).attr('id').substr(0, 4) == "send" ? 24 : 3600;

		if (deadline > max)
			deadline = max;

		if (deadline < 1)
			deadline = 1;

		$(this).val(deadline);
	});

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

	//adjust pages
	adjustPages();
	$(window).resize(function(){
		adjustPages();
	});

	//add scroll bar to scrollable areas
	$('.scrollable').scroller();

	//set loading text ellipsis display cycle
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

	$('#side-nav-toggle').click(function(){
		toggleSideNav();
	});
}

function toggleSideNav() {
	if ($('#side-nav').css('width') == "200px") {
		$('#side-nav li span.text').fadeOut();
		$('#side-nav').animate({width: '52px'}, 250);

		var remainingWidth = $('body').actual('width') - 80;
		$('#pages').animate({width: remainingWidth + 'px'}, 250);
	} else {
		$('#side-nav li span.text').fadeIn();
		$('#side-nav').animate({width: '200px'}, 250);

		var remainingWidth = $('body').actual('width') - 230;
		$('#pages').animate({width: remainingWidth + 'px'}, 250);
	}
}

function initializePageNav() {
	$('li[data-page-nav] a').click(function(e){
		var pageId = $(this).parents('li').attr('data-page-nav');
 
 		if (pageId != currentPageId) {
 			$('li[data-page-nav="' + currentPageId + '"]').removeClass('active');
			$('li[data-page-nav="' + pageId + '"]').addClass('active');

	 		if (config.pageTransitionSlide) {
	 			var slideSpeed      = 500;
				var currentPosition = $('li[data-page-nav="' + currentPageId + '"]').index();
				var newPosition     = $('li[data-page-nav="' + pageId + '"]').index();
				var pageHeight      = $('#' + currentPageId).actual('height');
				var height          = pageHeight + 120;

				if (newPosition > currentPosition) {
					$('#' + pageId).css('top', height + 'px').removeClass('hidden');
					$('#' + currentPageId).animate({top: '-' + height + 'px'}, slideSpeed);
					$('#' + pageId).animate({top: '12px'}, slideSpeed);
				} else {
					$('#' + pageId).css('top', '-' + height + 'px').removeClass('hidden');
					$('#' + currentPageId).animate({top: height + 'px'}, slideSpeed);
					$('#' + pageId).animate({top: '12px'}, slideSpeed);
				}
			} else {
				$('#' + pageId).hide().fadeIn('slow').removeClass('hidden');
				$('#' + currentPageId).fadeOut('slow');
			}

			currentPageId = pageId;

			$('.top-bar-section ul.page-sub-nav').fadeOut('fast');
			$('.top-bar-section ul.page-sub-nav[data-page-id=' + pageId + ']').fadeIn();

			adjustPages();
		}
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
		var element   = $(this).parents('.tabs').find('.tab-content table.items').length ? "tr" : "li";

		$(this).parents('ul.filters').children('li').removeClass('active');
		$(this).addClass('active');

		var filter = $(this).attr('data-filter');

		log('Filter selected: "' + filter + '" (' + type + ')');
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

function checkTestNet() {
	//check if using test net by attempting to get second block
	Api.sendRequest('getBlock', {block: secondBlock});
}

function initializeLockUnlockAccount() {
	$('#unlock').click(function(){
		setTimeout(function(){
			focusSecretPhrase();
		}, 250);
	});

	$('#lock').click(function(e){
		e.preventDefault();

		Api.sendUiRequest('lockAccount');
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

	initializeModalAbout();

	initializeModalSend();

	initializeModalSendMessage();

	initializeModalRegisterAlias();
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

function initializeModalAbout() {
	$('#update-nxt').click(function(){
		$('#nxt-hash-check-target').hide().removeClass('hidden').fadeIn();

		downloadNxtClient();
	});
}

function initializeModalSend() {
	adjustDeadlineTime('send');

	$('input.deadline').keyup(function(){
		adjustDeadlineTime($(this).attr('id').replace('-deadline', ''));
	}).change(function(){
		adjustDeadlineTime($(this).attr('id').replace('-deadline', ''));
	});

	$('.deadline-time').click(function(){
		$(this).parents('tr').find('input.deadline').focus();
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

function initializeModalSendMessage() {
	$('#send-message').click(function(){
		$('#modal-send-message .loading').hide();
		$('#modal-send-message .form').removeClass('invisible');

		$('#send-message-recipient').val('');
		$('#send-message-message').val('');

		adjustDeadlineTime('send-message');

		setTimeout(function(){
			$('#send-message-recipient').focus();
		}, 250);
	});
}

function initializeModalRegisterAlias() {
	$('#register-alias').click(function(){
		$('#modal-register-alias .loading').hide();
		$('#modal-register-alias .form').removeClass('invisible');

		$('#register-alias-alias').val('');
		$('#register-alias-uri').val('');

		$('#modal-register-alias .alias-available').hide();
		$('#modal-register-alias .alias-taken').hide();

		adjustDeadlineTime('register-alias');

		setTimeout(function(){
			$('#register-alias-alias').focus();
		}, 250);
	});

	$('input.alias').keyup(function(){
		checkAlias(this);
	}).change(function(){
		checkAlias(this);
	});

	$('#register-alias-type').change(function(){
		if ($(this).val() == "General")
			var placeholder = Language.get('labels.uri');
		else
			var placeholder = $(this).children('option:selected').text();

		if ($(this).val() == "URL") {
			if ($('#register-alias-uri').val() == "")
				$('#register-alias-uri').val('http://');
		} else {
			if ($('#register-alias-uri').val() == "http://" || $('#register-alias-uri').val() == "https://")
				$('#register-alias-uri').val('');
		}

		$('#register-alias-uri').attr('placeholder', placeholder).focus();
	});

	var eventType = config.sendRequireDoubleClick ? "dblclick" : "click";
	$('#register-alias-confirm').on(eventType, function(){
		registerAlias();
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

function checkNoItemsForSectionFilter(type, sectionId) {
	var element = $('#' + type + ' table.items').length ? "tr" : "li";

	if ($('#' + sectionId + ' .items ' + element).not('.hidden').length) {
		$('#' + type + ' table.items').removeClass('hidden');
		$('#' + sectionId).find('.no-items').hide().addClass('hidden');
	} else {
		$('#' + type + ' table.items').addClass('hidden');
		$('#' + sectionId).find('.no-items').removeClass('hidden').fadeIn();
	}
}

function initializeKeyCommands() {
	$(document).keyup(function(e){
		var tag = e.target.tagName.toLowerCase();
		var key = String.fromCharCode(e.which);
		if (tag != "input" && tag != "textarea") {
			switch (key) {
				case "U": //unlock account; lock if already unlocked
					if (account !== false)
						Api.sendUiRequest('lockAccount');

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
						Api.sendUiRequest('lockAccount');

					break;
				case "N": //toggle side navigation menu
					toggleSideNav();

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

function adjustPages() {
	var remainingWidth = $('body').actual('width') - $('#side-nav').actual('width') - 50;
	$('#pages').css('width', remainingWidth + 'px');

	adjustPageTabContent();
}

function adjustPageTabContent() {
	var pageHeight = $('.page').height();
	$('.page').each(function(){
		var navHeight = $(this).find('.tab-nav').actual('height');
		if (navHeight) {
			var subtractHeight = $(this).attr('id') == "blocks" ? 95 : 50;
			var contentHeight = pageHeight - navHeight - subtractHeight;

			$(this).find('.tab-content').height(contentHeight);
		}
	});

	$('.scrollable').scroller('reset');
}

function loadViews() {
	var loadAgain = false;

	$('*[data-load-view]').each(function(){
		if (! $(this).hasClass('view-loaded')) {
			$(this).load('views/' + $(this).attr('data-load-view').replace(/\./g, '/') + '.html').addClass('view-loaded');

			loadAgain = true;
		}
	});

	//if views were loaded, attempt to load empty views again in case there are more views to be loaded in newly loaded views
	if (loadAgain)
		setTimeout("loadViews();", 250);
}

function getLatestSoftwareVersions() {
	Api.sendRequest('getAliasURI', {alias: config.nrsVersionCheckBeta ? 'NRSbetaversion' : 'NRSversion'});
	Api.sendRequest('getAliasURI', {alias: config.nrsVersionCheckBeta ? 'NRSbetarelease' : 'NRSrelease'});

	Api.sendRequest('getAliasURI', {alias: 'NxsVersion'});
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

function adjustDeadlineTime(type) {
	var deadline = $('#' + type + '-deadline').val();

	if (!parseInt(deadline)) {
		deadline = "";
	} else {
		var multiplier = (type == "send" ? 3600000 : 60000);

		deadline = "~ " + moment((new Date()).getTime() + Math.floor(deadline * multiplier)).format(config.dateTimeFormat);
	}

	$('#' + type + '-deadline-time').val(deadline);
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
	Api.sendUiRequest("issueAsset&name=" + encodeURIComponent(name) + "&description=" + encodeURIComponent(description) + "&quantity=" + quantity + "&fee=" + fee);
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
	Api.sendUiRequest("placeAskOrder&asset=" + selectedAssetId + "&quantity=" + quantity + "&price=" + price + "&fee=" + fee);
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
	Api.sendUiRequest("placeBidOrder&asset=" + selectedAssetId + "&quantity=" + quantity + "&price=" + price + "&fee=" + fee);
}

function lockAccount() {
	Api.sendUiRequest('lockAccount');
}

function requestAssets() {
	Api.sendUiRequest("getAssets&showIssuedAssets=" + (document.getElementById("issuedAssets").className == "enabledIssuedAssets") + "&showOwnedAssets=" + (document.getElementById("ownedAssets").className == "enabledOwnedAssets") + "&showOtherAssets=" + (document.getElementById("otherAssets").className == "enabledOtherAssets"));
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
		Api.sendUiRequest('unlockAccount', {secretPhrase: secretPhrase});
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
		Api.sendUiRequest('generateAuthorizationToken', {
			secretPhrase: secretPhrase,
			website:      website,
		});
	}, 250);
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

	setTimeout(function(){
		focusSecretPhrase();
	}, 250);
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

	adjustDeadlineTime('send');
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
	var element = $('#' + type + ' table.items').length ? "tr" : "li";
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
	if (config.consoleLogging) {
		item = moment().format('YYYY-MM-DD h:mm:ss a') + " :: " + item;
		console.log(item);
	}
}