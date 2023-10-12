const axios = require('axios');

const core = {

    getTokenFromPipeline(req, requestToken) {
        // If 'req' is provided, attempt to extract the token from it.
        if (req) {
            const token = this.extractToken(req); // Assuming extractToken is defined in the same context
            if (!token) {
                throw new Error('Unauthorized - No token found');
            }
            return token;
        } 
        
        // If 'requestToken' is provided, use it directly.
        else if (requestToken) {
            return requestToken;
        } 
        
        // If neither 'req' nor 'requestToken' is provided, throw an error.
        throw new Error('Unauthorized - Invalid request made');
    },

    extractToken(req){
        let token = req.headers[process.env.AUTH_TOKEN_KEY];        
        if (token === undefined && req.headers['cookie']){
            // No header token - looking for a cookie.
            let cookie = req.headers['cookie'].split(';'); 
            cookie.forEach(c => {
                let keyvalue = c.split('=');
                if (keyvalue[0].trim() === process.env.AUTH_TOKEN_KEY){
                    token = keyvalue[1];
                }
            });      
        }
        return token;
    },

    async isAuthenticated(context) {
        let { requestToken } = context;
                
        // If requestToken is still not defined, throw an error
        if (!requestToken) {
            throw new Error('Unauthorized - No token found');
        }
    
        // Verify the token
        const t = await this.verifyToken(requestToken); // Assuming verifyToken is defined in the same context
    
        // Check the verification result and throw an error if it fails
        if (t.status !== 200) {
            throw new Error(t.message || 'Unauthorized');
        }
    
        return t;
    },

    async verifyToken(token) {

        // Check if the token is null or undefined
        if (token == null || token === undefined) {
            console.error("Token is null or undefined");
            return {
                status: 401,
                message: "Unauthorized - Token not found",
                data: {}
            };
        }
    
        // Check if the token is a trusted token
        if (token === process.env.API_MACHINE_TRUSTED_TOKEN) {
            console.log("This is a trusted request from another service.");
            return {
                status: 200,
                message: "This is a trusted service",
                data: {
                    mobile: "INTERNAL-API",
                    issued: "N/A",
                    validated: true,
                    expires: "3023-01-01 12:00:00",
                    token: process.env.API_MACHINE_TRUSTED_TOKEN
                }
            };
        }
    
        // Prepare the data to be sent in the request
        const postData = {
            token: token
        };
    
        console.log("Calling Auth Service");
    
        // Send a request to the authentication API to verify the token
        try {
            const response = await axios.post(process.env.API_AUTH_URL + '/auth/verify/token', postData);
            console.log('Request sent to [auth.service] successfully.');
            return response.data;
        } catch (error) {
            console.error('Error sending request:', error);
            return {
                status: 401,
                message: "Something went wrong! We could not validate your token.",
                data: error
            };
        }
    },
    
    


}

module.exports = core;