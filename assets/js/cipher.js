/*
|------------------------------------------------------------------------------
| Cipher.js
|------------------------------------------------------------------------------
|
| Last Updated: February 16, 2014
|
*/

var Cipher = {

	keys: {},
	key:  false,

	characters: [
		//A - Z
		'A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e',
		'F', 'f', 'G', 'g', 'H', 'h', 'I', 'i', 'J', 'j',
		'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o',
		'P', 'p', 'Q', 'q', 'R', 'r', 'S', 's', 'T', 't',
		'U', 'u', 'V', 'v', 'W', 'w', 'X', 'x', 'Y', 'y',
		'Z', 'z',

		//0 - 9
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

		//Other
		'`', '~', '!', '@', '#', '$', '%', '^', '&', '*',
		'(', ')', '-', '_', '=', '+', '[', ']', '{', '}',
		'|', ';', ':', '"', '<', '>', ',', '.', '/', '?',
		' ',

		//Other - Escaped
		'\\', '\'',
	],

	getKeys: function(filename) {
		if (filename === undefined)
			filename = "keys";

		$.getJSON('assets/json/cipher/' + filename + '.json', function(result) {
			Cipher.keys = result;
		});
	},

	createKey: function(index) {
		var key            = [];
		var chars          = this.characters.slice(0);
		var charsRemaining = this.characters.slice(0);
		var randomChar;

		for (c in chars) {
			//get a random character index from those remaining in the array
			randomChar = Math.floor(Math.random() * charsRemaining.length);

			//add translated character for current character
			key.push([
				chars[c],
				charsRemaining[randomChar]
			]);

			//remove character from remaining character array
			var charIndex = charsRemaining.indexOf(charsRemaining[randomChar]);
			charsRemaining.splice(charIndex, 1);
		}

		this.keys[index] = key;

		return key;
	},

	createKeys: function(start, end) {
		if (end === undefined) {
			start = 1;
			end   = start;
		}

		for (i = start; i <= end; i++) {
			this.createKey(i);
		}

		console.log(JSON.stringify(this.keys, null, "\t"));
	},

	resetKeys: function() {
		this.keys = {};
	},

	setKey: function(index) {
		if (this.keys[index] !== undefined) {
			this.key = index;
			return true;
		}

		return false;
	},

	translate: function(string, index, reverse) {
		if (index === undefined)
			index = this.key;

		var key  = this.keys[index];
		var from = 0;
		var to   = 1;

		if (reverse === true) {
			reverse = true;
			from    = 1;
			to      = 0;
		} else {
			reverse = false;
		}

		var translatedString = string;
		for (c in string) {
			for (k in key) {
				if (string[c] === key[k][from])
					translatedString = this.strReplaceAt(translatedString, c, key[k][to]);
			}
		}

		return translatedString;
	},

	untranslate: function(string, index) {
		return this.translate(string, index, true);
	},

	strReplaceAt: function(str, index, character) {
		return str.substr(0, index) + character + str.substr(index+character.length);
	}

};