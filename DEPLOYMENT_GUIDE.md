# 🚀 Trawish Cakes - Deployment Guide

Complete step-by-step guide to deploy your Trawish Cakes website to **Netlify** or **GitHub Pages**.

---

## 📋 Pre-Deployment Checklist

### 1. Clear Browser Data (Important!)
Before pushing to GitHub, clear all test orders from your browser's localStorage:

#### Option A: Using Browser Console (Recommended)
1. Open your website in the browser
2. Press `F12` or `Right-click → Inspect` to open Developer Tools
3. Go to the **Console** tab
4. Type and press Enter:
   ```javascript
   DB.clearAllOrders()
   ```
5. You should see: `{success: true, message: 'All orders cleared'}`
6. Refresh the admin dashboard - it should show "No orders yet"

#### Option B: Clear All localStorage
1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → `http://localhost` or your file path
4. Delete these keys:
   - `trawish_orders`
   - `trawish_ratings` (optional)
   - `trawish_reset_tokens` (optional)
5. **Keep** `trawish_users` (contains admin account)

---

## 🌐 Deployment Option 1: Netlify (Recommended - Easiest)

### Why Netlify?
- ✅ Free SSL certificate
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Easy drag-and-drop deployment
- ✅ Auto-deploy from GitHub
- ✅ Fast CDN
- ✅ Forms handling (if needed later)

### Step-by-Step Guide

#### **Step 1: Prepare Your Files**
1. Make sure all your files are ready in the project folder
2. Ensure no sensitive data (passwords, API keys) are hardcoded
3. Test locally that everything works

#### **Step 2: Push to GitHub (If not done)**
1. Open Terminal/Command Prompt in your project folder
2. Initialize git (if not done):
   ```bash
   git init
   ```
3. Add all files:
   ```bash
   git add .
   ```
4. Commit:
   ```bash
   git commit -m "Initial commit - Trawish Cakes website"
   ```
5. Create a repository on GitHub:
   - Go to https://github.com/new
   - Name it: `trawish-cakes` (or any name)
   - Don't initialize with README
   - Click "Create repository"
6. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/trawish-cakes.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

#### **Step 3: Deploy to Netlify via Drag-and-Drop**

##### **Method A: Simple Drag-and-Drop (Fastest)**
1. Go to https://app.netlify.com
2. Sign up/Sign in (use GitHub account for easier setup)
3. On the dashboard, scroll down to find **"Sites"**
4. Drag and drop your entire project folder onto the **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"** area
5. Wait for deployment (takes 1-2 minutes)
6. Your site will be live at: `https://random-name-12345.netlify.app`
7. Click **"Site settings"** → **"Change site name"** to customize the URL (e.g., `trawish-cakes.netlify.app`)

##### **Method B: Connect to GitHub (Auto-Deploy)**
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your repositories
5. Select your `trawish-cakes` repository
6. Configure build settings:
   - **Build command:** Leave empty (static site)
   - **Publish directory:** `/` (root folder)
7. Click **"Deploy site"**
8. Your site will auto-deploy whenever you push to GitHub!

#### **Step 4: Configure Netlify Settings**
1. Go to **Site settings** → **Domain settings**
2. Click **"Options"** → **"Edit site name"** to customize URL
3. (Optional) Add custom domain:
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `trawishcakes.com`)
   - Follow DNS configuration instructions

#### **Step 5: Update EmailJS Settings (If needed)**
- Your EmailJS configuration should work automatically
- If emails don't work, check:
  - EmailJS Public Key in `email-service.js`
  - EmailJS Service ID and Template ID
  - Make sure EmailJS allows your domain in settings

#### **Step 6: Test Your Deployed Site**
1. Visit your Netlify URL
2. Test all features:
   - ✅ Home page loads correctly
   - ✅ Gallery displays images
   - ✅ Order form works
   - ✅ Login/Signup works
   - ✅ Admin login works (`kajal_tonu` / `chicku_ishi`)
   - ✅ Email notifications work

---

## 🐙 Deployment Option 2: GitHub Pages

### Why GitHub Pages?
- ✅ Free hosting
- ✅ Easy to set up
- ✅ Automatic SSL
- ✅ Directly from GitHub repo

### Limitations:
- ❌ No server-side processing
- ❌ Requires `index.html` in root or `docs` folder

### Step-by-Step Guide

#### **Step 1: Prepare Your Repository**
1. Ensure all files are pushed to GitHub (see Step 2 in Netlify guide)

#### **Step 2: Configure GitHub Pages**
1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section (left sidebar)
4. Under **"Source"**, select:
   - **Branch:** `main` (or `master`)
   - **Folder:** `/ (root)` or `/docs` if you moved files there
5. Click **"Save"**

#### **Step 3: Wait for Deployment**
- GitHub Pages takes 1-5 minutes to build
- You'll see a green checkmark when ready
- Your site will be live at: `https://YOUR_USERNAME.github.io/trawish-cakes/`

#### **Step 4: Update File Paths (If needed)**
If your site doesn't load correctly, you might need to update paths:
- Change `href="styles.css"` to `href="./styles.css"` or `href="/trawish-cakes/styles.css"`
- Update image paths if needed
- Test all pages

#### **Step 5: Custom Domain (Optional)**
1. In GitHub Pages settings, add your custom domain
2. Update DNS records at your domain provider
3. Wait for DNS propagation (can take 24 hours)

---

## 🔧 Post-Deployment Configuration

### 1. EmailJS Domain Whitelist
1. Go to https://dashboard.emailjs.com/admin
2. Add your deployed domain to **"Allowed origins"**
   - Example: `https://trawish-cakes.netlify.app`
   - Or: `https://your-username.github.io`

### 2. Update Email Links
If you hardcoded any `localhost` URLs in emails, update them:
- Find in `email-service.js` any `localhost` references
- Replace with your actual deployed URL

### 3. Test Admin Access
1. Visit your deployed site
2. Click **LOGIN**
3. Use admin credentials:
   - Username: `kajal_tonu`
   - Password: `chicku_ishi`
4. Verify admin dashboard loads correctly

---

## 📱 Testing Checklist

After deployment, test these features:

### Home Page
- [ ] Cake animation plays correctly
- [ ] Background images load
- [ ] Gallery displays all images
- [ ] Navigation works

### User Features
- [ ] Sign up works
- [ ] Login works
- [ ] Forgot password works
- [ ] Place order form works
- [ ] My Orders displays correctly

### Admin Features
- [ ] Admin login works
- [ ] Orders list displays
- [ ] Invoice generation works
- [ ] Payment confirmation works
- [ ] Order status updates work
- [ ] Email notifications sent

### Images & Assets
- [ ] Logo displays correctly
- [ ] Gallery images load from `CAKE IMAGES` folder
- [ ] All CSS animations work
- [ ] Responsive design works on mobile

### Email Functionality
- [ ] Order notification emails sent
- [ ] Invoice emails sent
- [ ] Status update emails sent
- [ ] Email formatting looks good (HTML)

---

## 🐛 Troubleshooting

### Images Not Loading
**Problem:** Gallery images don't show
**Solution:**
- Check file paths are correct
- Ensure `CAKE IMAGES` folder is uploaded
- Check folder name has spaces (might need to URL encode)

### Emails Not Sending
**Problem:** EmailJS not working
**Solution:**
1. Check EmailJS public key is correct
2. Add domain to EmailJS whitelist
3. Check browser console for errors
4. Verify EmailJS service/template IDs

### localStorage Not Working
**Problem:** Users/orders not saving
**Solution:**
- localStorage works on all modern browsers
- Make sure you're not in private/incognito mode
- Check browser console for errors

### Admin Dashboard Empty
**Problem:** No orders showing
**Solution:**
- This is normal! localStorage is per-browser
- Create a test order on the deployed site
- Orders will be separate for each user's browser

### GitHub Pages 404 Error
**Problem:** Pages return 404
**Solution:**
- Ensure `index.html` is in root or `docs` folder
- Check GitHub Pages source is set correctly
- Wait a few minutes and refresh
- Clear browser cache

---

## 🔐 Security Notes

### Important Reminders:
- ✅ Admin password is stored in localStorage (not secure for production)
- ✅ No sensitive data in code (EmailJS keys are public anyway)
- ✅ EmailJS public key is safe to expose (it's meant to be public)
- ⚠️ For production, consider adding:
  - Server-side authentication
  - Encrypted password storage
  - HTTPS (automatic with Netlify/GitHub Pages)

---

## 📞 Need Help?

### Common Issues:
1. **"Site not found"** → Check URL spelling
2. **"Images broken"** → Check folder paths and names
3. **"Emails not working"** → Verify EmailJS configuration
4. **"Can't login"** → Check admin credentials are correct

### Resources:
- Netlify Docs: https://docs.netlify.com
- GitHub Pages Docs: https://docs.github.com/pages
- EmailJS Docs: https://www.emailjs.com/docs/

---

## 🎉 You're Done!

Your Trawish Cakes website is now live! Share the URL with your customers and start taking orders! 🎂✨

---

## 📝 Quick Reference

### Netlify Deployment
```
URL: https://YOUR-SITE-NAME.netlify.app
Dashboard: https://app.netlify.com
```

### GitHub Pages Deployment
```
URL: https://YOUR-USERNAME.github.io/REPO-NAME
Settings: Repository → Settings → Pages
```

### Admin Credentials
```
Username: kajal_tonu
Password: chicku_ishi
```

### Clear Orders (Browser Console)
```javascript
DB.clearAllOrders()
```

---

**Happy Deploying! 🚀🎂**

