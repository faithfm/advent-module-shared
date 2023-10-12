// lib/index.js
const ProviderLogic = require('./provider.logic');
const WebhookLogic = require('./webhook.logic');

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
    WebhookLogic
};