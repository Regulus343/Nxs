/*
|------------------------------------------------------------------------------
| Custom Config
|------------------------------------------------------------------------------
|
| Config variable definitions made in this file will not be overwritten by the
| "update.sh" shell script if you use it to update Nxs. Simply override the
| variables in the "config/default.js" that you would like to modify like:
|
| Config.language = "en";
|
| The update shell script will backup this file when it overwrites the Nxt and
| Nxs files and will then automatically copy it back to "assets/js/config".
| The reason a custom config file is needed is because "config/default.js"
| must be updated from time to time to include new variables. Because of this,
| it is necessary to have a second config file where a user can modify just
| the variables they need to while allowing the Config object to include any
| new ones that are added in subsequent Nxs versions.
|
*/