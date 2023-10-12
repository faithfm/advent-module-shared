const { Providers} = require('advent-module-models');

const core = {

  async fetch_provider(code){
    return await Providers.findOne({code: code});
  },

  async fetch_Providers(){
    return await Providers.find().exec();
  },

  async fetch_provider_by_private_key(key){
    return await Providers.findOne({api_private_key: key});
  },

  async fetch_member(provider_code, mobile){
    let provider = await Providers.findOne({code: provider_code});
    if (provider == null){
      console.log("Provider not found");
      return null;
    }
    return provider.members.find(m => m.mobile === mobile);
  },

  async add_member(code, mobile, role){
    let provider = await this.fetch_provider(code);
    if (provider == null){
      console.log("Provider not found");
      return null;
    }
    if (provider.members == undefined){
      provider.members = [];
    }
    let member = await this.fetch_member(code, mobile);
    if (member != null){
      console.log("Member already exists");
      return member;
    }
    console.log(provider);
    provider.members.push({mobile: mobile, role: role});
    console.log(provider);
    return await provider.save();
  },

  async set_provider_api_pk(code, key){
    let provider = await this.fetch_provider(code);
    if (provider){
      provider.api_private_key = key;
      await provider.save();
    }
    return;
  },

  async create_provider(args){
    let {code, name,  webbook_url, branding_logo_url, service_email, service_email_pwd, service_email_smtp, service_email_port, twilio_sid, twilio_token, twilio_service_number} = args;
    let provider = await this.fetch_provider(code);
    
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