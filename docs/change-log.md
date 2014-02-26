Nxs Change Log
==============

## 2014.02.25 :: 0.3.4

- All UI / API server requests now use POST HTTP method instead of GET.

- Alias transactions now show the Alias and URI registered or updated.

- Side bar added which provides room for advanced Nxt features such as messages, aliases, polls, and the asset exchange. The top navigation now shows only the `Send` button and actions associated with the currently selected page.

- Pages interface completely revamped to show only one page at a time instead of the old navigation system where you could toggle widgets on and off and display multiple widgets at a time. The initial version with toggling widgets made too much of an attempt to emulate Nxt's default NRS GUI instead of rethinking the interface altogether.

- Aliases can now be registered. You can also view all of the aliases associated with the currently unlocked account on the `Aliases` page. You may filter your aliases by `General`, `Nxt Account`, and `URL` types. On the `Register Alias` dialog, these same types can be selected. If you choose `URL`, the URI is automatically prefixed by `http://` if the URI does not already begin with `http://` or `https://`. If you choose `Nxt Account`, the account number your enter will be wrapped with `acct:` and `@nxt`. Nxs has taken a cue from the [NXTRA NXT Wallet](http://nxtra.org/nxt-client) for the format. The more standardized this becomes, the better functionality Nxt's Alias system will have.

- API functions have been separated from `assets/js/nxt/core.js` and placed in `assets/js/nxt/api.js` in `Api` object.

- Various new config variables added. Some have been added out of necessity such as `apiServerPort` which must be the same as `nxt.apiServerPort` in Nxt's `conf/nxt-default.properties` or `conf/nxt.properties`.

- Improved real-time updating of numbers of confirmations for transactions.

- Made rate of request for new data adjustable allowing Nxs to potential run more smoothly on older computers.

- Bug corrected where the block forge estimation time text was displayed when no account was unlocked.

- Added timestamps to console log entries.

- Readme installation instructions now include instructions for installing Nxs for 0.8+ as well as prior to 0.8.

## 2014.02.17 :: 0.2.8

The first open source version of Nxs.