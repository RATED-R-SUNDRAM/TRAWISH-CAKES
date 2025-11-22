// Firebase Configuration
// Trawish Cakes - Centralized Database Configuration

const firebaseConfig = {
    apiKey: "AIzaSyCkOt1HGl0YzRtveYQwYh0v-clcofH83So",
    authDomain: "trawish-cakes.firebaseapp.com",
    projectId: "trawish-cakes",
    storageBucket: "trawish-cakes.firebasestorage.app",
    messagingSenderId: "181620933220",
    appId: "1:181620933220:web:80767e5f16892c22d15571",
    measurementId: "G-4VKKVH7RYP"
};

// Initialize Firebase when SDK loads
let app = null;
let db = null;
let auth = null;
let isInitialized = false;

// Initialize Firebase
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded!');
        return false;
    }
    
    try {
        // Check if already initialized
        if (firebase.apps.length === 0) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        
        db = firebase.firestore();
        auth = firebase.auth();
        isInitialized = true;
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        isInitialized = false;
        return false;
    }
}

// Get Firestore database instance
function getFirestore() {
    if (!isInitialized) {
        initializeFirebase();
    }
    return db;
}

// Get Firebase Auth instance
function getAuth() {
    if (!isInitialized) {
        initializeFirebase();
    }
    return auth;
}

// Check if Firebase is available
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && isInitialized && db !== null && auth !== null;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
    // DOM already loaded, initialize immediately
    setTimeout(initializeFirebase, 100);
}
