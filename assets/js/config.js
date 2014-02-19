/*
|------------------------------------------------------------------------------
| Nxs - Nxt Client Mod
|------------------------------------------------------------------------------
|
| Created By:   Cody Jassman
| Version:      0.2.8
| Last Updated: February 18, 2014
| 
| The Nxs GUI system (pronounced "Nexus") for the official Nxt client is a
| major user interface improvement over the standard browser-based client. Nxs
| does the following:
|
|     -integrates modern JS solutions such as jQuery 2 and the HandlebarsJS
|      templating engine
|
|     -allows the creation of auto-generated random secret phrases and the use
|      of substitution ciphers to obfuscate dictionary word-based phrases
|
|     -includes language files for English, French, German, and Spanish
|
|     -includes this configuration file which allows high customization of the
|      user experience
|
*/

var config = {

	/*
	|--------------------------------------------------------------------------
	| Language
	|--------------------------------------------------------------------------
	|
	| The current language set. Defaults to "en" (English). Refer to filenames
	| in "assets/json/language" directory for available languages.
	|
	*/
	'language': 'en',

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase
	|--------------------------------------------------------------------------
	|
	| Set this to automatically unlock your account.
	|
	| WARNING: DO NOT USE THIS FEATURE WITH ACCOUNTS THAT HAVE ANYTHING
	| MORE THAN PETTY BALANCES ON IT.
	|
	| This feature should only be used when testing accounts with small
	| balances because of the security risk with your account that using
	| this feature creates.
	|
	*/
	'secretPhrase': false,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase Hint
	|--------------------------------------------------------------------------
	|
	| This hint will show up in the Unlock Account modal window if it is set.
	| As a security precaution, it is best not to include anything that could
	| reasonably identify the secret phrase to anyone but yourself. If used
	| at all, it should be coupled with some sort of personal mnemonic that
	| would only help you a little bit to identify your secret phrase.
	|
	*/
	'secretPhraseHint': false,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase - Field Default to Visible
	|--------------------------------------------------------------------------
	|
	| If true, the visible secret phrase field (where you can see the
	| characters on the screen as you type them) will be checked when Nxs is
	| started.
	|
	*/
	'secretPhraseFieldDefaultVisible': true,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase - Require Strong
	|--------------------------------------------------------------------------
	|
	| If true, a strong secret phrase will be required. It is recommended to
	| leave this setting turned on except for testing purposes.
	|
	*/
	'secretPhraseRequireStrong': true,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase - Auto Cipher
	|--------------------------------------------------------------------------
	|
	| If this is set, the selected substitution cipher is automatically run on
	| secret phrases.
	|
	*/
	'secretPhraseAutoCipher': false,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase - Cipher Custom Keys
	|--------------------------------------------------------------------------
	|
	| If this is set, the substitution cipher will look for keys in a custom
	| file at "assets/json/cipher/keys-custom.json". Otherwise, the standard
	| "assets/json/cipher/keys.json" will be used.
	|
	*/
	'secretPhraseCipherCustomKeys': false,

	/*
	|--------------------------------------------------------------------------
	| Secret Phrase - Generated Length
	|--------------------------------------------------------------------------
	|
	| The length of an automatically generated secret phrase.
	|
	*/
	'secretPhraseGeneratedLength': 50,

	/*
	|--------------------------------------------------------------------------
	| Default Fee
	|--------------------------------------------------------------------------
	|
	| The default fee in NXT.
	|
	*/
	'defaultFee': 1,

	/*
	|--------------------------------------------------------------------------
	| Date Time Format
	|--------------------------------------------------------------------------
	|
	| The format for date times according to Moment.js (http://momentjs.com).
	|
	*/
	'dateTimeFormat': 'MMMM Do YYYY, h:mm:ss a',

	/*
	|--------------------------------------------------------------------------
	| Decimal
	|--------------------------------------------------------------------------
	|
	| The symbol for decimals in NXT amounts.
	|
	*/
	'decimal': '.',

	/*
	|--------------------------------------------------------------------------
	| Thousands Separator
	|--------------------------------------------------------------------------
	|
	| The symbol for separating thousands in NXT amounts.
	|
	*/
	'thousandsSeparator': ',',

	/*
	|--------------------------------------------------------------------------
	| Block URL
	|--------------------------------------------------------------------------
	|
	| The URL of a block explorer web page for a specific transaction. The text
	| "[transactionId]" will automatically be replaced with the transaction ID.
	|
	*/
	'blockUrl': 'http://blocks.nxtcrypto.org/nxt/nxt.cgi?action=1000&blk=[blockId]',

	/*
	|--------------------------------------------------------------------------
	| Account URL
	|--------------------------------------------------------------------------
	|
	| The URL of a block explorer web page for a specific account. The text
	| "[accountId]" will automatically be replaced with the account ID.
	|
	*/
	'accountUrl': 'http://blocks.nxtcrypto.org/nxt/nxt.cgi?action=3000&acc=[accountId]',

	/*
	|--------------------------------------------------------------------------
	| Transaction URL
	|--------------------------------------------------------------------------
	|
	| The URL of a block explorer web page for a specific transaction. The text
	| "[transactionId]" will automatically be replaced with the transaction ID.
	|
	*/
	'transactionUrl': 'http://blocks.nxtcrypto.org/nxt/nxt.cgi?action=2000&tra=[transactionId]',

	/*
	|--------------------------------------------------------------------------
	| Send - Require Double-Click
	|--------------------------------------------------------------------------
	|
	| Require a double-click of the "Send" button to send. By default, this is
	| turned on to prevent accidental sending.
	|
	*/
	'sendRequireDoubleClick': true,

	/*
	|--------------------------------------------------------------------------
	| Console Logging
	|--------------------------------------------------------------------------
	|
	| Set this to true to log actions in the console. This can be useful for
	| troubleshooting issues.
	|
	*/
	'consoleLogging': true,

	/*
	|--------------------------------------------------------------------------
	| Version
	|--------------------------------------------------------------------------
	|
	| The current version number of Nxs. This variable should not be changed.
	|
	*/
	'version': '0.2.8',

}