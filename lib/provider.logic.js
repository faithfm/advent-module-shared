const { Providers } = require('advent-module-models');

const core = {

  async fetchProvider(code){
    return await Providers.findOne({code: code});
  },

  async fetchProviders(){
    return await Providers.find().exec();
  },

  async fetchProviderByPrivateKey(key){
    return await Providers.findOne({api_private_key: key});
  },

  async fetchMember(provider_code, mobile){
    let provider = await Providers.findOne({code: provider_code});
    if (provider == null){
      console.log("Provider not found");
      return null;
    }
    return provider.members.find(m => m.mobile === mobile);
  },

  async addMember(code, mobile, role){
    let provider = await this.fetchProvider(code);
    if (provider == null){
      console.log("Provider not found");
      return null;
    }
    if (provider.members == undefined){
      provider.members = [];
    }
    let member = await this.fetchMember(code, mobile);
    if (member != null){
      //console.log("Member already exists");
      return member;
    }
    provider.members.push({mobile: mobile, role: role});
    return await provider.save();
  },

  async setProviderApiPk(code, key){
    let provider = await this.fetchProvider(code);
    if (provider){
      provider.api_private_key = key;
      await provider.save();
    }
    return;
  },

  async createProvider(args){
    let {code, name,  webbook_url, branding_logo_url, service_email, service_email_pwd, service_email_smtp, service_email_port, twilio_sid, twilio_token, twilio_service_number} = args;
    let provider = await this.fetchProvider(code);
    
    if (provider != null){
      console.log("Provider already exists");
    } else {
      var args = {
        code,
        name,
        twilio_sid,
        twilio_token,
        twilio_service_number,
        webbook_url,
        branding_logo_url,
        service_email, 
        service_email_pwd, 
        service_email_smtp, 
        service_email_port,
        members: []
      }
      provider = new Providers(args);
      await provider.save();
    }
    return provider;
  }

}

module.exports = core;