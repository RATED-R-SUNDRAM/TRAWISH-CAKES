# 🔒 Firebase Firestore Security Rules for Trawish Cakes

## ⚠️ **Current Error: "Missing or insufficient permissions"**

This error occurs because Firestore security rules are blocking writes. Follow these steps to fix:

---

## 🚀 **Quick Fix: Update Firestore Security Rules**

### **Step 1: Go to Firebase Console**
1. Open https://console.firebase.google.com
2. Select your project: **"trawish-cakes"**
3. Click **"Build"** → **"Firestore Database"**
4. Click on **"Rules"** tab

### **Step 2: Replace Rules with This Code**

**IMPORTANT**: Copy and paste these exact rules into your Firestore Rules editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      // Allow read: user can read their own data, or admin can read any user
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || 
                      isAdmin() ||
                      resource.data.username == 'kajal_tonu');
      
      // Allow create: anyone can create a user account (for signup)
      allow create: if request.resource.data.keys().hasAll(['username', 'email', 'password', 'isAdmin', 'createdAt']);
      
      // Allow update: user can update their own data, or admin can update any
      allow update: if isAuthenticated() && 
                       (request.auth.uid == userId || 
                        isAdmin() ||
                        request.resource.data.username == 'kajal_tonu');
      
      // Allow delete: only admin
      allow delete: if isAdmin();
    }
    
    // Orders collection - ALL ORDERS FROM ALL USERS
    match /orders/{orderId} {
      // Allow read: user can read their own orders, admin can read all
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || 
                      isAdmin());
      
      // Allow create: authenticated users can create orders
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Allow update: user can update their own order, or admin can update any
      allow update: if isAuthenticated() && 
                       (resource.data.userId == request.auth.uid || 
                        isAdmin());
      
      // Allow delete: only admin
      allow delete: if isAdmin();
    }
    
    // Ratings collection
    match /ratings/{ratingId} {
      // Allow read: anyone can read ratings (for displaying reviews)
      allow read: if true;
      
      // Allow create: authenticated users can create ratings
      allow create: if isAuthenticated();
      
      // Allow update/delete: only admin
      allow update, delete: if isAdmin();
    }
    
    // Reset tokens collection
    match /reset_tokens/{tokenId} {
      // Allow read: user can read their own tokens
      allow read: if isAuthenticated() && 
                     resource.data.email == request.auth.token.email;
      
      // Allow create: anyone can create reset tokens (for password reset)
      allow create: if true;
      
      // Allow update: user can mark their own token as used
      allow update: if isAuthenticated() && 
                       resource.data.email == request.auth.token.email;
      
      // Allow delete: admin or system cleanup
      allow delete: if isAdmin();
    }
  }
}
```

### **Step 3: Publish the Rules**
1. Click **"Publish"** button
2. Wait for confirmation (usually instant)
3. Rules are now active!

---

## 🔧 **Alternative: Temporary Open Rules (For Testing Only)**

**⚠️ WARNING**: Use this ONLY for testing. **DO NOT** use in production!

If you need to test quickly, use these open rules temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**After testing, replace with the secure rules above!**

---

## 📋 **Step-by-Step Instructions**

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select: **"trawish-cakes"** project

2. **Navigate to Firestore Rules**
   - Click: **"Build"** (left sidebar)
   - Click: **"Firestore Database"**
   - Click: **"Rules"** tab (top navigation)

3. **Edit Rules**
   - Click: **"Edit rules"** button
   - Delete all existing rules
   - Paste the secure rules code above
   - Click: **"Publish"** button

4. **Test**
   - Go back to your website
   - Try creating an account again
   - Error should be gone!

---

## ✅ **After Updating Rules**

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Refresh the page** (F5 or Cmd+R)
3. **Try signup again** - should work now!

---

## 🔍 **Verify Rules Are Active**

1. In Firebase Console → Firestore → Rules
2. You should see: **"Rules published successfully"** timestamp
3. The rules you pasted should be visible in the editor

---

## 🐛 **Still Getting Errors?**

### **Error: "Permission denied"**
- **Cause**: Rules not published or incorrect
- **Fix**: Re-publish the rules, wait 30 seconds, refresh page

### **Error: "Firebase not initialized"**
- **Cause**: Firebase SDK not loaded
- **Fix**: Check browser console, ensure Firebase scripts are loaded

### **Error: "Collection users not found"**
- **Cause**: Collection doesn't exist yet (this is normal)
- **Fix**: Firestore creates collections automatically on first write

---

## 🔒 **Security Notes**

### **Current Rules Allow:**
- ✅ Anyone can create a user account (for signup)
- ✅ Users can read their own data
- ✅ Users can create orders
- ✅ Users can read their own orders
- ✅ Admin can read/write all data

### **Production Recommendations:**
1. **Enable Firebase Authentication** (Email/Password)
2. **Hash passwords** before storing
3. **Require authentication** for all writes
4. **Set up rate limiting** to prevent abuse
5. **Enable Firestore backups**

---

## 📞 **Need Help?**

- Firebase Docs: https://firebase.google.com/docs/firestore/security/get-started
- Firestore Rules: https://firebase.google.com/docs/firestore/security/rules-conditions

---

**After updating rules, your signup should work! 🎉**

