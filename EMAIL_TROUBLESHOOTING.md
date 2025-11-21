# Email Troubleshooting Guide

## Issue: Emails Not Being Received

### Step 1: Check Browser Console
1. Open your website (index.html or admin.html)
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Look for any error messages related to EmailJS

### Step 2: Use the Debug Tool
1. Open `email-debug.html` in your browser
2. Click each button in order:
   - "Check EmailJS Library" - Should show ✅
   - "Initialize EmailJS" - Should show ✅
   - "Test Email Service" - Should show ✅
   - "Send Test Email" - This will actually send an email

### Step 3: Verify EmailJS Template Configuration

Your EmailJS template should have these variables (which you already have ✅):
- `{{subject}}` - Email subject ✅
- `{{email}}` - Recipient email (To Email) ✅
- `{{message}}` - Email content (HTML) ✅

**⚠️ CRITICAL: Enable HTML in Your Template!**

Your template currently shows `{{message}}` in the content area. To receive HTML-formatted emails:

1. In EmailJS dashboard, go to your template `template_5iwy6n5`
2. Click on the "Content" tab
3. Look for "Edit Content" button (pencil icon)
4. In the content editor, make sure HTML is enabled:
   - Look for a toggle/checkbox that says "HTML" or "Enable HTML"
   - OR look for "Content Type" and set it to "HTML" instead of "Plain Text"
5. Save the template

**If HTML is not enabled, emails will be sent as plain text (showing HTML code instead of formatted emails)**

### Step 4: Check EmailJS Dashboard

1. Go to https://dashboard.emailjs.com
2. Check your service `service_ge2gknw`:
   - Is it active?
   - Is it connected to your Gmail account?
3. Check your template `template_5iwy6n5`:
   - Does it have the variables: `{{subject}}`, `{{email}}`, `{{message}}`?
   - Is "Enable HTML" turned ON?

### Step 5: Verify Public Key

Your public key is: `gk25DG3678o3wd9yM`

Check in EmailJS dashboard:
1. Go to Account → General
2. Verify your Public Key matches

### Step 6: Test with Simple Email

If emails still don't work, try this simple test in the browser console:

```javascript
// Initialize EmailJS
emailjs.init("gk25DG3678o3wd9yM");

// Send a simple test email
emailjs.send("service_ge2gknw", "template_5iwy6n5", {
    subject: "Test Email",
    email: "ratedrsundram@gmail.com",
    message: "This is a test"
}).then(
    function(response) {
        console.log("SUCCESS!", response.status, response.text);
    },
    function(error) {
        console.log("FAILED...", error);
    }
);
```

### Common Issues and Solutions

#### Issue: "EmailJS library not loaded"
**Solution:** Make sure the EmailJS CDN script is included before email-service.js:
```html
<script src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script src="email-service.js"></script>
```

#### Issue: "Status 400" error
**Solution:** Template variables don't match. Check that your template uses:
- `{{subject}}` (not `{{to_subject}}` or `{{email_subject}}`)
- `{{email}}` (not `{{to_email}}` or `{{recipient_email}}`)
- `{{message}}` (not `{{content}}` or `{{body}}`)

#### Issue: "Status 401" error
**Solution:** Public key is incorrect or expired. Verify in EmailJS dashboard.

#### Issue: "Status 404" error
**Solution:** Service ID or Template ID is incorrect. Double-check:
- Service ID: `service_ge2gknw`
- Template ID: `template_5iwy6n5`

#### Issue: Emails sent but not received
**Solution:** 
1. Check spam/junk folder
2. Verify email address is correct
3. Check EmailJS dashboard for sent emails log
4. Make sure Gmail service is properly connected

### Testing Checklist

- [ ] EmailJS library loads (check console)
- [ ] EmailJS initializes (check console)
- [ ] Service ID is correct
- [ ] Template ID is correct
- [ ] Public key is correct
- [ ] Template variables match: `{{subject}}`, `{{email}}`, `{{message}}`
- [ ] Template has HTML enabled
- [ ] Gmail service is connected
- [ ] Test email sends successfully (use email-debug.html)
- [ ] Check spam folder if email not received

### Next Steps

1. Run `email-debug.html` and check the console output
2. Share the console errors (if any) for further debugging
3. Verify EmailJS template configuration matches the variables above

