const axios = require('axios');
const ProviderLogic = require('./provider.logic');
const log = require('./logger.logic').internalLogger();

const core = {
    
    async eventPost(type, provider_code, event_data, timestamp = "now"){

        if (timestamp == "now"){
            timestamp = new Date().toISOString()
        }

        const eventData = {            
            event_type: type,
            timestamp: timestamp,
            provider_code: provider_code,
            data: event_data,
        }

        return await this.post(eventData);
    },

    async post(eventData){  
        //console.log("webhook:post()");

        const provider = await ProviderLogic.fetchProvider(eventData.provider_code);

        if (provider == null){
            log.error({ evt: 'webhook.no_provider', providerCode: eventData.provider_code, eventType: eventData.event_type }, 'Cannot post webhook: provider not found');
            return;
        }

        const webhookUrl = provider.webbook_url;

        await axios.post(webhookUrl, eventData)
            .then(response => {
                return {status: "200", message: 'Webhook posted successfully', data: response.data}
            })
            .catch(error => {
                log.error({ err: error, evt: 'webhook.post_failed', providerCode: eventData.provider_code, eventType: eventData.event_type, webhookUrl }, 'Error posting to webhook');
                return {status: "400", message: 'Opps, Something whent wrong! Error posting to webhook!', data: error}
            });
    },

}

module.exports = core;