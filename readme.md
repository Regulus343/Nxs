Nxs
===

**A versatile web interface for the official Nxt client for the Nxt cryptocurrency**

Nxs, pronounced "Nexus" as Nxt is pronounced "Next", is a modified version of the default NRS web app of the official Nxt client that includes many new features and a more modern design. Some of Nxs' features include:

- a jQuery solution for loading separate HTML views, rather than the `<iframe>` tag solution of the original client
- Zurb Foundation 5 as the CSS base
- Handlebars JS templates which prevent the need for HTML markup within the JS files
- Ability to use keyboard shortcuts to lock/unlock accounts, send Nxt, and more...
- A very clean, compartmentalized folder structure to make customization easy
- Ability to set a language for labels and messages (language text can be customized by modifying JSON files)
- Ability to show a hint on the `Unlock Account` dialog
- Ability to display a QR code of the currently unlocked account
- Ability to filter transactions by sent, received, confirmed, or unconfirmed
- Ability to run secret phrases through a substitution cipher (of which there are 100 by default) to obfuscate dictionary words
- Ability to register aliases

## Table of Contents

- [Installation](#installation)
- [Unlocking an Account](#unlocking-account)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Automatically Unlocking an Account on Startup](#auto-unlocking-account)
- [Security and Trust of Nxs](#security)
- [Credits and Donation](#credits)
- [License](#license)

<a name="composer-package-installation"></a>
## Installation

To install Nxs, first [install the official Nxt client](http://www.nxtcrypto.org/nxt-coin/client-download). Make sure you check the SHA-256 hash to verify its integrity. Then, unzip the files into a directory.

**Version 0.8+:**

Next, (download Nxs)[https://github.com/Regulus343/Nxs/archive/master.zip] and copy the directory to the `html` directory of the Nxt client and rename it to `nxs`. Then, open `conf/nxt-default.properties` and change `nxt.uiResourceBase` to `html/nxs`:

	nxt.uiResourceBase=html/nxs

You will also have to change `nxt.apiServerCORS` to `true` to allow API server requests (default port 7876) to be made from the UI server (default port 7875):

	nxt.apiServerCORS=true

If you intend to change the `nxt.apiServerPort` variable, make sure you also change the `apiServerPort` variable in `html/nxs/assets/js/config.js` to match it.

**Prior to Version 0.8:**

Next, (download Nxs)[https://github.com/Regulus343/Nxs/archive/master.zip] and copy the directory to the `webapps/root` directory of the Nxt client and rename it to `nxs`. Then, open `etc/webdefault.xml` and add this:

	<init-param>
		<param-name>relativeResourceBase</param-name>
		<param-value>/nxs</param-value>
	</init-param>

**Run Nxt from the command line:**

Run Nxt from the command line and open Nxs in the browser (at `http://localhost:7875` by default). The Nxs client should now display.

<a name="unlocking-account"></a>
## Unlocking an Account

You may type a secret phrase to unlock an account. Please choose something secure. 50+ characters is recommended. Clicking the `Show Phrase` checkbox will show your secret phrase as you type it so you may check it for mistakes. Otherwise, the characters will be hidden as you type them. You may set a secret phrase hint in the config file in `assets/js/config.js`. This may help you to remember your secret phrase. Do not use something specific enough to help someone else figure out your secret phrase should your computer ever become breached. If the hint is used, it should be somewhat vague. There is also a `Generate` button to randomly generate a new account secret phrase for you and a `Cipher` button with available substitution ciphers. This can be useful if you are using a unique phrase of dictionary words which you would like to obfuscate through substitution.

<a name="keyboard-shortcuts"></a>
## Keyboard Shortcuts

**"L": Lock Account**

If an account is currently unlocked, you may lock it by pressing the `L` key.

**"U": Unlock Account**

At any time, you may open the `Unlock Account` dialog by pressing the `U` key. If an account is already unlocked, it will lock the current account and then bring up the `Unlock Account` dialog.

**"S": Send**

To open the `Send` dialog, you may press the `S` key.

**"Q": Show QR Code**

To show the QR code of the currently unlocked account, you may press the `Q` key.

**"N": Toggle Navigation Menu**

To slide the navigation menu larger or smaller, you may press the `N` key (as an alternative to clicking the right edge of the pages navigation menu). There is a short format that just shows the icons of the pages and a wider format that includes the name of the page as well.

<a name="unlocking-account"></a>
## Automatically Unlocking an Account on Startup

In `assets/js/config.js`, you may set a secret phrase to unlock an account with on startup.

> **Warning:** This feature should only be used when testing accounts with small balances because of the security risk with your account that using this feature creates. Do not use this feature for accounts with anything more than a petty balance.

<a name="security"></a>
## Security and Trust of Nxs

Because Nxs is third-party software that works with the official Nxt Client, you should be skeptical at first and audit the code for yourself (you should be able to audit all of the javascript code for remote ajax requests in the span of about 10 minutes). The community should be diligent in checking that the Nxs code is doing what it claims to be doing and also to extend the same diligence and skepticism towards any forks of Nxs that are developed by others. It should go without saying that financial software requires careful analysis to prevent theft.

With that said, I am putting Nxs out under my real name (Cody Jassman) and am personally endorsing the product and making the claim that there is absolutely no nefarious motive to Nxs. I have created Nxs because I believe in the Nxt cryptocurrency and want to offer my web development skills to further the ease-of-use and available features that the Nxt Client offers. I acknowledge that jQuery's $.ajax() method is used twice: once in `assets/js/language.js` and once in `assets/js/cipher.js`, but the requests are being made to local `JSON` files that contains the labels and messages for the selected language in `assets/js/config.js` and the array of available substitution ciphers for your secret phrases. You should never see an `xmlhttprequest` call being made to a remote server of any kind.

You should also, as mentioned above, avoid the use of the `secretPhrase` setting in the config file except for testing purposes or working with small balances that you do not fear losing.

**Generating New Secret Phrases**

You may generate a new secret phrase by clicking the `Generate` button in the bottom right of the secret phrase field. The default length, set in the config file, is 50 characters. This feature uses a simple Javascript function that uses Math.random() for each character it adds to the secret phrase.

**Using Substitution Ciphers**

You can use any of the 100 predefined substitution ciphers to obscure your secret phrase if it is made up of dictionary words. To cipher your typed-in secret phrase, click the `Cipher` button in the bottom right of the secret phrase field. You may now click one of the numbers to use that substitution cipher. The keys can be found in `assets/json/cipher/keys.json`. You may also generate your own unique substitution ciphers with the `Cipher.createKeys()` Javascript function. If you do this, it is recommended you save them in a JSON file at `assets/json/cipher/keys-custom.json` and then change the `Secret Phrase - Cipher Custom Keys` variable in the config file to `true`. This way, you are less likely to overwrite your custom keys file when you upgrade Nxs. To further ensure you don't overwrite your custom keys file, you should be sure to backup this file.

<a name="credits"></a>
## Credits and Donation

Nxs was created by Cody Jassman based on the original web app portion of the official Nxt Client (a big thank you to the original developers!). If you appreciate Nxs and would like to support it's further development, you may donate some Nxt to:

	865968340266651500

If you enjoy the software and cannot spare a Nxt donation, don't worry about it. Nxs was created to be a free and useful app for everyone that uses the official Nxt Client! Please recommend Nxs if you believe that it is good software.

If you have any questions, comments, or concerns about Nxs, please do not hesitate to contact me at [me@codyjassman.com](mailto:me@codyjassman.com) or on Twitter at [@CodyJassman](https://twitter.com/CodyJassman).

**Special Thanks**

Special thanks to the following people or organizations for their contribution to the Nxs project:

- the developers of the official Nxt Client
- [NXT Spain](http://nxtspain.org) for translating the language file to Spanish
- [nxtcoin.fr](https://twitter.com/nxtcoinfr) for translating the language file to French
- [NXTcoin_de](https://twitter.com/NXTcoin_de) for translating the language file to German
- the developers of the other Nxt clients such as [dotNXT](http://dotnxtclient.blogspot.ca), [clieNXT](https://bitbucket.org/fmiboy), [NXT Solaris](http://nxtsolaris.wordpress.com), [Offspring](http://offspring.dgex.com), and [NXT Wallet](http://nxtra.org/nxt-client)
- the rest of the wonderful Nxt community for their hard work and support

<a name="license"></a>
## License

Nxs is MIT licensed. Do what you want with it! Nxs is intended to be used by anyone that uses Nxt and may be freely modified as you see fit.