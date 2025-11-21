// EmailJS Wrapper - Direct API Implementation
// This bypasses the need for CDN by making direct API calls to EmailJS

const EmailJS = {
    publicKey: "gk25DG3678o3wd9yM",
    serviceId: "service_ge2gknw",
    templateId: "template_5iwy6n5",
    
    init(publicKey) {
        if (publicKey) {
            this.publicKey = publicKey;
        }
        console.log('✅ EmailJS wrapper initialized with public key:', this.publicKey);
        return this;
    },
    
    async send(serviceId, templateId, templateParams) {
        const apiEndpoint = `https://api.emailjs.com/api/v1.0/email/send`;
        
        const payload = {
            service_id: serviceId || this.serviceId,
            template_id: templateId || this.templateId,
            user_id: this.publicKey,
            template_params: templateParams
        };
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            // EmailJS API returns "OK" as plain text, not JSON
            const responseText = await response.text();
            let result;
            
            try {
                // Try to parse as JSON first
                result = JSON.parse(responseText);
            } catch (e) {
                // If not JSON, it's likely "OK" or similar text response
                result = { text: responseText || 'OK' };
            }
            
            return {
                status: response.status,
                text: result.text || result || 'Email sent successfully'
            };
        } catch (error) {
            console.error('EmailJS API Error:', error);
            throw error;
        }
    }
};

// Create global emailjs object for compatibility
if (typeof window !== 'undefined') {
    window.emailjs = EmailJS;
}

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailJS;
}

