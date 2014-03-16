Nxs Change Log
==============

## 2014.03.16 :: 0.3.7

- Unlock account was giving a different account number than NRS because jQuery already encoded data which had already been encoded using encodeURIComponent(). If you previously created an account using Nxs and your secret phrase is no longer returning your previous account number, try this in javascript to get a secret phrase that will work going forward:

	var secretPhrase = "Your secret phrase";
	alert(encodeURIComponent(secretPhrase));

- Send message dialog is a work in progress. It has not been tested yet, so it is currently disabled.

- Italian language file has been added thanks to Nextcoin.org forum user "redsn0w".

- Working on testnet config settings to allow easy switch to test network [incomplete].

## 2014.03.01 :: 0.3.6

- Clicking the Nxt logo in the top menu bar brings up the `About Nxs` dialog with a section for updating Nxt and Nxs. The table shows the current version numbers of each, along with the latest version numbers for comparison (which are URIs to aliases on the blockchain). If either is out of date, an `Update` button is shown with a direct download link to the Nxt and/or Nxs zip files. When the latest Nxt client is downloaded, the same drag & drop feature from the original NRS app's `update.html` page is available allowing you to drag and drop the downloaded file to check the SHA-256 hash.

- New Linux shell scripts have been created to aid with installation and updating at `installation/install.sh` and `installation/update.sh`, respectively. The `install.sh` and `update.sh` scripts are still very much in "alpha" right now and should be treated as such. There may be issues with them and I encourage the community to check that the SHA-256 hash verifying portion of `install.sh` is working as it should. Any help with this is greatly appreciated, as getting an easy update process implemented now will make it much more likely that people keep both Nxt NRS and Nxs up-to-date.

- Because of the new updating shell script, config has been moved from `assets/js/config.js` to `assets/js/config/default.js`. This allows another config file to be used, `assets/js/config/custom.js`, which allows a user to overwrite specific variables. The `custom.js` config file will not be overwritten by the update script while `default.js` will be overwritten to allow new config variables to be created in later versions of Nxs.

- Removed `admin.html`, `message.html`, and `update.html`. The former two are available in NRS' `html/tools` directory and will soon be directly implemented into the Nxs interface. The latter is now built into the new `About Nxs` dialog.

## 2014.02.26 :: 0.3.5

- Corrected issue with colors of confirmation numbers (1 - 3 confirmations was displaying green instead of orange). Also, the color progression of confirmation colors occurs over 0 - 20 confirmations instead of 0 - 10.

- New unconfirmed transactions are now being added to the top of the `All Transactions` area.

- When an account is locked, unconfirmed transactions sent or received by that account no longer show up in blue in the `All Transactions` area. When a new account is unlocked, its sent/received unconfirmed transactions will automatically be highlighted in blue.

- When a new alias is registered or updated, it shows up in the `My Aliases` area and is `pending` until it gets at least 5 confirmations. While an alias is `pending`, the text color is pink and the `Update URI` button does not appear.

## 2014.02.25 :: 0.3.4

- All UI / API server requests now use POST HTTP method instead of GET.

- Alias transactions now show the Alias and URI registered or updated.

- Side bar added which provides room for advanced Nxt features such as messages, aliases, polls, and the asset exchange. The top navigation now shows only the `Send` button and actions associated with the currently selected page.

- Pages interface completely revamped to show only one page at a time instead of the old navigation system where you could toggle widgets on and off and display multiple widgets at a time. The initial version with toggling widgets made too much of an attempt to emulate Nxt's default NRS GUI instead of rethinking the interface altogether.

- Aliases can now be registered. You can also view all of the aliases associated with the currently unlocked account on the `Aliases` page. You may filter your aliases by `General`, `Nxt Account`, and `URL` types. On the `Register Alias` dialog, these same types can be selected. If you choose `URL`, the URI is automatically prefixed by `http://` if the URI does not already begin with `http://` or `https://`. If you choose `Nxt Account`, the account number your enter will be wrapped with `acct:` and `@nxt`. Nxs has taken a cue from the [NXTRA NXT Wallet](http://nxtra.org/nxt-client) for the format. The more standardized this becomes, the better functionality Nxt's Alias system will have.

- API functions have been separated from `assets/js/nxt/core.js` and placed in `assets/js/nxt/api.js` in `Api` object.

- Various new config variables added. Some have been added out of necessity such as `apiServerPort` which must be the same as `nxt.apiServerPort` in Nxt's `conf/nxt-default.properties` or `conf/nxt.properties`.

- Improved real-time updating of numbers of confirmations for transactions.

- Made rate of requests for new data adjustable allowing Nxs to potentially run more smoothly on older computers.

- Bug corrected where the block forge estimation time text was displayed when no account was unlocked.

- Added timestamps to console log entries.

- Readme installation instructions now include instructions for installing Nxs for 0.8+ as well as prior to 0.8.

## 2014.02.17 :: 0.2.8

The first open source version of Nxs.