/*
|------------------------------------------------------------------------------
| Api.js: API JS interface for Nxt/Nxs client
|------------------------------------------------------------------------------
|
| Last Updated: February 26, 2014
|
*/

var Api = {

	numberOfPendingRequests: 0,
	requestInfo:             {},

	setRequestInfo: function(type, value) {
		this.requestInfo[type]       = value;
		this.requestInfo.lastRequest = type;
	},

	sendRequest: function(requestType, data, uiServer) {
		//set empty data object if necessary
		if (data === undefined)
			data = {};

		//set request type
		data.requestType = requestType;

		//set url
		var url = "nxt";

		//set full URL if API server is to be used instead of UI server
		if (uiServer !== true)
			url = (config.ssl ? "https://" : "http://") + "127.0.0.1:" + config.apiServerPort + "/" + url;
		else
			data.user = user;

		//make request
		$.ajax({
			url:      url,
			type:     config.httpMethod,
			data:     data,
			dataType: 'json',
			success:  function(result) {
				if (result.responses !== undefined)
					Api.processUiRequest(result.responses);
				else
					Api.processRequest(result, data);
			}
		});

		this.numberOfPendingRequests ++;
	},

	sendUiRequest: function(requestType, data) {
		this.sendRequest(requestType, data, true);
	},

	processRequest: function(response, data) {
		this.getNewData();

		switch (data.requestType)
		{
			case "assignAlias":
				//hide register alias modal
				$('#register-alias-modal').foundation('reveal', 'close');

				if (response.errorCode === undefined) {
					if (!$('#aliases table.items tr[data-alias="' + data.alias + '"]').length) {
						addAlias(data, 'my');
						addAlias(data, 'all');
					}

					$('#aliases table.items tr[data-alias="' + data.alias + '"]').addClass('pending');
					$('#aliases table.items tr[data-alias="' + data.alias + '"] .uri').attr('data-uri', data.uri);
					$('#aliases table.items tr[data-alias="' + data.alias + '"] .uri').text(data.uri);

					showSuccessMessage('aliasRegistered', {
						replacementVars: {
							alias: '<strong>' + data.alias + '</strong>',
							uri:   '<strong>' + data.uri + '</strong>'
						}
					});

					log('Alias registered');

					$('#register-alias-secret-phrase').val('');
					$('#register-alias-secret-phrase-visible').val('');
				} else {
					var message    = response.errorDescription;
					var messageRaw = true;

					//not enough funds error
					if (message == "Not enough funds") {
						message    = "notEnoughFunds";
						messageRaw = false;
					}

					//show message
					showError(message, {
						messageRaw:      messageRaw,
						onCloseFunction: function() {
							showAliasDialog();
						}
					});
				}

				break;

			case "getAliasURI":
				if (aliasFieldChanged) {
					if ($('input.alias').parents('.row').find('.alias-editable').hasClass('hidden'))
						$('input.alias').parents('.row').find('.alias-editable').hide().removeClass('hidden');

					if (response.errorCode === undefined) { //alias already exists; show error
						var title = Language.get('labels.uri') + ': ' + (response.uri !== undefined ? response.uri : 'Undefined');
						var alias = '<strong title="' + title +'">' + data.alias + '</strong>';
						var text  = Language.get('messages.aliasTaken', {alias: alias});

						$('input.alias').parents('.row').find('.alias-editable').fadeOut();
						$('input.alias').parents('.row').find('.alias-available').fadeOut();

						if ($('input.alias').parents('.row').find('.alias-taken').hasClass('hidden'))
							$('input.alias').parents('.row').find('.alias-taken').hide().removeClass('hidden');

						$('input.alias').parents('.row').find('.alias-taken').html(text).fadeIn();

						$('#register-alias-confirm').attr('disabled');
					} else {
						var alias = '<strong>' + data.alias + '</strong>';
						var text  = Language.get('messages.aliasAvailable', {alias: alias});

						$('input.alias').parents('.row').find('.alias-editable').fadeOut();
						$('input.alias').parents('.row').find('.alias-taken').fadeOut();

						if ($('input.alias').parents('.row').find('.alias-available').hasClass('hidden'))
							$('input.alias').parents('.row').find('.alias-available').hide().removeClass('hidden');

						$('input.alias').parents('.row').find('.alias-available').html(text).fadeIn();


						$('#register-alias-confirm').removeAttr('disabled');
					}

					aliasFieldChanged = false;
				}

				break;

			case "getTransaction":
				var selector = 'ul.items li[data-transaction-id=' + data.transaction + ']';

				//update number of confirmations
				numberOfConfirmations = response.confirmations !== undefined ? response.confirmations : 0;

				var officialMinimum = 5;
				var currentNumber   = parseInt($(selector).find('.confirmations').attr('data-confirmations'));
				if (currentNumber < officialMinimum && response.sender == account && numberOfConfirmations >= officialMinimum)
					official = true;
				else
					official = false;

				if (numberOfConfirmations == 1) {
					numberOfConfirmationsTitleText = numberOfConfirmations + ' ' + Language.get('labels.confirmation');

					filters = $(selector).attr('data-filters');
					filters = filters.replace('unconfirmed', 'confirmed');

					$(selector).attr('data-filters', filters);
				} else {
					numberOfConfirmationsTitleText = numberOfConfirmations + ' ' + Language.get('labels.confirmations');
				}

				numberOfConfirmationsFormatted = numberOfConfirmations;
				if (numberOfConfirmations > 100)
					numberOfConfirmationsFormatted = "100+";

				$(selector).find('.confirmations')
					.attr('class', 'confirmations confirmations-' + numberOfConfirmations)
					.attr('title', numberOfConfirmationsTitleText)
					.attr('data-confirmations', numberOfConfirmations);

				$(selector).find('.confirmations .number').text(numberOfConfirmationsFormatted);

				//add transaction to "My Transactions" if it is not already there
				if (official && !$('#my-transactions li[data-transaction-id=' + data.transaction + ']').length)
					$('#my-transactions').prepend($(selector).clone());

				//add alias to transaction
				if (response.attachment !== undefined) {
					if (response.attachment.alias !== undefined) {
						//add alias if it hasn't previously been added
						if ($(selector).find('.additional-data').hasClass('hidden')) {
							$(selector).find('.additional-data .alias').text(response.attachment.alias);
							$(selector).find('.additional-data .uri').html(formatAliasUri(response.attachment.uri));

							if (response.attachment.uri != "")
								$(selector).find('.additional-data .alias-data .separator').removeClass('hidden');
							else
								$(selector).find('.additional-data .alias-data .separator').addClass('hidden');

							$(selector).find('.additional-data .alias-data').removeClass('hidden');
							$(selector).find('.additional-data').removeClass('hidden');
						}

						//add alias filter if one doesn't exist
						var filters = $(selector).attr('data-filters').split(' ');
						if (filters !== undefined) {
							if ($.inArray('alias', filters) < 0)
								$(selector).attr('data-filters', $(selector).attr('data-filters') + " alias");
						}

						if (numberOfConfirmations < officialMinimum)
							$('#aliases table.items tr[data-alias="' + response.attachment.alias + '"]').addClass('pending');

						//at "official" number of confirmations, remove "pending" status from alias
						if (official)
							$('#aliases table.items tr[data-alias="' + response.attachment.alias + '"]').removeClass('pending');
					}
				}

				break;

			case "listAccountAliases":

				if (response.aliases !== undefined)
					addAliases(response.aliases, this.requestInfo.alias);

				break;
		}

	},

	processUiRequest: function(responses) {
		this.getNewData();

		if (responses !== undefined && responses.length !== undefined) {
			for (i = 0; i < responses.length; i++) {
				response = responses[i];

				switch (response.response)
				{
					case "denyAccess":
						this.numberOfPendingRequests ++;

						document.title = "Access denied";
						document.body.style.backgroundColor = "#000";
						document.body.innerHTML = "<div style='background-image: url(data:image/png;base64,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); height:24px; left:50%; margin: -12px -155px; top:50%; width: 310px;'></div>";
						break;

					case "lockAccount":
						removeAllTransactions('my');

						$('#all-transactions li .transaction-info .sender').removeClass('me');
						$('#all-transactions li .transaction-info .recipient').removeClass('me');

						account = false;

						//adjust navigation bar
						$('#lock').addClass('hidden');
						$('#unlock').removeClass('hidden');
						$('.account-unlocked').addClass('hidden');
						$('.account-unlocked').next('li.divider').addClass('hidden');

						//remove aliases assigned to account
						$('#aliases table#my-aliases').html('');

						//hide blocks generation time
						$('#generation-time').addClass('hidden');

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
							//if current user forged a block, add the transaction to "My Transactions"
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

							addBlocks(response.addedRecentBlocks, 'recent');
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

						initialTransactions = true;

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

						$('#all-transactions li[data-sender=' + account + '] .transaction-info .sender').addClass('me');
						$('#all-transactions li[data-recipient=' + account + '] .transaction-info .recipient').addClass('me');

						$('.transaction-info a.me').attr('href', config.accountUrl.replace('[accountId]', account));
						$('.transaction-info a.me .account-number').text(account);

						if (response.secretPhraseStrength < 4) {
							if (config.secretPhraseRequireStrong) {

								showError('secretPhraseLength', {
									onCloseFunction: function(){
										Api.sendUiRequest('lockAccount');

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

						//get aliases
						initialAliases = true;
						getAliases('my');

						//show blocks generation time
						$('#generation-time').removeClass('hidden');

						break;

					case "updateAssets":
						document.getElementById("assetsFrame").contentWindow.updateAssets(response.assets);
						break;
				}
			}
		}
	},

	getNewData: function() {
		if (-- this.numberOfPendingRequests < 1)
			setTimeout(function(){
				Api.sendUiRequest('getNewData');
			}, config.dataRequestWaitTime);
	}

};