// Trawish Cakes Email Service using EmailJS
// All emails sent from trawishcakes@gmail.com via EmailJS

const TrawishEmailService = {
    // Initialize EmailJS
    init() {
        try {
            // Check if EmailJS is available (either from CDN or local wrapper)
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.warn('⚠️ EmailJS library not loaded yet. Make sure emailjs-wrapper.js is included.');
                this.isInitialized = false;
                return false;
            }
            
            // Initialize EmailJS with your public key
            emailjsLib.init("gk25DG3678o3wd9yM");
            this.isInitialized = true;
            console.log('✅ EmailJS initialized successfully');
            return true;
        } catch (e) {
            console.error('❌ EmailJS initialization error:', e);
            this.isInitialized = false;
            return false;
        }
    },

    // Service ID and Template ID
    config: {
        serviceId: 'service_ge2gknw',
        templateId: 'template_5iwy6n5'
    },

    // Cake-related family-friendly quotes
    quotes: {
        orderPlaced: [
            "🎂 Life is uncertain. Eat dessert first!",
            "🍰 A party without cake is just a meeting!",
            "🎉 Cake is happiness! If you know the way of the cake, you know the way of happiness!",
            "✨ Every celebration needs a cake, and every cake needs a celebration!",
            "💝 A cake is a sweet reminder that life is meant to be enjoyed!",
            "🌟 The best memories are made around the cake!",
            "🎊 Cake is the answer, no matter what the question is!",
            "💖 Sharing cake is sharing love!"
        ],
        invoiceGenerated: [
            "💰 Good things come to those who bake... and pay! 😊",
            "🎂 Your dream cake is just a payment away!",
            "💝 Great cakes are worth every penny!",
            "✨ Sweet moments are worth investing in!",
            "🎉 Quality ingredients make quality cakes!",
            "🌟 Every great celebration starts with a great cake!",
            "💖 Your special day deserves a special cake!",
            "🍰 Investing in happiness, one cake at a time!"
        ],
        paymentConfirmed: [
            "✅ Your order is confirmed! Get ready for something sweet! 🎂",
            "🎉 Payment received! Your cake journey begins now!",
            "✨ Confirmed! We're baking something amazing for you!",
            "💝 Your order is locked in! Sweet times ahead!",
            "🌟 All set! Your special cake is in the works!",
            "🎊 Payment confirmed! Let the celebration planning begin!",
            "💖 We've got your order! Time to get excited!",
            "🍰 Confirmed! Your cake adventure starts here!"
        ],
        orderReady: [
            "🎂 Your cake is ready! Time to celebrate!",
            "🎉 Pickup time! Your delicious cake awaits!",
            "✨ Your masterpiece is ready for pickup!",
            "💝 Ready to go! Your special cake is waiting!",
            "🌟 The moment you've been waiting for is here!",
            "🎊 Your cake is ready! Let the celebration begin!",
            "💖 Pickup ready! Your sweet treat is prepared!",
            "🍰 Ready for pickup! Your cake is as sweet as you imagined!"
        ],
        orderDelivered: [
            "🎉 Thank you for choosing Trawish Cakes! Enjoy your celebration!",
            "💝 We hope your cake made your day extra special!",
            "✨ Thank you for trusting us with your celebration!",
            "🎂 Wishing you sweet moments and happy memories!",
            "🌟 Thank you for being part of the Trawish Cakes family!",
            "💖 We're honored to be part of your special day!",
            "🍰 Enjoy every slice and every moment!",
            "🎊 Thank you! May your celebrations be as sweet as our cakes!"
        ],
        rejection: [
            "💔 We're sorry we couldn't fulfill your request this time.",
            "😔 Sometimes the best cakes need the right timing.",
            "🙏 We appreciate your interest and hope to serve you in the future.",
            "💝 Thank you for considering Trawish Cakes for your celebration."
        ]
    },

    // Get random quote for email type
    getRandomQuote(type) {
        const quoteArray = this.quotes[type] || this.quotes.orderPlaced;
        return quoteArray[Math.floor(Math.random() * quoteArray.length)];
    },

    // Build HTML email content with professional styling
    buildEmailHTML(title, emoji, content, quote, showRegards = false, showLoginLink = false) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; background: #f9f9f9; }
        .title-section { text-align: center; margin-bottom: 25px; }
        .title-section h2 { color: #667eea; font-size: 24px; margin: 10px 0; }
        .emoji { font-size: 48px; margin: 10px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .order-table th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; font-weight: 600; }
        .order-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .order-table tr:last-child td { border-bottom: none; }
        .order-table tr:nth-child(even) { background: #f8f9fa; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-ready { background: #cfe2ff; color: #084298; }
        .status-delivered { background: #d1e7dd; color: #0f5132; }
        .quote-section { background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; font-style: italic; font-size: 16px; color: #2d3436; }
        .footer { padding: 20px 30px; background: #2d3436; color: white; text-align: center; border-radius: 0 0 10px 10px; }
        .footer a { color: #667eea; text-decoration: none; }
        .login-link { background: #667eea; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; display: inline-block; margin: 15px 0; font-weight: 600; }
        .regards { margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee; }
        .regards p { margin: 5px 0; }
        .regards strong { color: #667eea; }
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .order-table { font-size: 14px; }
            .order-table th, .order-table td { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎂 Trawish Cakes</h1>
        </div>
        <div class="content">
            <div class="title-section">
                <div class="emoji">${emoji}</div>
                <h2>${title}</h2>
            </div>
            ${content}
            ${quote ? `<div class="quote-section">${quote}</div>` : ''}
            ${showLoginLink ? `
            <div style="text-align: center; margin: 25px 0;">
                <p style="margin-bottom: 15px;">📱 <strong>Track Your Order Status</strong></p>
                <p style="margin-bottom: 15px; color: #667eea; font-weight: 600;">Please log in to the website to see your order status and track your order progress.</p>
            </div>
            ` : ''}
            ${showRegards ? `
            <div class="regards">
                <p><strong>Best Regards,</strong></p>
                <p><strong>Trawish Cakes Team</strong></p>
                <p>📧 Email: k.kajalranjan@gmail.com</p>
                <p>📍 Address: 1103 Solacia Phase 1 Solacia Internal Road, RMC Garden, Wagholi, Pune, Maharashtra 412207, India</p>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Trawish Cakes. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    },

    // Build order details table
    buildOrderTable(order) {
        return `
<table class="order-table">
    <tr>
        <th>Order Information</th>
        <th>Details</th>
    </tr>
    <tr>
        <td><strong>Order ID</strong></td>
        <td>${order.orderId}</td>
    </tr>
    <tr>
        <td><strong>Customer Name</strong></td>
        <td>${order.customerName}</td>
    </tr>
    <tr>
        <td><strong>Email</strong></td>
        <td>${order.customerEmail}</td>
    </tr>
    <tr>
        <td><strong>Phone</strong></td>
        <td>${order.customerPhone}</td>
    </tr>
    ${order.orderType === 'CAKE' ? `
    <tr>
        <td><strong>Cake Type</strong></td>
        <td>${order.cakeType || 'N/A'}${order.otherCakeInput ? ` (${order.otherCakeInput})` : ''}</td>
    </tr>
    <tr>
        <td><strong>Cake Weight</strong></td>
        <td>${order.cakeWeight || 'N/A'}${order.customSizeInput ? ` - Custom: ${order.customSizeInput}` : ''}</td>
    </tr>
    ` : `
    <tr>
        <td><strong>Cookie/Brownie Type</strong></td>
        <td>${order.cookieType || 'N/A'}${order.otherCookieInput ? ` (${order.otherCookieInput})` : ''}</td>
    </tr>
    <tr>
        <td><strong>Quantity</strong></td>
        <td>${order.cookieQuantity || 'N/A'}${order.customQuantityInput ? ` - Custom: ${order.customQuantityInput}` : ''}</td>
    </tr>
    `}
    <tr>
        <td><strong>Delivery Date</strong></td>
        <td>${order.deliveryDate}</td>
    </tr>
    ${order.customization ? `
    <tr>
        <td><strong>Customization</strong></td>
        <td>${order.customization}</td>
    </tr>
    ` : ''}
    ${order.specialRequests ? `
    <tr>
        <td><strong>Special Requests</strong></td>
        <td>${order.specialRequests}</td>
    </tr>
    ` : ''}
    ${order.invoiceAmount ? `
    <tr>
        <td><strong>Invoice Amount</strong></td>
        <td>₹${order.invoiceAmount}</td>
    </tr>
    ` : ''}
    ${order.advanceAmount ? `
    <tr>
        <td><strong>Advance Amount</strong></td>
        <td>₹${order.advanceAmount}</td>
    </tr>
    ` : ''}
</table>
        `;
    },

    // Send payment received notification to admin
    async sendPaymentReceivedNotification(order) {
        const quote = this.getRandomQuote('paymentConfirmed');
        const orderTable = this.buildOrderTable(order);
        
        const emailContent = `
            <p style="font-size: 16px; color: #555;">Hello Admin,</p>
            <p style="font-size: 16px; color: #555;">💰 <strong>Advance Payment Received!</strong></p>
            <p style="font-size: 16px; color: #555;">The advance payment of <strong>₹${order.advanceAmount}</strong> has been received for the following order:</p>
            ${orderTable}
            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0; color: #155724;">✅ Payment Details</h3>
                <p style="margin: 10px 0; color: #155724;"><strong>Advance Amount Received:</strong> ₹${order.advanceAmount}</p>
                <p style="margin: 10px 0; color: #155724;"><strong>Total Invoice Amount:</strong> ₹${order.invoiceAmount}</p>
                <p style="margin: 10px 0; color: #155724;"><strong>Remaining Balance:</strong> ₹${order.invoiceAmount - order.advanceAmount}</p>
            </div>
            <p style="font-size: 16px; color: #555;">The order is now confirmed and you can proceed with preparing the cake.</p>
        `;

        const emailHTML = this.buildEmailHTML(
            'Advance Payment Received! 💰',
            '✅',
            emailContent,
            quote,
            false,
            false
        );

        const emailData = {
            subject: `Advance Payment Received - Order ${order.orderId}`,
            email: 'k.kajalranjan@gmail.com',
            message: emailHTML
        };

        try {
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not available');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            if (!this.isInitialized) {
                this.init();
                if (!this.isInitialized) {
                    return { success: false, message: 'EmailJS initialization failed' };
                }
            }
            
            const response = await emailjsLib.send(
                this.config.serviceId,
                this.config.templateId,
                emailData
            );
            console.log('✅ Payment received notification sent to admin successfully:', response);
            return { success: true, response: response };
        } catch (error) {
            console.error('❌ Error sending payment notification:', error);
            console.error('❌ Error details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            return { success: false, message: error.text || error.message || 'Unknown error' };
        }
    },

    // Send order notification to admin
    async sendOrderNotification(orderData) {
        console.log('📧 sendOrderNotification called with:', orderData);
        console.log('📧 EmailJS initialized:', this.isInitialized);
        console.log('📧 Service ID:', this.config.serviceId);
        console.log('📧 Template ID:', this.config.templateId);
        
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS library not loaded!');
            return { success: false, message: 'EmailJS library not loaded' };
        }
        
        // Re-initialize if not initialized
        if (!this.isInitialized) {
            console.log('⚠️ EmailJS not initialized, attempting to initialize...');
            this.init();
            if (!this.isInitialized) {
                console.error('❌ Failed to initialize EmailJS');
                return { success: false, message: 'EmailJS initialization failed' };
            }
        }
        
        const quote = this.getRandomQuote('orderPlaced');
        const orderTable = this.buildOrderTable(orderData);
        
        const emailContent = `
            <p style="font-size: 16px; color: #555;">Hello Admin,</p>
            <p style="font-size: 16px; color: #555;">A new order has been placed! Please review the details below:</p>
            ${orderTable}
            <p style="font-size: 16px; color: #555; margin-top: 20px;"><strong>Action Required:</strong> Please log in to the admin panel to generate an invoice or take necessary action.</p>
        `;

        const emailHTML = this.buildEmailHTML(
            'New Order Received! 📝',
            '📬',
            emailContent,
            quote,
            false, // No regards for admin
            false  // No login link for admin
        );

        // EmailJS template expects: subject, email (to_email), message
        const emailData = {
            subject: `New Order Received - ${orderData.orderId}`,
            email: 'k.kajalranjan@gmail.com', // Admin email for testing
            message: emailHTML
        };
        
        console.log('📧 Sending email with data:', {
            serviceId: this.config.serviceId,
            templateId: this.config.templateId,
            to: emailData.email,
            subject: emailData.subject,
            messageLength: emailData.message.length
        });

        try {
            // Use EmailJS from CDN or local wrapper
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not available');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            const response = await emailjsLib.send(
                    this.config.serviceId,
                this.config.templateId,
                    emailData
                );
            console.log('✅ EmailJS response:', response);
            console.log('✅ Order notification email sent to admin successfully');
            return { success: true, response: response };
        } catch (error) {
            console.error('❌ Error sending order notification:', error);
            console.error('❌ Error details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            return { success: false, message: error.text || error.message || 'Unknown error' };
        }
    },

    // Send invoice email to customer
    async sendInvoiceEmail(order) {
        const quote = this.getRandomQuote('invoiceGenerated');
        const orderTable = this.buildOrderTable(order);
        
        // Use deployed QR code image URL - this will appear in emails
        const qrCodeUrl = 'https://i.postimg.cc/BnTLFRvJ/Whats-App-Image-2025-11-23-at-22-35-53-240a119c.jpg';
        const qrCodeImgHtml = `<img src="${qrCodeUrl}" alt="QR Code for Payment" style="max-width: 400px; width: 100%; height: auto; border-radius: 10px; border: 3px solid #ffc107; box-shadow: 0 5px 15px rgba(0,0,0,0.2); display: block; margin: 20px auto;" />`;
        
        const emailContent = `
            <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
            <p style="font-size: 16px; color: #555;">Great news! Your invoice has been generated for Order <strong>${order.orderId}</strong>.</p>
            ${orderTable}
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="margin-top: 0; color: #856404;">💰 Payment Instructions</h3>
                <p style="margin: 10px 0; color: #856404;"><strong>Total Invoice Amount:</strong> ₹${order.invoiceAmount}</p>
                <p style="margin: 10px 0; color: #856404;"><strong>Advance Payment Required:</strong> ₹${order.advanceAmount}</p>
                <div style="text-align: center; margin: 20px 0; padding: 20px; background: #fff; border-radius: 10px; border: 2px dashed #ffc107;">
                    <p style="margin: 0 0 15px 0; color: #856404; font-weight: 600; font-size: 1.2rem;">📱 Payment QR Code</p>
                    <p style="margin: 0 0 20px 0; color: #856404; font-size: 1rem; font-weight: 600;">Amount to Pay: ₹${order.advanceAmount}</p>
                    ${qrCodeImgHtml}
                    <p style="margin: 15px 0 10px 0; color: #856404; font-size: 1rem; font-weight: 600;">Scan to pay ₹${order.advanceAmount}</p>
                    <p style="margin: 5px 0 0 0; color: #856404; font-size: 0.9rem;">Scan this QR code using any UPI app to make the payment</p>
                    <p style="margin: 15px 0 0 0; color: #856404; font-size: 0.9rem;">After payment, please log in to your account and upload the payment proof screenshot in your order tracking section.</p>
                </div>
                <p style="margin: 15px 0 0 0; color: #856404;">Please upload your payment proof after making the advance payment to proceed with your order.</p>
            </div>
            <p style="font-size: 16px; color: #555;">We're excited to create your special cake! 🎂</p>
        `;

        const emailHTML = this.buildEmailHTML(
            'Invoice Generated! 💰',
            '📄',
            emailContent,
            quote,
            true,  // Show regards
            true   // Show login link
        );

        const emailData = {
            subject: `Invoice Generated for Order ${order.orderId} - Trawish Cakes`,
            email: order.customerEmail,
            message: emailHTML
        };
        
        console.log('📧 Sending invoice email to:', order.customerEmail);

        try {
            // Use EmailJS from CDN or local wrapper
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not loaded!');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            if (!this.isInitialized) {
                this.init();
                if (!this.isInitialized) {
                    return { success: false, message: 'EmailJS initialization failed' };
                }
            }
            
            const response = await emailjsLib.send(
                this.config.serviceId,
                this.config.templateId,
                emailData
            );
            console.log('✅ Invoice email sent to customer successfully:', response);
            return { success: true, response: response };
        } catch (error) {
            console.error('❌ Error sending invoice email:', error);
            console.error('❌ Error details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            return { success: false, message: error.text || error.message || 'Unknown error' };
        }
    },

    // Send order status update to customer
    async sendStatusUpdate(order, status) {
        let title, emoji, content, quoteType;
        
        switch(status) {
            case 3: // Payment Confirmed
                title = 'Payment Confirmed! ✅';
                emoji = '✅';
                quoteType = 'paymentConfirmed';
                content = `
                    <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
                    <p style="font-size: 16px; color: #555;">Excellent news! Your advance payment has been received and verified for Order <strong>${order.orderId}</strong>.</p>
                    ${this.buildOrderTable(order)}
                    <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="margin-top: 0; color: #155724;">🎉 Order Confirmed!</h3>
                        <p style="margin: 10px 0; color: #155724;">Your order is now confirmed and we've started working on your special cake!</p>
                        <p style="margin: 10px 0; color: #155724;">We'll keep you updated on the progress. You'll receive a notification when your cake is ready for pickup.</p>
                    </div>
                `;
                break;
                
            case 4: // Order Ready
                title = 'Your Cake is Ready! 🎂';
                emoji = '🎂';
                quoteType = 'orderReady';
                content = `
                    <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
                    <p style="font-size: 16px; color: #555;">🎉 Exciting news! Your cake is ready for pickup!</p>
                    ${this.buildOrderTable(order)}
                    <div style="background: #cfe2ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0d6efd;">
                        <h3 style="margin-top: 0; color: #084298;">📍 Pickup Information</h3>
                        <p style="margin: 10px 0; color: #084298;"><strong>Address:</strong> 1103 Solacia Phase 1 Solacia Internal Road, RMC Garden, Wagholi, Wagholi, Pune, Maharashtra 412207, India</p>
                        <p style="margin: 10px 0; color: #084298;">Please come and collect your delicious cake at your earliest convenience!</p>
                    </div>
                    <p style="font-size: 16px; color: #555;">We can't wait for you to see your beautiful cake! 🎂✨</p>
                `;
                break;
                
            case 5: // Order Delivered
                title = 'Thank You! 🎉';
                emoji = '🎉';
                quoteType = 'orderDelivered';
                const ratingLink = `${window.location.origin || ''}${window.location.pathname}#accounts&rate=${order.orderId}`;
                content = `
                    <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
                    <p style="font-size: 16px; color: #555;">Thank you for choosing Trawish Cakes! We hope your cake made your celebration extra special! 🎂</p>
                    ${this.buildOrderTable(order)}
                    <div style="background: #d1e7dd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #198754;">
                        <h3 style="margin-top: 0; color: #0f5132;">💝 We Appreciate Your Business!</h3>
                        <p style="margin: 10px 0; color: #0f5132;">We're honored to have been part of your special celebration. We hope you enjoyed every slice!</p>
                        <p style="margin: 10px 0; color: #0f5132;">Your feedback means the world to us! Please take a moment to rate your experience.</p>
                    </div>
                    <div style="text-align: center; margin: 25px 0; padding: 20px; background: #fff3cd; border-radius: 10px;">
                        <h3 style="color: #856404; margin-top: 0;">⭐ Rate Your Experience</h3>
                        <p style="color: #856404; margin-bottom: 15px;">Help us improve by sharing your feedback!</p>
                        <p style="color: #856404; font-size: 14px;">Log in to your account to rate this order and leave a review.</p>
                    </div>
                `;
                break;
                
            default:
                title = 'Order Status Update';
                emoji = '📋';
                quoteType = 'orderPlaced';
                content = `
                    <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
                    <p style="font-size: 16px; color: #555;">Your order status has been updated.</p>
                    ${this.buildOrderTable(order)}
                `;
        }
        
        const quote = this.getRandomQuote(quoteType);
        const emailHTML = this.buildEmailHTML(title, emoji, content, quote, true, true);

        const emailData = {
            subject: `${title} - Order ${order.orderId}`,
            email: order.customerEmail,
            message: emailHTML
        };
        
        console.log(`📧 Sending status update email (status ${status}) to:`, order.customerEmail);

        try {
            // Use EmailJS from CDN or local wrapper
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not loaded!');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            if (!this.isInitialized) {
                this.init();
                if (!this.isInitialized) {
                    return { success: false, message: 'EmailJS initialization failed' };
                }
            }
            
            const response = await emailjsLib.send(
                this.config.serviceId,
                this.config.templateId,
                emailData
            );
            console.log(`✅ Status update email (status ${status}) sent to customer successfully:`, response);
            return { success: true, response: response };
        } catch (error) {
            console.error('❌ Error sending status update:', error);
            console.error('❌ Error details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            return { success: false, message: error.text || error.message || 'Unknown error' };
        }
    },

    // Send order rejection email
    async sendRejectionEmail(order) {
        const quote = this.getRandomQuote('rejection');
        const orderTable = this.buildOrderTable(order);
        
        const emailContent = `
            <p style="font-size: 16px; color: #555;">Dear ${order.customerName},</p>
            <p style="font-size: 16px; color: #555;">We regret to inform you that your order <strong>${order.orderId}</strong> has been rejected.</p>
            ${orderTable}
            <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="margin-top: 0; color: #721c24;">Rejection Reason</h3>
                <p style="margin: 10px 0; color: #721c24;">${order.rejectionReason || 'Not specified'}</p>
            </div>
            <p style="font-size: 16px; color: #555;">If you have any questions or concerns, please feel free to contact us at trawishcakes@gmail.com</p>
            <p style="font-size: 16px; color: #555;">We hope to serve you in the future! 🙏</p>
        `;

        const emailHTML = this.buildEmailHTML(
            'Order Update',
            '😔',
            emailContent,
            quote,
            true,  // Show regards
            false  // No login link for rejection
        );

        const emailData = {
            subject: `Order Update - ${order.orderId} - Trawish Cakes`,
            email: order.customerEmail,
            message: emailHTML
        };
        
        console.log('📧 Sending rejection email to:', order.customerEmail);

        try {
            // Use EmailJS from CDN or local wrapper
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not loaded!');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            if (!this.isInitialized) {
                this.init();
                if (!this.isInitialized) {
                    return { success: false, message: 'EmailJS initialization failed' };
                }
            }
            
            const response = await emailjsLib.send(
                this.config.serviceId,
                this.config.templateId,
                emailData
            );
            console.log('✅ Rejection email sent to customer successfully:', response);
            return { success: true, response: response };
        } catch (error) {
            console.error('❌ Error sending rejection email:', error);
            console.error('❌ Error details:', {
                status: error.status,
                text: error.text,
                message: error.message
            });
            return { success: false, message: error.text || error.message || 'Unknown error' };
        }
    },

    // Send password reset email
    async sendPasswordResetEmail(email, username, resetLink) {
        const emailContent = `
            <p style="font-size: 16px; color: #555;">Dear ${username},</p>
            <p style="font-size: 16px; color: #555;">You have requested to reset your password for your Trawish Cakes account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: 600;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #888;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
        `;

        const emailHTML = this.buildEmailHTML(
            'Password Reset Request',
            '🔐',
            emailContent,
            null,
            true,
            false
        );

        const emailData = {
            subject: 'Trawish Cakes - Password Reset Request',
            email: email,
            message: emailHTML
        };

        try {
            // Use EmailJS from CDN or local wrapper
            const emailjsLib = typeof emailjs !== 'undefined' ? emailjs : (typeof EmailJS !== 'undefined' ? EmailJS : null);
            
            if (!emailjsLib) {
                console.error('❌ EmailJS library not loaded!');
                return { success: false, message: 'EmailJS library not loaded' };
            }
            
            // Initialize if not already initialized
            if (!this.isInitialized) {
                console.log('🔄 Initializing EmailJS for password reset...');
                const initResult = this.init();
                if (!initResult) {
                    console.error('❌ Failed to initialize EmailJS');
                    return { success: false, message: 'Email service initialization failed' };
                }
            }
            
            if (this.isInitialized) {
                // EmailJS template expects: subject, email (to_email), message
                // Match the pattern used in sendOrderNotification
                const emailDataForSend = {
                    subject: emailData.subject,
                    email: email, // This is the 'to_email' field for EmailJS template
                    message: emailData.message,
                    to_name: username,
                    reset_link: resetLink
                };
                
                console.log('📧 Sending password reset email to:', email);
                console.log('📧 Using service:', this.config.serviceId);
                console.log('📧 Using template:', this.config.templateId);
                
                try {
                    const response = await emailjsLib.send(
                        this.config.serviceId,
                        this.config.templateId,
                        emailDataForSend
                    );
                    console.log('✅ Password reset email sent successfully!', response);
                    console.log('✅ Response status:', response.status);
                    console.log('✅ Response text:', response.text);
                    return { success: true };
                } catch (sendError) {
                    console.error('❌ Error sending password reset email:', sendError);
                    console.error('❌ Error details:', {
                        status: sendError.status,
                        text: sendError.text,
                        message: sendError.message
                    });
                    return { success: false, message: sendError.text || sendError.message || 'Failed to send email' };
                }
            } else {
                console.error('❌ EmailJS not initialized, password reset email skipped');
                return { success: false, message: 'Email service not initialized' };
            }
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, message: error.message };
        }
    }
};

// Initialize EmailJS service when library is available
function initializeEmailService() {
    if (typeof emailjs !== 'undefined') {
        console.log('📧 EmailJS library found, initializing service...');
        const success = TrawishEmailService.init();
        if (success && TrawishEmailService.isInitialized) {
            console.log('✅ TrawishEmailService initialized successfully');
        } else {
            console.warn('⚠️ TrawishEmailService initialization failed, will retry...');
        }
    } else {
        console.warn('⚠️ EmailJS library not found, waiting for it to load...');
    }
}

// Try to initialize when page loads
if (typeof window !== 'undefined') {
    // Try immediately
    initializeEmailService();
    
    // Also try on window load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!TrawishEmailService.isInitialized) {
                initializeEmailService();
            }
        }, 100);
    });
    
    // Retry after a delay in case scripts load asynchronously
    setTimeout(() => {
        if (!TrawishEmailService.isInitialized && typeof emailjs !== 'undefined') {
            console.log('📧 Retrying EmailJS initialization...');
            initializeEmailService();
        }
    }, 1000);
} else {
    // Node.js or other environment
    initializeEmailService();
}
