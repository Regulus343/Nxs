var initialAliases = true;
var myAliases      = [];

function addAlias(alias, type) {
	var source = $('#alias-template').html();

	if (source !== undefined) {
		var template = Handlebars.compile(source);

		//abbreviate alias variable
		var a = alias;

		//set default alias values
		a.filters = "all";

		//format URI
		a.uriFormatted = formatAliasUri(a.uri);

		//set type
		a.aliasType       = Language.get('labels.general');
		a.aliasTypeNumber = 3;

		if (a.uri === undefined)
			a.uri = "";

		if (a.uri.substr(0, 5) == "acct:" && a.uri.substr(-4) == "@nxt") {
			a.aliasType       = Language.get('labels.nxtAccount');
			a.aliasTypeNumber = 1;

			a.filters += " nxt-account";
		}

		if (a.uri.substr(0, 7) == "http://" || a.uri.substr(0, 8) == "https://") {
			a.aliasType       = Language.get('labels.url');
			a.aliasTypeNumber = 2;

			a.filters += " url";
		}

		if (a.aliasTypeNumber == 3)
			a.filters += " general";

		a.index = a.alias.toLowerCase();

		//get HTML markup for template and append it
		var html = template(a);

		if (initialAliases)
			$('#' + type + '-aliases').append(html);
		else
			$('#' + type + '-aliases').prepend(html);

		//update aliases counter
		updateCounter('aliases', type);

		//reset scrollable area
		$('#aliases .scrollable').scroller('reset');

		//add language text to new markup
		Language.replaceText();

		//add update action
		$('#' + type + '-aliases .alias-' + a.index + ' td.actions button.edit').click(function(){
			showUpdateAliasDialog(type, $(this).parents('tr').attr('data-index'));
		});

		if (type == "my") {
			myAliases.push(a.alias);
			reorderAliases(type);
		}

		return true;
	}

	log('Failed to load alias template');

	return false;
}

function addAliases(aliases, type) {
	for (a = 0; a < aliases.length; a++) {
		addAlias(aliases[a], type);
	}

	log('Adding aliases: ' + aliases.length);

	reorderAliases(type);

	checkNoItemsForSectionFilter('aliases', type + '-aliases-section');

	adjustPageTabContent();

	initialAliases = false;
}

function reorderAliases(type) {
	$('#'+type+'-aliases tr').tsort('td.alias', {order: 'asc', attr: 'data-alias'});
}

function formatAliasUri(uri) {
	if (uri === undefined)
		uri = "";

	if (uri.substr(0, 5) == "acct:" && uri.substr(-4) == "@nxt") {
		var accountNumber = uri.substr(5, (uri.length - 9));
		return '<a href="' + config.accountUrl.replace('[accountId]', accountNumber) + '" target="_blank">' + accountNumber + '</a>';
	}

	if (uri.substr(0, 7) == "http://" || uri.substr(0, 8) == "https://")
		return '<a href="' + uri.replace('"', '') + '" target="_blank">' + uri + '</a>';

	return uri;
}

function removeAllAliases(type) {
	$('#' + type + '-aliases').html('');

	updateCounter('aliases', type);
}

function removeAlias(alias, type) {
	$('#' + type + '-aliases li.alias-' + alias.index).remove();

	updateCounter('aliases', type);
}

function removeAliases(aliases, type) {
	for (a = 0; a < aliases.length; a++) {
		removeAlias(aliases[a], type);
	}
}

function registerAlias() {
	$('#modal-register-alias .form').addClass('invisible');
	$('#modal-register-alias .loading').fadeIn();

	var secretPhrase = getSecretPhrase('register-alias');
	var uri          = $('#register-alias-uri').val();
	var type         = $('#register-alias-type').val();

	if (type == "URL" && uri.substr(0, 7) != "http://" && uri.substr(0, 8) != "https://")
		uri = "http://" + uri.trim();

	if (type == "Nxt Account")
		uri = "acct:" + uri.trim() + "@nxt";

	if (config.autoTrimAliasUri)
		uri = uri.trim();

	var data = {
		alias:        $('#register-alias-alias').val().trim(),
		uri:          uri,
		fee:          parseFloat($('#register-alias-fee').val()),
		deadline:     parseInt($('#register-alias-deadline').val()),
		secretPhrase: encodeURIComponent(secretPhrase),
	};

	Api.sendRequest('assignAlias', data);
}

function getAliases(type) {
	if (type == "my") {
		$('#my-aliases').html('');
		if (account) {
			Api.setRequestInfo('alias', 'my');

			Api.sendRequest('listAccountAliases', {account: account});
		}
	}
}

function checkAlias(selector) {
	var alias = $(selector).val().replace(/\ /g, '');
	var uri   = "";

	$(selector).val(alias);

	aliasFieldChanged = true;

	if ($(selector).val() != "") {
		var myAlias = false;
		$('#my-aliases tr').each(function(){
			if (alias.toLowerCase() == $(this).children('.alias').attr('data-alias').toLowerCase()) {
				myAlias = true;
				uri     = $(this).children('.uri').attr('data-uri');

				if (uri.substr(0, 5) == "acct:" && uri.substr(-4) == "@nxt") {
					$('#register-alias-type').val('Nxt Account');
					uri = uri.substr(5, (uri.length - 9));
				}

				if (uri.substr(0, 7) == "http://" || uri.substr(0, 8) == "https://")
					$('#register-alias-type').val('URL');
			}
		});

		if (myAlias) {
			alias    = '<strong>' + alias + '</strong>';
			var text = Language.get('messages.aliasEditable', {alias: alias});

			$(selector).parents('.row').find('input.uri').val(uri);

			$(selector).parents('.row').find('.alias-available').fadeOut();
			$(selector).parents('.row').find('.alias-taken').fadeOut();

			$('input.alias').parents('.row').find('.alias-editable').html(text).fadeIn();
		} else {
			Api.sendRequest('getAliasURI', {alias: alias});
		}
	} else {
		$(selector).parents('.row').find('.alias-editable').fadeOut();
		$(selector).parents('.row').find('.alias-available').fadeOut();
		$(selector).parents('.row').find('.alias-taken').fadeOut();
	}
}

function showAliasDialog() {
	$('#modal-register-alias .loading').hide();
	$('#modal-register-alias .form').removeClass('invisible');

	$('#modal-register-alias').foundation('reveal', 'open');

	//ensure transparent background fades in and focus alias field
	setTimeout(function(){
		$('#register-alias-alias').focus();
		$('.reveal-modal-bg').fadeIn();
	}, 250);

	adjustDeadlineTime('register-alias');
}

function showUpdateAliasDialog(type, index) {
	var alias = $('#' + type + '-aliases tr.alias-' + index + ' td.alias').attr('data-alias');
	var uri   = $('#' + type + '-aliases tr.alias-' + index + ' td.uri').attr('data-uri');

	$('#modal-register-alias .alert-box').hide();

	$('#register-alias-type').val('General');

	if (uri.substr(0, 5) == "acct:" && uri.substr(-4) == "@nxt") {
		$('#register-alias-type').val('Nxt Account');
		uri = uri.substr(5, (uri.length - 9));
	}

	if (uri.substr(0, 7) == "http://" || uri.substr(0, 8) == "https://")
		$('#register-alias-type').val('URL');

	$('#register-alias-alias').val(alias.trim());
	$('#register-alias-uri').val(uri);

	showAliasDialog();
}