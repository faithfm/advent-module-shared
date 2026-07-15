// lib/index.js
const packageJson = require('../package.json');
const ProviderLogic = require('./provider.logic');
const WebhookLogic = require('./webhook.logic');
const SettingsLogic = require('./settings.logic');
const AuthLogic = require('./auth.logic');
const Utils = require('./utils.logic');
const Obfuscate = require('./obfuscate.logic');
const { createLogger, httpLogger, maskGraphQLStrings, sanitizeLog } = require('./logger.logic');

function info() {
    return packageJson.name + " " + this.version();
}
function version(){
    return packageJson.version;
}

module.exports = {
    info,
    version,
    ProviderLogic,
    WebhookLogic,
    SettingsLogic,
    AuthLogic,
    Utils,
    Obfuscate,
    createLogger,
    httpLogger,
    maskGraphQLStrings,
    sanitizeLog
};