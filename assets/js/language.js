/*
|------------------------------------------------------------------------------
| Language.js
|------------------------------------------------------------------------------
|
| Last Updated: February 24, 2014
|
*/

var Language = {

	text: {},

	load: function() {
		var path = 'assets/json/language/' + config.language + '.json';
		$.getJSON(path, function(result) {
			Language.text = result;

			Language.replaceText();
		});
	},

	get: function(path, replacementVars) {
		if (path === undefined)
			return this.text;

		var pathStr = path;

		path = path.split('.');

		var message = "";

		if (path.length == 1) {
			message = this.text[path[0]] !== undefined ? this.text[path[0]] : pathStr;
		} else if (path.length == 2) {
			if (this.text[path[0]] === undefined)
				message = pathStr;

			message = this.text[path[0]][path[1]] !== undefined ? this.text[path[0]][path[1]] : pathStr;
		} else if (path.length == 3) {
			if (this.text[path[0]] === undefined || this.text[path[0]][path[1]] === undefined)
				message = pathStr;

			message = this.text[path[0]][path[1]][path[2]] !== undefined ? this.text[path[0]][path[1]][path[2]] : pathStr;
		}

		if (replacementVars !== undefined) {
			for (target in replacementVars) {
				message = message.replace('[' + target + ']', replacementVars[target]);
			}
		}

		return message;
	},

	replaceText: function() {
		$('[data-language-text]').not('.language-text-replaced').each(function(){
			var text      = Language.get($(this).attr('data-language-text'));
			var attribute = $(this).attr('data-language-attribute');

			if (attribute !== undefined)
				$(this).attr(attribute, text);
			else
				$(this).html(text);

			$(this).addClass('language-text-replaced');
		});
	}

};