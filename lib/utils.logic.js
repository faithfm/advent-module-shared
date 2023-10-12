const core = {
    
    parseMobile(mobile) {
      
        if (!mobile){
        return;
        }

        // Remove all non-numeric characters
        const cleaned = mobile.replace(/\D/g, '');
        var r = "";

        if (cleaned.startsWith('61')) {
        r = '+' + cleaned;
        } else if (cleaned.startsWith('4')) {
        r = '+61' + cleaned;
        } else if (cleaned.startsWith('04')) {
        r = cleaned.replace(/^04/, '+614');
        } else {
        r = '+61' + cleaned;
        }
        
        return r;
    
    }

}

module.exports = core;