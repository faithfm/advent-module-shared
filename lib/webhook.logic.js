const axios = require('axios');
const ProviderLogic = require('./provider.logic');

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
            console.log("Opps. No provider infomation.");
            return;
        }

        const webhookUrl = provider.webbook_url; 

        await axios.post(webhookUrl, eventData)
            .then(response => {
                return {status: "200", message: 'Webhook posted successfully', data: response.data}
            })
            .catch(error => {
                console.log(error);
                return {status: "400", message: 'Opps, Something whent wrong! Error posting to webhook!', data: error}
            });
    },

}

module.exports = core;