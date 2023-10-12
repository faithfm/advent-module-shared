// lib/index.js
const ProviderLogic = require('./provider.logic');
const WebhookLogic = require('./webhook.logic');
const SettingsLogic = require('./settings.logic');
const AuthLogic = require('./auth.logic');
const Utils = require('./utils.logic');

function info() {
    return "Advent Services Shared Logic " + this.version();
}
function version(){
    return "1.0";
}

module.exports = {
    info,
    version,    
    ProviderLogic,
    WebhookLogic,
    SettingsLogic,
    AuthLogic,
    Utils
};