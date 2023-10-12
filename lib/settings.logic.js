const ProviderLogic = require('./provider.logic');

const core = {
    async fetch_settings(){

        let data = {
            "providers": [],
            "task_types": [
                {
                    "id": "delivery",
                    "icon": "delivery.png",
                    "color": "green",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "processed"},
                        {"id": 3, "status": "sent"},
                        {"id": 4, "status": "completed"}
                    ],
                    "feedback_methods": [
                        {"id": "", "prompt": "(Please Select)"},
                        {"id": "inperson", "prompt": "Handed to Contact"},
                        {"id": "mailbox", "prompt": "Left at Door or in Mailbox"},
                        {"id": "giveup", "prompt": "Unable to Deliver (Giving Up)"}        
                    ],            
                    "complete_prompts": [
                        {"id": 0, "prompt": "We had general chit-chat"},
                        {"id": 1, "prompt": "We had a good conversation"},
                        {"id": 2, "prompt": "We had a spiritual conversation"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I was asked inside"},
                        {"id": 5, "prompt": "I prayed with them"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I will have a follow-up visit"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                },
                {
                    "id": "call",
                    "icon": "call.png",
                    "color": "green",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ], 
                    "feedback_methods": [
                        {"id": "call", "prompt": "Via Phone Call"},
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}
                    ],           
                    "complete_prompts": [
                        {"id": 0, "prompt": "We had general chit-chat"},
                        {"id": 1, "prompt": "We had a good conversation"},
                        {"id": 2, "prompt": "We had a spiritual conversation"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I was asked inside"},
                        {"id": 5, "prompt": "I prayed with them"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I will have a follow-up visit"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                },
                {
                    "id": "sms",
                    "icon": "sms.png",
                    "color": "green",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ],    
                    "feedback_methods": [
                        {"id": "sms", "prompt": "Via SMS"},
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}     
                    ],                       
                    "complete_prompts": [
                        {"id": 0, "prompt": "We had a general exchange"},
                        {"id": 1, "prompt": "We had a good dialog"},
                        {"id": 2, "prompt": "We had a spiritual conversation"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I shared a Bible verse"},
                        {"id": 5, "prompt": "I answered a Bible question"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I have arranged to visit in person"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                },
                {
                    "id": "email",
                    "icon": "email.png",
                    "color": "green",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ],  
                    "feedback_methods": [
                        {"id": "email", "prompt": "Via Email"},
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}           
                    ],                         
                    "complete_prompts": [
                        {"id": 0, "prompt": "We had a general exchange"},
                        {"id": 1, "prompt": "We had a good dialog"},
                        {"id": 2, "prompt": "We had a spiritual conversation"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I shared a Bible verse"},
                        {"id": 5, "prompt": "I answered a Bible question"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I have arranged to visit in person"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                },
                {
                    "id": "social",
                    "icon": "social.png",
                    "color": "green",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ],    
                    "feedback_methods": [
                        {"id": "social", "prompt": "Via Social Media"},  
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}
                    ],                       
                    "complete_prompts": [
                        {"id": 0, "prompt": "We had a general exchange"},
                        {"id": 1, "prompt": "We had a good dialog"},
                        {"id": 2, "prompt": "We had a spiritual conversation"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I shared a Bible verse"},
                        {"id": 5, "prompt": "I answered a Bible question"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I have arranged to visit in person"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                },
                {
                    "id": "bible",
                    "icon": "bible.png",
                    "color": "red",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ],
                    "feedback_methods": [
                        {"id": "", "prompt": "(Please Select)"},
                        {"id": "inperson", "prompt": "In Person"},
                        {"id": "mailbox", "prompt": "Via Mail"},
                        {"id": "call", "prompt": "Via Phone Call"},
                        {"id": "sms", "prompt": "Via SMS"},
                        {"id": "email", "prompt": "Via Email"},
                        {"id": "social", "prompt": "Via Social Media"},
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}        
                    ],                           
                    "complete_prompts": [
                        {"id": 0, "prompt": "We dealt with relationship issues"},
                        {"id": 1, "prompt": "We dealt with health issues"},
                        {"id": 2, "prompt": "We dealt with spiritual issues"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I shared a Bible verse"},
                        {"id": 5, "prompt": "I answered a Bible question"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I have arranged to visit in person"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                }, 
                {
                    "id": "pastoral",
                    "icon": "pastoral.png",
                    "color": "red",
                    "status_process": [
                        {"id": 0, "status": "requested"},
                        {"id": 1, "status": "assigned"},
                        {"id": 2, "status": "ready"},
                        {"id": 3, "status": "completed"}
                    ],         
                    "feedback_methods": [
                        {"id": "", "prompt": "(Please Select)"},
                        {"id": "inperson", "prompt": "In Person"},
                        {"id": "mailbox", "prompt": "Via Mail"},
                        {"id": "call", "prompt": "Via Phone Call"},
                        {"id": "sms", "prompt": "Via SMS"},
                        {"id": "email", "prompt": "Via Email"},
                        {"id": "social", "prompt": "Via Social Media"},
                        {"id": "giveup", "prompt": "Unable to get in touch (Giving Up)"}    
                    ],                  
                    "complete_prompts": [
                        {"id": 0, "prompt": "We dealt with relationship issues"},
                        {"id": 1, "prompt": "We dealt with health issues"},
                        {"id": 2, "prompt": "We dealt with spiritual issues"},
                        {"id": 3, "prompt": "I shared a testimony"},
                        {"id": 4, "prompt": "I shared a Bible verse"},
                        {"id": 5, "prompt": "I answered a Bible question"},
                        {"id": 6, "prompt": "I gave a Bible study"},
                        {"id": 7, "prompt": "I gave them other resource(s)"},
                        {"id": 8, "prompt": "I have arranged to visit in person"},
                        {"id": 9, "prompt": "I invited them to church"}
                    ]
                }                            
            ],
            "status_colors": [
                {"color": "red", "text-color": "white", "status": "requested"},
                {"color": "gray", "text-color": "white", "status": "assigned"},
                {"color": "orange", "text-color": "black", "status": "processed"},        
                {"color": "purple", "text-color": "white", "status": "sent"},
                {"color": "green","text-color": "white", "status": "ready"},
                {"color": "blue", "text-color": "white", "status": "completed"}
            ],
            "method_colors": [
                {"method": "inperson", "color": "green"},
                {"method": "mailbox", "color": "gray"},
                {"method": "call", "color": "orange"},
                {"method": "sms", "color": "orange"},
                {"method": "email", "color": "orange"},
                {"method": "social", "color": "orange"},
                {"method": "giveup", "color": "red"}    
            ],
            "interest_level":[
                {"visible": true, "value": 0, "name": "Unknown Interest", "color": "gray"},
                
                {"visible": true, "value": 1, "name": "Very Low Interest", "color": "gray"},                
                {"visible": false, "value": 2, "name": "Very Low Interest", "color": "gray"},
                
                {"visible": true, "value": 3, "name": "Low Interest", "color": "gray"},
                {"visible": false, "value": 4, "name": "Low Interest", "color": "gray"},
                
                {"visible": true, "value": 5, "name": "Moderate Interest", "color": "orange"},
                {"visible": false, "value": 6, "name": "Moderate Interest", "color": "orange"},
                
                {"visible": true, "value": 7, "name": "High Interest", "color": "red"},
                {"visible": false, "value": 8, "name": "High Interest", "color": "red"},
               
                {"visible": true, "value": 9, "name": "Extremely Interested", "color": "red"},
                {"visible": false, "value": 10, "name": "Extremely Interested", "color": "red"}
            ]
        };

        var providers = await ProviderLogic.fetch_providers();
        
        data.providers = providers.map(provider => {
            return {
              name: provider.name,
              code: provider.code,
              branding_logo_url: provider.branding_logo_url
            };
          });
        
        data.version = "1.0";

        return data;
    }    

}

module.exports = core;