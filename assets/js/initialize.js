$(document).ready(function(){

	//load views
	loadViews();

	//set language for dates and times
	moment.lang(config.language);

	//get substitution cipher keys
	if (config.secretPhraseCipherCustomKeys)
		Cipher.getKeys('keys-custom');
	else
		Cipher.getKeys();

	//run initialization functions after views have likely been loaded (wait 0.5 seconds)
	setTimeout("initialize();", 500);

});