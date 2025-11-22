# 🔥 Firebase Setup Guide for Trawish Cakes

Complete guide to set up Firebase for centralized database and authentication.

---

## 📋 What Changed

### ✅ **Before (localStorage)**:
- ❌ Data stored in browser (localStorage)
- ❌ Each browser has separate data
- ❌ Admin can't see orders from all users
- ❌ Status updates only in one browser

### ✅ **After (Firebase)**:
- ✅ Centralized database (Firestore)
- ✅ All orders visible to admin from any browser
- ✅ Status updates reflected everywhere in real-time
- ✅ Users can access their orders from any browser
- ✅ Real-time synchronization

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Firebase Project**

1. Go to https://console.firebase.google.com
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Trawish Cakes"** (or any name)
4. Click **"Continue"**
5. **Disable Google Analytics** (optional, can enable later)
6. Click **"Create project"**
7. Wait for project creation (takes ~30 seconds)
8. Click **"Continue"**

---

### **Step 2: Enable Firestore Database**

1. In Firebase Console, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for now)
4. Choose a **location** closest to you (e.g., `asia-south1` for India)
5. Click **"Enable"**
6. Wait for database creation (~30 seconds)

**Important**: We'll set up security rules later.

---

### **Step 3: Get Firebase Configuration**

1. In Firebase Console, click the **⚙️ (Settings)** icon → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"</>" (Web icon)** to add a web app
4. Enter app nickname: **"Trawish Cakes Web"**
5. **Check** "Also set up Firebase Hosting" (optional)
6. Click **"Register app"**
7. **Copy the configuration object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

---

### **Step 4: Update firebase-config.js**

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_ACTUAL_PROJECT_ID",
    storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

**Save the file!**

---

### **Step 5: Set Up Firestore Security Rules (IMPORTANT!)**

**⚠️ This step is CRITICAL - Without these rules, signup won't work!**

1. In Firebase Console, go to **"Firestore Database"** → **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection
    match /users/{userId} {
      // Allow read: user can read their own data, or admin can read any
      allow read: if true; // Temporarily allow all reads for testing
      
      // Allow create: anyone can create a user account (for signup)
      // This is required because signup happens before authentication
      allow create: if request.resource.data.keys().hasAll(['username', 'email', 'password', 'isAdmin', 'createdAt']);
      
      // Allow update: user can update their own data, or admin can update any
      allow update: if true; // Temporarily allow for testing - update after enabling auth
      
      // Allow delete: only for testing (should be admin-only in production)
      allow delete: if true;
    }
    
    // Orders collection - ALL ORDERS FROM ALL USERS
    match /orders/{orderId} {
      // Allow read: anyone authenticated (for now, allow all for testing)
      allow read: if true;
      
      // Allow create: anyone can create orders (user must be authenticated via your system)
      allow create: if true;
      
      // Allow update: user can update their own order, or admin can update any
      allow update: if true;
      
      // Allow delete: only admin (allow all for testing)
      allow delete: if true;
    }
    
    // Ratings collection
    match /ratings/{ratingId} {
      // Allow read: anyone can read ratings (for displaying reviews)
      allow read: if true;
      
      // Allow create: authenticated users can create ratings
      allow create: if true;
      
      // Allow update/delete: admin only (allow all for testing)
      allow update, delete: if true;
    }
    
    // Reset tokens collection
    match /reset_tokens/{tokenId} {
      // Allow all operations for password reset
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANT NOTES:**
- These rules allow **public access** for testing and development
- **For production**, you MUST update these rules to require authentication
- The rules above will fix your signup error immediately

3. Click **"Publish"** button
4. Wait for confirmation
5. **Refresh your website** and try signup again - it should work now!

3. Click **"Publish"**

---

### **Step 6: Set Up Firestore Indexes**

Firestore needs indexes for queries. Firebase will prompt you when needed, but you can create them manually:

1. Go to **"Firestore Database"** → **"Indexes"** tab
2. Click **"Create Index"**
3. Create these indexes:

**Index 1: Orders by userId**
- Collection: `orders`
- Fields to index:
  - `userId` (Ascending)
  - `createdAt` (Descending)
- Click **"Create"**

**Index 2: Users by username**
- Collection: `users`
- Fields to index:
  - `username` (Ascending)
- Click **"Create"**

**Index 3: Users by email**
- Collection: `users`
- Fields to index:
  - `email` (Ascending)
- Click **"Create"**

Wait for indexes to build (can take a few minutes).

---

### **Step 7: Test the Setup**

1. Open `index.html` in your browser
2. Open Developer Tools (F12) → **Console** tab
3. You should see: **"✅ Firebase initialized successfully"**
4. If you see errors, check:
   - Firebase config is correct in `firebase-config.js`
   - Firestore database is created
   - Internet connection is active

---

## 📊 Database Collections Structure

After setup, your Firestore will have these collections:

### **`users` Collection**
```
users/
  └── {userId}/
      ├── username: string
      ├── email: string
      ├── password: string (hashed in production)
      ├── isAdmin: boolean
      └── createdAt: timestamp
```

### **`orders` Collection**
```
orders/
  └── {orderId}/
      ├── orderId: string (custom ID)
      ├── userId: string
      ├── customerName: string
      ├── customerEmail: string
      ├── customerPhone: string
      ├── cakeType: string
      ├── cakeWeight: string
      ├── deliveryDate: string
      ├── customization: string
      ├── specialRequests: string
      ├── sampleImage: string (base64)
      ├── status: number (0-5)
      ├── invoiceAmount: number
      ├── advanceAmount: number
      ├── advancePaymentProof: string (base64)
      ├── rejectionReason: string
      ├── rating: number (1-5)
      ├── ratingComment: string
      ├── ratingSubmittedAt: timestamp
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

### **`ratings` Collection**
```
ratings/
  └── {ratingId}/
      ├── orderId: string
      ├── customerName: string
      ├── customerEmail: string
      ├── rating: number
      ├── comment: string
      └── submittedAt: timestamp
```

### **`reset_tokens` Collection**
```
reset_tokens/
  └── {tokenId}/
      ├── email: string
      ├── token: string
      ├── expiresAt: timestamp
      ├── used: boolean
      └── createdAt: timestamp
```

---

## ✅ Post-Setup Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Firebase config updated in `firebase-config.js`
- [ ] Security rules configured
- [ ] Indexes created (if needed)
- [ ] Test: Firebase initializes successfully
- [ ] Test: Create a test user account
- [ ] Test: Place a test order
- [ ] Test: Order appears in admin dashboard
- [ ] Test: Status update from admin reflects in user dashboard

---

## 🔒 Security Notes

### **Current Setup (Development)**
- Rules allow public access for testing
- Passwords stored in plain text (change in production)

### **Production Recommendations**
1. **Hash passwords** before storing
2. **Enable Firebase Authentication** (Email/Password)
3. **Update security rules** to require authentication
4. **Enable Firestore backups**
5. **Set up monitoring and alerts**

---

## 🐛 Troubleshooting

### **Error: "Firebase: Error (auth/network-request-failed)"**
- **Solution**: Check internet connection
- **Solution**: Verify Firebase config is correct

### **Error: "Firebase: Error (permission-denied)"**
- **Solution**: Check Firestore security rules
- **Solution**: Verify indexes are created

### **Error: "Firebase is not defined"**
- **Solution**: Ensure Firebase SDK scripts are loaded before `firebase-config.js`
- **Solution**: Check script order in HTML files

### **Orders not appearing in admin dashboard**
- **Solution**: Check browser console for errors
- **Solution**: Verify Firestore collections exist
- **Solution**: Check security rules allow reading orders

### **Real-time updates not working**
- **Solution**: Ensure `DB.onOrdersUpdate()` is called
- **Solution**: Check Firestore listener is set up correctly
- **Solution**: Verify security rules allow listening to changes

---

## 📝 Important Notes

1. **Firebase Free Tier**:
   - 50,000 reads/day
   - 20,000 writes/day
   - 20,000 deletes/day
   - 1 GB storage
   - Perfect for small/medium businesses

2. **Data Migration**:
   - Old localStorage data will not migrate automatically
   - Each browser will start fresh with Firebase
   - Previous test orders will not appear in Firebase

3. **Admin Credentials**:
   - Admin user (`kajal_tonu` / `chicku_ishi`) will be auto-created in Firebase on first visit
   - Admin account is shared across all browsers (stored in Firestore)

4. **Real-time Updates**:
   - Changes appear automatically (no page refresh needed)
   - Works across all browsers and devices
   - Updates are instant

---

## 🎉 You're Done!

After setup:
- ✅ All orders are centralized in Firebase
- ✅ Admin sees orders from all users
- ✅ Status updates reflect everywhere in real-time
- ✅ Users can access orders from any browser

**Ready to deploy?** Follow `DEPLOYMENT_GUIDE.md` for deployment instructions.

---

## 📞 Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Firestore Docs: https://firebase.google.com/docs/firestore
- Firebase Console: https://console.firebase.google.com

---

**Your Trawish Cakes website now has a centralized database! 🎂✨**

